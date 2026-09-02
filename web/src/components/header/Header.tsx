import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Bluetooth, Power, Radio, Shield, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  const { connectionState, statusMessage, connect, disconnect } = useBluetooth();
  const { settings } = useSettings();

  const handleToggleConnection = async () => {
    if (connectionState === 'connected') {
      await disconnect();
    } else {
      await connect();
    }
  };

  const getStatusIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting...</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Error</span>
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>Ready</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-obsidian-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-otter-400 shadow-sm">
            <Radio className="w-4 h-4 text-otter-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                RUBBER OTTER
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                v2.1
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center space-x-1.5">
              <span>BLE HID Bridge</span>
              <span className="text-zinc-600">•</span>
              <span className="uppercase text-zinc-500">{settings.targetOs}</span>
            </p>
          </div>
        </div>

        {/* Telemetry & Connection Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 flex items-center space-x-1">
              <Terminal className="w-3 h-3 text-zinc-500" />
              <span>{settings.protocolMode === 'framed_ascii' ? 'ASCII' : 'HEX'}</span>
            </span>
          </div>

          {getStatusIndicator()}

          <button
            onClick={handleToggleConnection}
            disabled={connectionState === 'connecting'}
            className={`btn-tactile px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border shadow-sm ${
              connectionState === 'connected'
                ? 'bg-zinc-900 hover:bg-zinc-850 text-rose-400 border-rose-500/30'
                : 'bg-zinc-100 hover:bg-white text-zinc-950 border-zinc-200'
            }`}
          >
            {connectionState === 'connected' ? (
              <>
                <Power className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Disconnect</span>
              </>
            ) : (
              <>
                <Bluetooth className="w-3.5 h-3.5" />
                <span>{connectionState === 'connecting' ? 'Connecting...' : 'Connect BLE'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
