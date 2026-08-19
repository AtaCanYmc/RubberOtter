import { ConnectionState, LogEntry } from '../../@types/bluetooth';
import { PROTOCOL_NAMES } from '../../protocol/byteMap';
import { bytesToHex } from '../../protocol/packetEncoder';
import { encodeFramedPacket, parseAckPacket, AckFrame } from '../../protocol/framedProtocol';

interface PendingAck {
  seq: number;
  resolve: (ack: AckFrame | { seq: number; statusOk: boolean; errorCode: number }) => void;
  reject: (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export class BleManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  public state: ConnectionState = 'disconnected';
  private autoReconnectRetries = 0;
  private maxReconnectRetries = 3;
  private lastPacketTime = 0;
  private minPacketIntervalMs = 15;

  private seqCounter = 1;
  private pendingAcks: Map<number, PendingAck> = new Map();
  private rxBuffer: number[] = [];

  // Packet metrics
  public totalPacketsSent = 0;
  public totalBytesSent = 0;

  private onStateChange: (state: ConnectionState, msg: string) => void;
  private onLog: (log: LogEntry) => void;

  constructor(
    onStateChange: (state: ConnectionState, msg: string) => void,
    onLog: (log: LogEntry) => void
  ) {
    this.onStateChange = onStateChange;
    this.onLog = onLog;
  }

  private getNextSeq(): number {
    const seq = this.seqCounter;
    this.seqCounter = (this.seqCounter % 254) + 1;
    return seq;
  }

  async connect(serviceUuid: string, characteristicUuid: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      this.updateState('error', 'Web Bluetooth API Unsupported');
      this.addLog('error', 'Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Bluefy on iOS.');
      return false;
    }

    try {
      this.updateState('connecting', 'Requesting BLE Device...');
      this.addLog('info', `Scanning for BLE devices matching target Otter/HM-10...`);

      // Flexible filter matching RubberOtterPy auto-discovery
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [serviceUuid] },
          { namePrefix: 'Otter' },
          { namePrefix: 'RubberOtter' },
          { namePrefix: 'HM-10' },
          { namePrefix: 'Master-Key' },
        ],
        optionalServices: [
          serviceUuid,
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '00001800-0000-1000-8000-00805f9b34fb'
        ]
      }).catch(async () => {
        // Fallback scan accepting all devices
        this.addLog('info', 'Filter scan empty. Fallback scan accepting all BLE devices...');
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            'ffe0',
            '00001800-0000-1000-8000-00805f9b34fb'
          ]
        });
      });

      if (!this.device) {
        throw new Error('Device selection cancelled');
      }

      this.device.addEventListener('gattserverdisconnected', (e) => this.handleDisconnect(e, serviceUuid, characteristicUuid));

      this.updateState('connecting', 'Connecting GATT Server...');
      this.addLog('info', `Connecting GATT Server to ${this.device.name || this.device.id}...`);
      this.server = await this.device.gatt?.connect() || null;

      if (!this.server) {
        throw new Error('Failed to connect to GATT Server');
      }

      this.updateState('connecting', 'Discovering GATT Services & Characteristics...');
      
      // Attempt Primary Discovery
      try {
        const service = await this.server.getPrimaryService(serviceUuid);
        this.characteristic = await service.getCharacteristic(characteristicUuid);
      } catch (discErr) {
        this.addLog('info', 'Primary UUID discovery fallback: Searching all GATT services...');
        // Fallback discovery matching RubberOtterPy client.py
        const services = await this.server.getPrimaryServices();
        for (const s of services) {
          try {
            const chars = await s.getCharacteristics();
            for (const c of chars) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                this.characteristic = c;
                this.addLog('info', `Discovered writable GATT Characteristic: ${c.uuid}`);
                break;
              }
            }
          } catch (_) {
            // Continue searching next service
          }
          if (this.characteristic) break;
        }
      }

      if (!this.characteristic) {
        throw new Error('Could not find writable BLE Characteristic');
      }

      // Enable Notifications for ACK Listening (matching RubberOtterPy)
      if (this.characteristic.properties.notify || this.characteristic.properties.indicate) {
        try {
          await this.characteristic.startNotifications();
          this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));
          this.addLog('info', 'Subscribed to GATT Notification ACK responses');
        } catch (notifErr) {
          this.addLog('warn', 'GATT Notification subscription skipped: ' + (notifErr instanceof Error ? notifErr.message : String(notifErr)));
        }
      }

      this.autoReconnectRetries = 0;
      this.updateState('connected', 'Connected to BLE Device');
      this.addLog('info', `Successfully connected to BLE Device: ${this.device.name || 'Otter'}`);
      return true;

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'BLE Connection Failed';
      console.error('BLE Manager Connection Error:', err);
      this.updateState('error', errorMsg);
      this.addLog('error', `Connection Failed: ${errorMsg}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.rxBuffer = [];
    this.pendingAcks.forEach((p) => clearTimeout(p.timeoutId));
    this.pendingAcks.clear();
    this.updateState('disconnected', 'Disconnected');
    this.addLog('info', 'Disconnected from BLE device');
  }

  private handleNotification(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const bytes = new Uint8Array(target.value.buffer);
    for (let i = 0; i < bytes.length; i++) {
      this.rxBuffer.push(bytes[i]);
    }

    const bufArr = new Uint8Array(this.rxBuffer);
    const ack = parseAckPacket(bufArr);

    if (ack) {
      this.addLog('rx', `[RX ACK] Seq: ${ack.seq}, Status: ${ack.statusOk ? 'OK' : 'ERR'}, Code: ${ack.errorCode}`, bytesToHex(bytes));
      this.resolveAck(ack.seq, ack);
      this.rxBuffer = [];
    } else {
      // Fallback text ACK parsing (e.g. "OK", "ACK", "SUCCESS") matching RubberOtterPy
      const text = new TextDecoder().decode(bytes).trim().toUpperCase();
      if (text.includes('OK') || text.includes('ACK') || text.includes('SUCCESS')) {
        this.addLog('rx', `[RX Text ACK] ${text}`, bytesToHex(bytes));
        // Resolve oldest pending ACK
        const firstKey = this.pendingAcks.keys().next().value;
        if (firstKey !== undefined) {
          this.resolveAck(firstKey, { seq: firstKey, statusOk: true, errorCode: 0 });
        }
        this.rxBuffer = [];
      }
    }
  }

  private resolveAck(seq: number, ackData: AckFrame | { seq: number; statusOk: boolean; errorCode: number }) {
    const pending = this.pendingAcks.get(seq);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingAcks.delete(seq);
      pending.resolve(ackData);
    }
  }

  private async handleDisconnect(event: Event, serviceUuid: string, characteristicUuid: string) {
    this.addLog('warn', `GATT Server disconnected unexpectedly: ${event.type}`);
    this.characteristic = null;

    if (this.autoReconnectRetries < this.maxReconnectRetries) {
      this.autoReconnectRetries++;
      this.updateState('connecting', `Reconnecting (${this.autoReconnectRetries}/${this.maxReconnectRetries})...`);
      this.addLog('info', `Attempting auto-reconnect retry ${this.autoReconnectRetries} of ${this.maxReconnectRetries}...`);

      setTimeout(async () => {
        try {
          if (this.device && this.device.gatt && !this.device.gatt.connected) {
            this.server = await this.device.gatt.connect();
            const service = await this.server.getPrimaryService(serviceUuid);
            this.characteristic = await service.getCharacteristic(characteristicUuid);
            this.updateState('connected', 'Reconnected to BLE Device');
            this.addLog('info', 'Successfully reconnected to BLE Device!');
          }
        } catch (err) {
          this.addLog('error', `Auto-reconnect retry ${this.autoReconnectRetries} failed.`);
          if (this.autoReconnectRetries >= this.maxReconnectRetries) {
            this.updateState('disconnected', 'Disconnected');
          }
        }
      }, 1500);
    } else {
      this.updateState('disconnected', 'Disconnected');
    }
  }

  /**
   * Sends framed ASCII command with sequence tracking, ACK waiting, and auto-retry (RubberOtterPy matching)
   */
  async sendFramedWithAck(
    payloadText: string,
    timeoutMs = 2000,
    maxRetries = 2
  ): Promise<{ success: boolean; seq: number; ack?: AckFrame; error?: string }> {
    if (this.state !== 'connected' || !this.characteristic) {
      this.addLog('warn', 'Cannot send packet: BLE is disconnected');
      return { success: false, seq: 0, error: 'BLE Disconnected' };
    }

    const seq = this.getNextSeq();
    const frameData = encodeFramedPacket(payloadText, seq);

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const startTime = Date.now();
        const buffer = frameData.buffer as ArrayBuffer;

        const ackPromise = new Promise<AckFrame | { seq: number; statusOk: boolean; errorCode: number }>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            this.pendingAcks.delete(seq);
            reject(new Error(`ACK Timeout for Seq ${seq} after ${timeoutMs}ms`));
          }, timeoutMs);

          this.pendingAcks.set(seq, { seq, resolve, reject, timeoutId });
        });

        if (this.characteristic.writeValueWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(buffer);
        } else {
          await this.characteristic.writeValue(buffer);
        }

        this.totalPacketsSent++;
        this.totalBytesSent += frameData.length;
        this.addLog('tx', `[TX Framed Attempt ${attempt}/${maxRetries + 1}] Seq: ${seq} -> "${payloadText}"`, bytesToHex(frameData));

        const ackResult = await ackPromise;
        const rtt = Date.now() - startTime;
        this.addLog('info', `[ACK Received] Seq: ${seq} (${rtt}ms, attempt ${attempt})`);
        return { success: true, seq, ack: ackResult as AckFrame };

      } catch (err: unknown) {
        const errorStr = err instanceof Error ? err.message : String(err);
        this.addLog('warn', `Attempt ${attempt}/${maxRetries + 1} failed: ${errorStr}`);

        if (attempt > maxRetries) {
          return {
            success: false,
            seq,
            error: `Timeout waiting for ACK after ${maxRetries + 1} attempts over BLE.`,
          };
        }
        await new Promise((r) => setTimeout(r, 100)); // Short delay before retry
      }
    }

    return { success: false, seq, error: 'Max retries exhausted' };
  }

  async sendPacket(data: Uint8Array): Promise<boolean> {
    if (this.state !== 'connected' || !this.characteristic) {
      this.addLog('warn', 'Cannot send packet: BLE is disconnected');
      return false;
    }

    const now = Date.now();
    if (now - this.lastPacketTime < this.minPacketIntervalMs) {
      return false;
    }
    this.lastPacketTime = now;

    try {
      const buffer = data.buffer as ArrayBuffer;
      if (this.characteristic.writeValueWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(buffer);
      } else {
        await this.characteristic.writeValue(buffer);
      }

      this.totalPacketsSent++;
      this.totalBytesSent += data.length;

      const hexStr = bytesToHex(data);
      const cmdByte = data[0];
      const name = PROTOCOL_NAMES[cmdByte] || `Custom Command (0x${cmdByte.toString(16).toUpperCase()})`;

      let detail = '';
      if (cmdByte === 0x80 && data.length >= 3) {
        const dx = (data[1] << 24) >> 24;
        const dy = (data[2] << 24) >> 24;
        detail = ` -> dx: ${dx}, dy: ${dy}`;
      }

      this.addLog('tx', `[TX] ${name}${detail}`, hexStr);
      return true;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'TX Failed';
      this.addLog('error', `Write Characteristic Error: ${msg}`);
      return false;
    }
  }

  private updateState(newState: ConnectionState, msg: string) {
    this.state = newState;
    this.onStateChange(newState, msg);
  }

  private addLog(type: LogEntry['type'], message: string, hexData?: string) {
    this.onLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      hexData,
    });
  }
}
