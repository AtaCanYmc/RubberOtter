import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ConnectionState, LogEntry } from '../@types/bluetooth';
import { BleManager } from '../services/bluetooth/BleManager';
import { MockBleDriver } from '../services/bluetooth/MockBleDriver';
import { useSettings } from './SettingsContext';
import { soundEffects } from '../services/audio/soundEffects';
import { encodeFramedPacket } from '../protocol/framedProtocol';
import { PROTOCOL_NAMES } from '../protocol/byteMap';

interface BluetoothContextType {
  connectionState: ConnectionState;
  statusMessage: string;
  logs: LogEntry[];
  clearLogs: () => void;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  sendByte: (byteCode: number, feedbackType?: 'subtle' | 'confirm' | 'toggle' | 'alert') => Promise<boolean>;
  sendPacket: (data: Uint8Array, feedbackType?: 'subtle' | 'confirm' | 'toggle' | 'alert') => Promise<boolean>;
  sendFramedAscii: (payloadText: string, feedbackType?: 'subtle' | 'confirm' | 'toggle' | 'alert') => Promise<boolean>;
  totalPacketsSent: number;
  totalBytesSent: number;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('Disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalPacketsSent, setTotalPacketsSent] = useState<number>(0);
  const [totalBytesSent, setTotalBytesSent] = useState<number>(0);

  const bleManagerRef = useRef<BleManager | null>(null);
  const mockDriverRef = useRef<MockBleDriver | null>(null);

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev].slice(0, 300));
  };

  const handleStateChange = (state: ConnectionState, msg: string) => {
    setConnectionState(state);
    setStatusMessage(msg);
  };

  useEffect(() => {
    bleManagerRef.current = new BleManager(handleStateChange, addLog);
    mockDriverRef.current = new MockBleDriver(handleStateChange, addLog);
  }, []);

  const connect = async (): Promise<boolean> => {
    if (settings.useMockDriver) {
      return await mockDriverRef.current!.connect();
    } else {
      return await bleManagerRef.current!.connect(
        settings.serviceUuid,
        settings.characteristicUuid
      );
    }
  };

  const disconnect = async (): Promise<void> => {
    if (settings.useMockDriver) {
      await mockDriverRef.current!.disconnect();
    } else {
      await bleManagerRef.current!.disconnect();
    }
  };

  const sendFramedAscii = async (
    payloadText: string,
    feedbackType: 'subtle' | 'confirm' | 'toggle' | 'alert' = 'subtle'
  ): Promise<boolean> => {
    const packet = encodeFramedPacket(payloadText);
    return await sendPacket(packet, feedbackType);
  };

  const sendByte = async (
    byteCode: number,
    feedbackType: 'subtle' | 'confirm' | 'toggle' | 'alert' = 'subtle'
  ): Promise<boolean> => {
    if (settings.protocolMode === 'framed_ascii') {
      // Convert byte action to framed ASCII command string equivalent
      const name = PROTOCOL_NAMES[byteCode] || `cmd_${byteCode}`;
      return await sendFramedAscii(`exec ${name}`, feedbackType);
    } else {
      const packet = new Uint8Array([byteCode & 0xff]);
      return await sendPacket(packet, feedbackType);
    }
  };

  const sendPacket = async (
    data: Uint8Array,
    feedbackType: 'subtle' | 'confirm' | 'toggle' | 'alert' = 'subtle'
  ): Promise<boolean> => {
    if (settings.enableSound && feedbackType) {
      soundEffects.playClick(feedbackType);
    }
    if (settings.enableHaptics && feedbackType) {
      soundEffects.triggerHaptic(20);
    }

    let success = false;
    if (settings.useMockDriver) {
      success = await mockDriverRef.current!.sendPacket(data);
    } else {
      success = await bleManagerRef.current!.sendPacket(data);
    }

    if (success) {
      setTotalPacketsSent((p) => p + 1);
      setTotalBytesSent((b) => b + data.length);
    }

    return success;
  };

  const clearLogs = () => setLogs([]);

  return (
    <BluetoothContext.Provider
      value={{
        connectionState,
        statusMessage,
        logs,
        clearLogs,
        connect,
        disconnect,
        sendByte,
        sendPacket,
        sendFramedAscii,
        totalPacketsSent,
        totalBytesSent,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
};
