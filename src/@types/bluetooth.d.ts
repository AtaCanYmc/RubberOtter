/// <reference types="web-bluetooth" />

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ProtocolMode = 'single_byte' | 'framed_ascii';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'tx' | 'info' | 'warn' | 'error' | 'rx';
  message: string;
  hexData?: string;
}

export interface CustomMacro {
  id: string;
  name: string;
  description: string;
  category: string;
  bytes: number[];
  delayMs: number;
}

export interface AppSettings {
  serviceUuid: string;
  characteristicUuid: string;
  enableHaptics: boolean;
  enableSound: boolean;
  jiggleIntervalSec: number;
  trackpadSensitivity: number;
  protocolMode: ProtocolMode;
}
