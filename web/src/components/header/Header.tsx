import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { TabId, tabItems } from '../nav/NavBar';
import { Terminal } from 'lucide-react';
import { RubberOtterLogo } from '../brand/RubberOtterLogo';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { connectionState } = useBluetooth();
  const { settings, t } = useSettings();

  const getStatusIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">{t('header.connected')}</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
            <span className="hidden sm:inline">{t('header.connecting')}</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" />
            <span className="hidden sm:inline">{t('header.error')}</span>
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span className="hidden sm:inline">{t('header.ready')}</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5 transition-colors pt-safe">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <RubberOtterLogo size={34} className="flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                RUBBER OTTER
              </h1>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
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

        {/* Desktop / Web Navigation Tabs embedded directly in Header */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 overflow-x-auto">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (activeTab === 'flasher' && tab.id === 'settings');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-tactile flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-otter-500/10 dark:bg-otter-950/40 text-otter-900 dark:text-otter-200 border-otter-500 dark:border-otter-500/80 shadow-sm font-semibold'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-850/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Telemetry & Connection Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div className="hidden lg:flex items-center space-x-2">
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
