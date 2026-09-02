import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { Key, Zap, Power } from 'lucide-react';

export const Header: React.FC = () => {
  const { connectionState, statusMessage, connect, disconnect } = useBluetooth();

  const handleToggleConnection = async () => {
    if (connectionState === 'connected') {
      await disconnect();
    } else {
      await connect();
    }
  };

  const getLedStyle = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse';
      case 'connecting':
        return 'bg-amber-400 shadow-md shadow-amber-400/80 animate-ping';
      case 'error':
        return 'bg-rose-500 shadow-sm shadow-rose-500/50';
      case 'disconnected':
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-slate-800/80 px-4 py-3 shadow-xl">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MASTER-KEY
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">BLE HID Bridge</p>
          </div>
        </div>

        {/* Connection Badge & Toggle Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${getLedStyle()}`} />
            <span className="text-xs font-medium text-slate-300 max-w-[90px] truncate">
              {statusMessage}
            </span>
          </div>

          <button
            onClick={handleToggleConnection}
            disabled={connectionState === 'connecting'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all duration-150 active:scale-95 flex items-center space-x-1.5 ${
              connectionState === 'connected'
                ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                : 'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white shadow-brand-500/20'
            }`}
          >
            {connectionState === 'connected' ? (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{connectionState === 'connecting' ? 'Connecting...' : 'Connect'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
