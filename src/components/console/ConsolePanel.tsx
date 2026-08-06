import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { Terminal, Trash2, Copy, Activity } from 'lucide-react';

export const ConsolePanel: React.FC = () => {
  const { logs, clearLogs, totalPacketsSent, totalBytesSent } = useBluetooth();
  const [copied, setCopied] = React.useState(false);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.hexData || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogBadgeStyle = (type: string) => {
    switch (type) {
      case 'tx':
        return 'bg-brand-500/20 text-brand-300 border-brand-500/30';
      case 'error':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'warn':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'info':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Diagnostic Telemetry Header */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200">GATT Packet Terminal</h2>
            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
              <span>Packets: <strong className="text-brand-400">{totalPacketsSent}</strong></span>
              <span>Bytes: <strong className="text-emerald-400">{totalBytesSent} B</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95"
            title="Copy Logs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="text-[10px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={clearLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-all active:scale-95"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Terminal Log Stream */}
      <div className="flex-1 glass-card rounded-2xl p-4 font-mono text-xs overflow-y-auto max-h-[380px] space-y-2 border-slate-800 shadow-inner bg-slate-950/90">
        {logs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Activity className="w-8 h-8 opacity-40 animate-pulse" />
            <p className="text-xs">No BLE packet logs recorded yet</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 py-1 border-b border-slate-900/80">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">{log.timestamp}</span>
              <span
                className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase ${getLogBadgeStyle(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <div className="flex-1 break-all">
                <span className="text-slate-200">{log.message}</span>
                {log.hexData && (
                  <span className="ml-2 font-bold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px]">
                    {log.hexData}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
