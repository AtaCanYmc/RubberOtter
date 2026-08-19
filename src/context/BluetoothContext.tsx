import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ConnectionState, LogEntry } from '../@types/bluetooth';
import { BleManager } from '../services/bluetooth/BleManager';
import { useSettings } from './SettingsContext';
import { soundEffects } from '../services/audio/soundEffects';
import { PROTOCOL_ASCII_COMMANDS } from '../protocol/byteMap';

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
  triggerVibrate: (durationMs?: number) => Promise<boolean>;
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

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev].slice(0, 300));
  };

  const handleStateChange = (state: ConnectionState, msg: string) => {
    setConnectionState(state);
    setStatusMessage(msg);
  };

  useEffect(() => {
    bleManagerRef.current = new BleManager(handleStateChange, addLog);
  }, []);

  const connect = async (): Promise<boolean> => {
    return await bleManagerRef.current!.connect(
      settings.serviceUuid,
      settings.characteristicUuid
    );
  };

  const disconnect = async (): Promise<void> => {
    await bleManagerRef.current!.disconnect();
  };

  const sendFramedAscii = async (
    payloadText: string,
    feedbackType: 'subtle' | 'confirm' | 'toggle' | 'alert' = 'subtle'
  ): Promise<boolean> => {
    if (settings.enableSound && feedbackType) {
      soundEffects.playClick(feedbackType);
    }
    if (settings.enableHaptics && feedbackType) {
      soundEffects.triggerHaptic(20);
    }

    const res = await bleManagerRef.current!.sendFramedWithAck(payloadText);

    if (res.success) {
      setTotalPacketsSent((p) => p + 1);
      setTotalBytesSent((b) => b + payloadText.length + 7);
    }

    return res.success;
  };

  const triggerVibrate = async (durationMs = 100): Promise<boolean> => {
    soundEffects.triggerHaptic(durationMs);

    if (settings.protocolMode === 'framed_ascii') {
      return await sendFramedAscii(`vibrate ${durationMs}`, 'confirm');
    } else {
      await sendByte(0x35, 'confirm');
      return await sendFramedAscii(`vibrate ${durationMs}`, 'confirm');
    }
  };

  const sendByte = async (
    byteCode: number,
    feedbackType: 'subtle' | 'confirm' | 'toggle' | 'alert' = 'subtle'
  ): Promise<boolean> => {
    if (settings.protocolMode === 'framed_ascii') {
      let asciiCmd = PROTOCOL_ASCII_COMMANDS[byteCode] || `cmd_${byteCode}`;
      if (settings.targetOs === 'macos') {
        if (byteCode === 0x31) asciiCmd = 'press gui ctrl q';
        else if (byteCode === 0x33) asciiCmd = 'press gui alt esc';
        else if (byteCode === 0x34) asciiCmd = 'press gui f3';
      }
      return await sendFramedAscii(asciiCmd, feedbackType);
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

    const success = await bleManagerRef.current!.sendPacket(data);

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
        triggerVibrate,
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
