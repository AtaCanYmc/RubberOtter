import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { BluetoothProvider } from './context/BluetoothContext';
import { Header } from './components/header/Header';
import { NavBar, TabId } from './components/nav/NavBar';
import { MediaPanel } from './components/media/MediaPanel';
import { PresentationPanel } from './components/presentation/PresentationPanel';
import { SecurityPanel } from './components/security/SecurityPanel';
import { GamingPanel } from './components/gaming/GamingPanel';
import { TrackpadPanel } from './components/trackpad/TrackpadPanel';
import { ConsolePanel } from './components/console/ConsolePanel';
import { SettingsPanel } from './components/settings/SettingsPanel';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('media');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cyber-dark text-slate-100 select-none">
      {/* Sticky Top Header */}
      <Header />

      {/* Tab View Pane Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col">
        {activeTab === 'media' && <MediaPanel />}
        {activeTab === 'reader' && <PresentationPanel />}
        {activeTab === 'security' && <SecurityPanel />}
        {activeTab === 'gaming' && <GamingPanel />}
        {activeTab === 'trackpad' && <TrackpadPanel />}
        {activeTab === 'console' && <ConsolePanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
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
