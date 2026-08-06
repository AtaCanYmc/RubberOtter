import { ConnectionState, LogEntry } from '../../@types/bluetooth';
import { PROTOCOL_NAMES } from '../../protocol/byteMap';
import { bytesToHex } from '../../protocol/packetEncoder';

export class MockBleDriver {
  private isConnected = false;
  private onStateChange: (state: ConnectionState, msg: string) => void;
  private onLog: (log: LogEntry) => void;

  constructor(
    onStateChange: (state: ConnectionState, msg: string) => void,
    onLog: (log: LogEntry) => void
  ) {
    this.onStateChange = onStateChange;
    this.onLog = onLog;
  }

  async connect(): Promise<boolean> {
    this.onStateChange('connecting', 'Simulating HM-10 BLE GATT Handshake...');
    this.onLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: '[MOCK BLE] Connecting to virtual HM-10 GATT service...',
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    this.isConnected = true;
    this.onStateChange('connected', 'Simulated HM-10 Connected');
    this.onLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: '[MOCK BLE] Virtual HM-10 Connected! All byte packets will be logged.',
    });
    return true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.onStateChange('disconnected', 'Disconnected');
    this.onLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: '[MOCK BLE] Virtual HM-10 Disconnected.',
    });
  }

  async sendPacket(data: Uint8Array): Promise<boolean> {
    if (!this.isConnected) {
      this.onLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'Cannot send packet: Mock BLE is disconnected',
      });
      return false;
    }

    const hexStr = bytesToHex(data);
    const cmdByte = data[0];
    const name = PROTOCOL_NAMES[cmdByte] || `Custom Command (0x${cmdByte.toString(16).toUpperCase()})`;

    let detail = '';
    if (cmdByte === 0x80 && data.length >= 3) {
      const dx = (data[1] << 24) >> 24; // Convert uint8 to int8
      const dy = (data[2] << 24) >> 24;
      detail = ` -> dx: ${dx}, dy: ${dy}`;
    }

    this.onLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'tx',
      message: `[TX] ${name}${detail}`,
      hexData: hexStr,
    });

    return true;
  }
}
