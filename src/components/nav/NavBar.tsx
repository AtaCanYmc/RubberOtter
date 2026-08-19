import React from 'react';
import { Music, Presentation, Shield, Gamepad2, MousePointer, Terminal, Settings, Radar, Type } from 'lucide-react';

export type TabId = 'scanner' | 'text' | 'media' | 'reader' | 'security' | 'gaming' | 'trackpad' | 'console' | 'settings';

interface NavBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'scanner' as TabId, label: 'Scanner', icon: Radar },
    { id: 'text' as TabId, label: 'Text', icon: Type },
    { id: 'media' as TabId, label: 'Media', icon: Music },
    { id: 'reader' as TabId, label: 'Reader', icon: Presentation },
    { id: 'security' as TabId, label: 'Security', icon: Shield },
    { id: 'gaming' as TabId, label: 'Gaming', icon: Gamepad2 },
    { id: 'trackpad' as TabId, label: 'Trackpad', icon: MousePointer },
    { id: 'console' as TabId, label: 'Console', icon: Terminal },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 z-40 glass-card border-t border-slate-800/80 px-2 py-1.5">
      <div className="max-w-md mx-auto grid grid-cols-9 gap-0.5 text-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-brand-400 bg-brand-500/10 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
