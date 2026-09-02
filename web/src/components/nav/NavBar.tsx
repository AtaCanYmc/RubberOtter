import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Translations } from '../../i18n/translations';
import {
  Radar,
  Type,
  Music,
  Presentation,
  Shield,
  Gamepad2,
  MousePointer,
  Terminal,
  Settings
} from 'lucide-react';

export type TabId =
  | 'scanner'
  | 'text'
  | 'media'
  | 'reader'
  | 'security'
  | 'gaming'
  | 'trackpad'
  | 'console'
  | 'settings';

interface NavBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

interface TabItem {
  id: TabId;
  labelKey: keyof Translations;
  icon: React.ComponentType<{ className?: string }>;
}

export const tabItems: TabItem[] = [
  { id: 'scanner', labelKey: 'nav.scanner', icon: Radar },
  { id: 'text', labelKey: 'nav.text', icon: Type },
  { id: 'media', labelKey: 'nav.media', icon: Music },
  { id: 'reader', labelKey: 'nav.presenter', icon: Presentation },
  { id: 'security', labelKey: 'nav.security', icon: Shield },
  { id: 'gaming', labelKey: 'nav.macros', icon: Gamepad2 },
  { id: 'trackpad', labelKey: 'nav.trackpad', icon: MousePointer },
  { id: 'console', labelKey: 'nav.console', icon: Terminal },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useSettings();

  return (
    <>
      {/* Desktop / Tablet Top Navigation Pills */}
      <div className="hidden md:flex items-center justify-start space-x-1 p-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 mb-6 overflow-x-auto transition-colors">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-tactile flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
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
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800/80 px-2 py-2 pb-safe transition-colors">
        <div className="flex items-center justify-between space-x-1 overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-tactile flex flex-col items-center justify-center min-w-[58px] py-1.5 px-1 rounded-lg transition-all border ${
                  isActive
                    ? 'bg-otter-500/10 dark:bg-otter-950/40 text-otter-900 dark:text-otter-200 font-semibold border-otter-500 dark:border-otter-500/80 shadow-sm'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                <span className="text-[10px] tracking-tight">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
