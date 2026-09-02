import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Settings, Volume2, Smartphone, Shield, RotateCcw, Network, Monitor, Apple, Laptop } from 'lucide-react';
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
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-otter-400 shadow-subtle">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Application Configuration</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Target OS profile, protocol engine, and GATT parameters</p>
          </div>
        </div>

        <button
          onClick={handleResetSettings}
          className="btn-tactile p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
          title="Reset to Factory Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Target Host OS Selection */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
          <Laptop className="w-4 h-4 text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-300">Target Host PC Operating System</h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => updateSettings({ targetOs: 'macos' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'macos'
                ? 'bg-zinc-850 border-otter-500/60 text-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Apple className="w-4 h-4 mx-auto mb-1 text-zinc-200" />
            <h4 className="text-xs font-semibold">macOS</h4>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Apple Mac</p>
          </button>

          <button
            onClick={() => updateSettings({ targetOs: 'windows' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'windows'
                ? 'bg-zinc-850 border-otter-500/60 text-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-4 h-4 mx-auto mb-1 text-zinc-200" />
            <h4 className="text-xs font-semibold">Windows</h4>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">PC / Surface</p>
          </button>

          <button
            onClick={() => updateSettings({ targetOs: 'linux' })}
            className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
              settings.targetOs === 'linux'
                ? 'bg-zinc-850 border-otter-500/60 text-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-4 h-4 mx-auto mb-1 text-zinc-200" />
            <h4 className="text-xs font-semibold">Linux</h4>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Ubuntu/Debian</p>
          </button>
        </div>
      </div>

      {/* Protocol Engine Selector */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
          <Network className="w-4 h-4 text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-300">Bluetooth Protocol Engine</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => updateSettings({ protocolMode: 'single_byte' })}
            className={`btn-tactile p-3.5 rounded-lg border text-left transition-all ${
              settings.protocolMode === 'single_byte'
                ? 'bg-zinc-850 border-otter-500/60 text-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <h4 className="text-xs font-semibold">Single-Byte Protocol</h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-1">Direct HEX Codes (0x11 - 0x85)</p>
          </button>

          <button
            onClick={() => updateSettings({ protocolMode: 'framed_ascii' })}
            className={`btn-tactile p-3.5 rounded-lg border text-left transition-all ${
              settings.protocolMode === 'framed_ascii'
                ? 'bg-zinc-850 border-otter-500/60 text-zinc-100 font-semibold shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <h4 className="text-xs font-semibold">Framed ASCII Protocol</h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-1">STX/ETX Framed + XOR Checksum</p>
          </button>
        </div>
      </div>

      {/* Feedback & Haptics */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <h3 className="text-xs font-semibold text-zinc-300 pb-2 border-b border-zinc-800">
          Feedback & Sound Effects
        </h3>

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Audio Clicks</h4>
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
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-otter-500" />
          </label>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Mobile Haptics</h4>
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
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-otter-500" />
          </label>
        </div>
      </div>

      {/* GATT Parameters */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
          <Shield className="w-4 h-4 text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-300">HM-10 GATT UUID Parameters</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">GATT Service UUID</label>
            <input
              type="text"
              value={settings.serviceUuid}
              onChange={(e) => updateSettings({ serviceUuid: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-otter-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Characteristic UUID</label>
            <input
              type="text"
              value={settings.characteristicUuid}
              onChange={(e) => updateSettings({ characteristicUuid: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-otter-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
