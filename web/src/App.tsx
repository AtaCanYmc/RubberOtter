import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { BluetoothProvider } from './context/BluetoothContext';
import { Header } from './components/header/Header';
import { NavBar, TabId } from './components/nav/NavBar';
import { TextPanel } from './components/text/TextPanel';
import { MediaPanel } from './components/media/MediaPanel';
import { PresentationPanel } from './components/presentation/PresentationPanel';
import { SecurityPanel } from './components/security/SecurityPanel';
import { GamingPanel } from './components/gaming/GamingPanel';
import { TrackpadPanel } from './components/trackpad/TrackpadPanel';
import { ConsolePanel } from './components/console/ConsolePanel';
import { FlasherPanel } from './components/flasher/FlasherPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('text');

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
      {/* Sticky Hardware Header with Desktop Navigation Tabs */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Responsive Workstation Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 flex flex-col">
        {/* Mobile Sticky Touch Navigation Bar */}
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Panel Viewport Container */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'text' && <TextPanel />}
          {activeTab === 'media' && <MediaPanel />}
          {activeTab === 'reader' && <PresentationPanel />}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'gaming' && <GamingPanel />}
          {activeTab === 'trackpad' && <TrackpadPanel />}
          {activeTab === 'console' && <ConsolePanel />}
          {activeTab === 'flasher' && <FlasherPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <BluetoothProvider>
        <AppContent />
      </BluetoothProvider>
    </SettingsProvider>
  );
};

export default App;
