import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Terminal } from 'lucide-react';
import { RubberOtterLogo } from '../brand/RubberOtterLogo';

export const Header: React.FC = () => {
  const { connectionState } = useBluetooth();
  const { settings, t } = useSettings();

  const getStatusIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>{t('header.connected')}</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
            <span>{t('header.connecting')}</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" />
            <span>{t('header.error')}</span>
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span>{t('header.ready')}</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <RubberOtterLogo size={36} className="flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                RUBBER OTTER
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                v2.1
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center space-x-1.5">
              <span>{t('header.bleBridge')}</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="uppercase text-zinc-600 dark:text-zinc-400">{settings.targetOs}</span>
            </p>
          </div>
        </div>

        {/* Telemetry & Connection Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center space-x-1">
              <Terminal className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              <span>{settings.protocolMode === 'framed_ascii' ? 'ASCII' : 'HEX'}</span>
            </span>
          </div>

          {/* Live Status Badge */}
          {getStatusIndicator()}
        </div>
      </div>
    </header>
  );
};
