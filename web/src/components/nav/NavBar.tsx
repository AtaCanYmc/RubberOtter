import React from 'react';
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

export const tabs = [
  { id: 'scanner' as TabId, label: 'Scanner', icon: Radar },
  { id: 'text' as TabId, label: 'Text', icon: Type },
  { id: 'media' as TabId, label: 'Media', icon: Music },
  { id: 'reader' as TabId, label: 'Presenter', icon: Presentation },
  { id: 'security' as TabId, label: 'Security', icon: Shield },
  { id: 'gaming' as TabId, label: 'Macros', icon: Gamepad2 },
  { id: 'trackpad' as TabId, label: 'Trackpad', icon: MousePointer },
  { id: 'console' as TabId, label: 'Console', icon: Terminal },
  { id: 'settings' as TabId, label: 'Settings', icon: Settings },
];

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      {/* Desktop / Tablet Top Navigation Pills */}
      <div className="hidden md:flex items-center justify-start space-x-1 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-tactile flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-otter-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-2 pb-safe">
        <div className="flex items-center justify-between space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-tactile flex flex-col items-center justify-center min-w-[58px] py-1.5 px-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 font-semibold border border-zinc-700/60'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-otter-400' : 'text-zinc-400'}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
