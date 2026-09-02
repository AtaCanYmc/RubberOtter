import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  Settings,
  Volume2,
  Smartphone,
  Shield,
  RotateCcw,
  Network,
  Monitor,
  Apple,
  Laptop,
  Moon,
  Sun
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../services/storage/macroStore';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleResetSettings = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Header Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
            <Settings className="w-5 h-5 text-otter-600 dark:text-otter-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Application Configuration</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Appearance theme, target OS, protocol engine & GATT parameters</p>
          </div>
        </div>

        <button
          onClick={handleResetSettings}
          className="btn-tactile p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors"
          title="Reset to Factory Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Appearance Theme Selector */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Moon className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Appearance Theme</h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Dark Mode */}
          <button
            onClick={() => updateSettings({ themeMode: 'dark' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.themeMode === 'dark'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Moon className={`w-4 h-4 mx-auto mb-1.5 ${settings.themeMode === 'dark' ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <h4 className="text-xs font-semibold">Dark</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">Obsidian Dark</p>
          </button>

          {/* Light Mode */}
          <button
            onClick={() => updateSettings({ themeMode: 'light' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.themeMode === 'light'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sun className={`w-4 h-4 mx-auto mb-1.5 ${settings.themeMode === 'light' ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <h4 className="text-xs font-semibold">Light</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">Clean White</p>
          </button>

          {/* System Auto */}
          <button
            onClick={() => updateSettings({ themeMode: 'system' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.themeMode === 'system'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Monitor className={`w-4 h-4 mx-auto mb-1.5 ${settings.themeMode === 'system' ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
            <h4 className="text-xs font-semibold">System</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">OS Sync</p>
          </button>
        </div>
      </div>

      {/* Target Host OS Selection */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Laptop className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Target Host PC Operating System</h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* macOS */}
          <button
            onClick={() => updateSettings({ targetOs: 'macos' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'macos'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Apple className={`w-4 h-4 mx-auto mb-1.5 ${settings.targetOs === 'macos' ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
            <h4 className="text-xs font-semibold">macOS</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">Apple Mac</p>
          </button>

          {/* Windows */}
          <button
            onClick={() => updateSettings({ targetOs: 'windows' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'windows'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Monitor className={`w-4 h-4 mx-auto mb-1.5 ${settings.targetOs === 'windows' ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
            <h4 className="text-xs font-semibold">Windows</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">PC / Surface</p>
          </button>

          {/* Linux */}
          <button
            onClick={() => updateSettings({ targetOs: 'linux' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'linux'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Laptop className={`w-4 h-4 mx-auto mb-1.5 ${settings.targetOs === 'linux' ? 'text-otter-600 dark:text-otter-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
            <h4 className="text-xs font-semibold">Linux</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">Ubuntu/Debian</p>
          </button>
        </div>
      </div>

      {/* Protocol Engine Selector */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Network className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Bluetooth Protocol Engine</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => updateSettings({ protocolMode: 'single_byte' })}
            className={`btn-tactile p-3.5 rounded-lg border text-left transition-all ${
              settings.protocolMode === 'single_byte'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <h4 className="text-xs font-semibold">Single-Byte Protocol</h4>
            <p className="text-[11px] opacity-75 font-mono mt-1">Direct HEX Codes (0x11 - 0x85)</p>
          </button>

          <button
            onClick={() => updateSettings({ protocolMode: 'framed_ascii' })}
            className={`btn-tactile p-3.5 rounded-lg border text-left transition-all ${
              settings.protocolMode === 'framed_ascii'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <h4 className="text-xs font-semibold">Framed ASCII Protocol</h4>
            <p className="text-[11px] opacity-75 font-mono mt-1">STX/ETX Framed + XOR Checksum</p>
          </button>
        </div>
      </div>

      {/* Feedback & Haptics */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          Feedback & Sound Effects
        </h3>

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Audio Clicks</h4>
              <p className="text-[11px] text-zinc-500">Synthesizes Web Audio click sounds on interaction</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => updateSettings({ enableSound: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-otter-500" />
          </label>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Mobile Haptics</h4>
              <p className="text-[11px] text-zinc-500">Triggers vibration pulses on mobile devices</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableHaptics}
              onChange={(e) => updateSettings({ enableHaptics: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-otter-500" />
          </label>
        </div>
      </div>

      {/* GATT Parameters */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Shield className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">HM-10 GATT UUID Parameters</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">GATT Service UUID</label>
            <input
              type="text"
              value={settings.serviceUuid}
              onChange={(e) => updateSettings({ serviceUuid: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-otter-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Characteristic UUID</label>
            <input
              type="text"
              value={settings.characteristicUuid}
              onChange={(e) => updateSettings({ characteristicUuid: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-otter-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
