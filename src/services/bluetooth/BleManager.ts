import { ConnectionState, LogEntry } from '../../@types/bluetooth';
import { PROTOCOL_NAMES } from '../../protocol/byteMap';
import { bytesToHex } from '../../protocol/packetEncoder';

export class BleManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  public state: ConnectionState = 'disconnected';
  private autoReconnectRetries = 0;
  private maxReconnectRetries = 3;
  private lastPacketTime = 0;
  private minPacketIntervalMs = 15;

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

  async connect(serviceUuid: string, characteristicUuid: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      this.updateState('error', 'Web Bluetooth API Unsupported');
      this.addLog('error', 'Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Bluefy on iOS.');
      return false;
    }

    try {
      this.updateState('connecting', 'Requesting BLE Device...');
      this.addLog('info', `Scanning for BLE devices matching service ${serviceUuid}...`);

      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUuid] }],
        optionalServices: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb', 'ffe0']
      }).catch(async () => {
        // Fallback scan accepting all devices if advertising data omits service UUID
        this.addLog('info', 'Service filter scan cancelled/empty. Fallback scan accepting all BLE devices...');
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb', 'ffe0']
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

      this.updateState('connecting', 'Discovering HM-10 Service...');
      const service = await this.server.getPrimaryService(serviceUuid);

      this.updateState('connecting', 'Locating TX/RX Characteristic...');
      this.characteristic = await service.getCharacteristic(characteristicUuid);

      this.autoReconnectRetries = 0;
      this.updateState('connected', 'Connected to HM-10');
      this.addLog('info', `Successfully connected to HM-10 BLE Characteristic: ${characteristicUuid}`);
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
    this.updateState('disconnected', 'Disconnected');
    this.addLog('info', 'Disconnected from HM-10 BLE device');
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
            this.updateState('connected', 'Reconnected to HM-10');
            this.addLog('info', 'Successfully reconnected to HM-10 BLE!');
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

  async sendPacket(data: Uint8Array): Promise<boolean> {
    if (this.state !== 'connected' || !this.characteristic) {
      this.addLog('warn', 'Cannot send packet: BLE is disconnected');
      return false;
    }

    const now = Date.now();
    if (now - this.lastPacketTime < this.minPacketIntervalMs) {
      // Throttling mouse packets
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
