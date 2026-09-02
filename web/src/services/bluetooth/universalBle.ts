import { Capacitor } from '@capacitor/core';
import { BleClient, BleDevice, ScanResult } from '@capacitor-community/bluetooth-le';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface UniversalBleDevice {
  id: string;
  name: string;
  rssi?: number;
  serviceUuids: string[];
  lastSeen: string;
}

export type ConnectionStateListener = (state: 'disconnected' | 'connecting' | 'connected' | 'error', msg?: string) => void;
export type RxDataListener = (data: Uint8Array) => void;

class UniversalBleService {
  private isNative: boolean = false;
  private isInitialized: boolean = false;
  private connectedDeviceId: string | null = null;
  private webBluetoothDevice: BluetoothDevice | null = null;
  private webCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  private stateListeners: Set<ConnectionStateListener> = new Set();
  private rxListeners: Set<RxDataListener> = new Set();

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  public isNativeApp(): boolean {
    return this.isNative;
  }

  public isIosDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  public isIosWebWithoutBle(): boolean {
    return !this.isNative && this.isIosDevice() && (typeof navigator === 'undefined' || !('bluetooth' in navigator));
  }

  public supportsBluetooth(): boolean {
    if (this.isNative) return true;
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator && !!navigator.bluetooth;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative) {
      try {
        await BleClient.initialize();
        this.isInitialized = true;
      } catch (err) {
        console.warn('Capacitor BleClient initialization error:', err);
      }
    } else {
      this.isInitialized = true;
    }
  }

  public onStateChange(listener: ConnectionStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onRxData(listener: RxDataListener): () => void {
    this.rxListeners.add(listener);
    return () => this.rxListeners.delete(listener);
  }

  private notifyState(state: 'disconnected' | 'connecting' | 'connected' | 'error', msg?: string) {
    this.stateListeners.forEach((fn) => fn(state, msg));
  }

  /**
   * Start native continuous BLE scanning or request device
   */
  public async startScan(
    serviceUuid: string,
    onDeviceFound: (device: UniversalBleDevice) => void
  ): Promise<void> {
    await this.initialize();

    if (this.isNative) {
      try {
        await BleClient.requestLEScan(
          {
            services: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
            allowDuplicates: false,
          },
          (result: ScanResult) => {
            const devName = result.localName || result.device.name || 'Rubber Otter BLE';
            const devId = result.device.deviceId;
            const dev: UniversalBleDevice = {
              id: devId,
              name: devName,
              rssi: result.rssi,
              serviceUuids: [serviceUuid],
              lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };
            onDeviceFound(dev);
          }
        );
      } catch (err: any) {
        // Fallback to requestDevice dialog if background scan is unavailable
        const dev = await this.requestDevice(serviceUuid);
        onDeviceFound(dev);
      }
    } else {
      if (!this.supportsBluetooth()) {
        if (this.isIosDevice()) {
          throw new Error('iOS Safari does not support the Web Bluetooth API. Please install the Rubber Otter iOS native app (via Capacitor/TestFlight) or open this page in the Bluefy Web Bluetooth browser.');
        }
        throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      }

      const dev = await this.requestDevice(serviceUuid);
      onDeviceFound(dev);
    }
  }

  public async stopScan(): Promise<void> {
    if (this.isNative) {
      try {
        await BleClient.stopLEScan();
      } catch {
        // Ignore stop error if not actively scanning
      }
    }
  }

  /**
   * Request / Pair with a device using either Native BLE or Web Bluetooth API
   */
  public async requestDevice(serviceUuid: string): Promise<UniversalBleDevice> {
    await this.initialize();

    if (this.isNative) {
      // Native Capacitor BLE (CoreBluetooth on iOS, Android BLE)
      try {
        const device: BleDevice = await BleClient.requestDevice({
          services: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
          namePrefix: 'Otter',
          optionalServices: [
            serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '00001800-0000-1000-8000-00805f9b34fb',
          ],
        }).catch(async () => {
          return await BleClient.requestDevice({
            optionalServices: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
          });
        });

        return {
          id: device.deviceId,
          name: device.name || 'Rubber Otter BLE',
          rssi: -60,
          serviceUuids: [serviceUuid],
          lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
      } catch (err: any) {
        throw new Error(err.message || 'Native CoreBluetooth device request failed');
      }
    } else {
      // Standard Web Bluetooth API
      if (!this.supportsBluetooth()) {
        if (this.isIosDevice()) {
          throw new Error('iOS Safari does not support Web Bluetooth in standard browser mode. Use the Native iOS App or the Bluefy Bluetooth browser.');
        }
        throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or install the native app.');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Otter' },
          { namePrefix: 'RubberOtter' },
          { namePrefix: 'HM-10' },
          { namePrefix: 'Master-Key' },
          { services: [serviceUuid] },
        ],
        optionalServices: [
          serviceUuid,
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '00001800-0000-1000-8000-00805f9b34fb',
        ],
      }).catch(async () => {
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '00001800-0000-1000-8000-00805f9b34fb',
          ],
        });
      });

      this.webBluetoothDevice = device;

      return {
        id: device.id,
        name: device.name || 'Rubber Otter Web BLE',
        rssi: -60,
        serviceUuids: [serviceUuid],
        lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    }
  }

  /**
   * Connect to GATT Server and locate characteristic
   */
  public async connect(
    deviceId: string,
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<void> {
    await this.initialize();
    this.notifyState('connecting', 'Connecting to BLE device...');

    if (this.isNative) {
      try {
        await BleClient.connect(deviceId, (disconnectedDeviceId) => {
          if (disconnectedDeviceId === this.connectedDeviceId) {
            this.connectedDeviceId = null;
            this.notifyState('disconnected', 'Device disconnected');
          }
        });

        this.connectedDeviceId = deviceId;

        // Subscribe to notifications if supported
        try {
          await BleClient.startNotifications(deviceId, serviceUuid, characteristicUuid, (value) => {
            const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
            this.rxListeners.forEach((fn) => fn(bytes));
          });
        } catch {
          // Some HM-10 models only support direct write
        }

        this.notifyState('connected', 'Connected via Native CoreBluetooth / Android BLE');
      } catch (err: any) {
        this.connectedDeviceId = null;
        this.notifyState('error', err.message || 'Native BLE connection error');
        throw err;
      }
    } else {
      try {
        let device = this.webBluetoothDevice;
        if (!device) {
          throw new Error('No device selected. Please select a device first.');
        }

        const server = await device.gatt?.connect();
        if (!server) throw new Error('Could not connect to GATT Server');

        let service: BluetoothRemoteGATTService | undefined;
        try {
          service = await server.getPrimaryService(serviceUuid);
        } catch {
          service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        }

        let char: BluetoothRemoteGATTCharacteristic | undefined;
        try {
          char = await service.getCharacteristic(characteristicUuid);
        } catch {
          char = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        }

        this.webCharacteristic = char;

        // Auto disconnect listener
        device.addEventListener('gattserverdisconnected', () => {
          this.webCharacteristic = null;
          this.notifyState('disconnected', 'Web Bluetooth disconnected');
        });

        try {
          if (char.properties.notify || char.properties.indicate) {
            await char.startNotifications();
            char.addEventListener('characteristicvaluechanged', (e: any) => {
              const target = e.target as BluetoothRemoteGATTCharacteristic;
              if (target.value) {
                const bytes = new Uint8Array(target.value.buffer, target.value.byteOffset, target.value.byteLength);
                this.rxListeners.forEach((fn) => fn(bytes));
              }
            });
          }
        } catch {
          // Notifications optional
        }

        this.notifyState('connected', 'Connected via Web Bluetooth API');
      } catch (err: any) {
        this.webCharacteristic = null;
        this.notifyState('error', err.message || 'Web Bluetooth connection error');
        throw err;
      }
    }
  }

  /**
   * Disconnect active BLE connection
   */
  public async disconnect(): Promise<void> {
    if (this.isNative && this.connectedDeviceId) {
      try {
        await BleClient.disconnect(this.connectedDeviceId);
      } catch (err) {
        console.warn('Native disconnect error:', err);
      }
      this.connectedDeviceId = null;
    } else if (this.webBluetoothDevice?.gatt?.connected) {
      try {
        this.webBluetoothDevice.gatt.disconnect();
      } catch (err) {
        console.warn('Web disconnect error:', err);
      }
      this.webCharacteristic = null;
    }
    this.notifyState('disconnected', 'Disconnected');
  }

  /**
   * Transmit byte array to characteristic
   */
  public async write(
    data: Uint8Array,
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<void> {
    if (this.isNative) {
      if (!this.connectedDeviceId) throw new Error('BLE device is not connected');

      const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
      try {
        await BleClient.writeWithoutResponse(this.connectedDeviceId, serviceUuid, characteristicUuid, dataView);
      } catch {
        await BleClient.write(this.connectedDeviceId, serviceUuid, characteristicUuid, dataView);
      }
    } else {
      if (!this.webCharacteristic) throw new Error('BLE characteristic not available');

      if (this.webCharacteristic.writeValueWithoutResponse) {
        try {
          await this.webCharacteristic.writeValueWithoutResponse(data as unknown as BufferSource);
          return;
        } catch {
          // fallback to writeValueWithResponse
        }
      }
      await this.webCharacteristic.writeValueWithResponse(data as unknown as BufferSource);
    }
  }

  /**
   * Trigger Native Mobile Haptic Feedback or Web Vibration
   */
  public async triggerHaptics(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | number): Promise<void> {
    if (this.isNative) {
      try {
        if (typeof type === 'number') {
          await Haptics.vibrate({ duration: type });
        } else if (type === 'light') {
          await Haptics.impact({ style: ImpactStyle.Light });
        } else if (type === 'medium') {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } else if (type === 'heavy') {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } else if (type === 'success') {
          await Haptics.notification({ type: NotificationType.Success });
        } else if (type === 'warning') {
          await Haptics.notification({ type: NotificationType.Warning });
        } else if (type === 'error') {
          await Haptics.notification({ type: NotificationType.Error });
        }
      } catch {
        // Ignore haptics errors if device has no vibrator
      }
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const ms = typeof type === 'number' ? type : type === 'heavy' ? 40 : type === 'medium' ? 25 : 15;
        navigator.vibrate(ms);
      }
    }
  }

  /**
   * Configure Native Status Bar for Dark / Light Theme
   */
  public async setStatusBarStyle(isDark: boolean): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({ color: isDark ? '#09090b' : '#ffffff' });
    } catch {
      // Webview fallback
    }
  }
}

export const universalBle = new UniversalBleService();
