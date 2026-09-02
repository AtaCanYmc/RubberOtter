import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Terminal, Trash2, Copy, Activity, Check } from 'lucide-react';

export const ConsolePanel: React.FC = () => {
  const { logs, clearLogs, totalPacketsSent, totalBytesSent } = useBluetooth();
  const { t } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.hexData || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLogBadgeStyle = (type: string) => {
    switch (type) {
      case 'tx':
        return 'bg-otter-500/15 text-otter-600 dark:text-otter-400 border-otter-500/30';
      case 'error':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'warn':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'info':
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60';
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Telemetry Header Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('console.title')}</h2>
            <div className="flex items-center space-x-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
              <span>{t('console.packets')} <strong className="text-zinc-800 dark:text-zinc-200">{totalPacketsSent}</strong></span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span>{t('console.bytes')} <strong className="text-zinc-800 dark:text-zinc-200">{totalBytesSent} B</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 flex items-center space-x-1.5 disabled:opacity-40"
            title={t('console.copyLogs')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('text.copied') : t('console.copyLogs')}</span>
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="btn-tactile p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40"
            title={t('console.clearLogs')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Stream Console */}
      <div className="flex-1 instrument-card rounded-xl p-4 font-mono text-xs overflow-y-auto min-h-[300px] max-h-[440px] space-y-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/90">
        {logs.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-zinc-500 space-y-2">
            <Activity className="w-6 h-6 opacity-40 animate-pulse text-otter-500" />
            <p className="text-xs">{t('console.noLogs')}</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2.5 py-1.5 border-b border-zinc-200/60 dark:border-zinc-900">
              <span className="text-[11px] text-zinc-500 whitespace-nowrap">{log.timestamp}</span>
              <span
                className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase ${getLogBadgeStyle(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <div className="flex-1 break-all">
                <span className="text-zinc-800 dark:text-zinc-200">{log.message}</span>
                {log.hexData && (
                  <span className="ml-2 font-semibold text-otter-600 dark:text-otter-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-[11px]">
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
