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
    <div className="flex-1 flex flex-col space-y-5">
      <div className="glass-card rounded-2xl p-5 text-center shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Settings className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-100">Application Settings</h2>
            <p className="text-xs text-slate-400">Target Host OS & Protocol Mode</p>
          </div>
        </div>

        <button
          onClick={handleResetSettings}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset to Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Target Host OS Selection Card */}
      <div className="glass-card rounded-2xl p-5 space-y-3 shadow-xl border-indigo-500/30">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Laptop className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-300">Target Host PC Operating System</h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => updateSettings({ targetOs: 'macos' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.targetOs === 'macos'
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4 mx-auto mb-1 text-slate-200" />
            <h4 className="text-xs font-bold">macOS</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Apple Mac</p>
          </button>

          <button
            onClick={() => updateSettings({ targetOs: 'windows' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.targetOs === 'windows'
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
            <h4 className="text-xs font-bold">Windows</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">PC / Surface</p>
          </button>

          <button
            onClick={() => updateSettings({ targetOs: 'linux' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.targetOs === 'linux'
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <h4 className="text-xs font-bold">Linux</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Ubuntu / Debian</p>
          </button>
        </div>
      </div>

      {/* Protocol Selection Mode Card */}
      <div className="glass-card rounded-2xl p-5 space-y-3 shadow-xl border-brand-500/30">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Network className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-slate-300">Bluetooth Protocol Engine</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => updateSettings({ protocolMode: 'single_byte' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              settings.protocolMode === 'single_byte'
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <h4 className="text-xs font-bold">Single-Byte Protocol</h4>
            <p className="text-[10px] text-slate-400 mt-1">Master-Key & ESP32 BLE (0x11-0x85)</p>
          </button>

          <button
            onClick={() => updateSettings({ protocolMode: 'framed_ascii' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              settings.protocolMode === 'framed_ascii'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <h4 className="text-xs font-bold">Framed ASCII Protocol</h4>
            <p className="text-[10px] text-slate-400 mt-1">RubberOtter STX/ETX Framed Stream</p>
          </button>
        </div>
      </div>

      {/* Feedback Options Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
          Tactile Feedback & Audio
        </h3>

        {/* Sound Effects Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Sound Effects</h4>
              <p className="text-[10px] text-slate-400">Synthesizes Web Audio clicks</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => updateSettings({ enableSound: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
          </label>
        </div>

        {/* Haptics Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Haptic Vibration</h4>
              <p className="text-[10px] text-slate-400">Triggers mobile vibration motors</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableHaptics}
              onChange={(e) => updateSettings({ enableHaptics: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
          </label>
        </div>
      </div>

      {/* GATT Configuration Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Shield className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-slate-300">HM-10 GATT UUID Parameters</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Service UUID</label>
            <input
              type="text"
              value={settings.serviceUuid}
              onChange={(e) => updateSettings({ serviceUuid: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Characteristic UUID
            </label>
            <input
              type="text"
              value={settings.characteristicUuid}
              onChange={(e) => updateSettings({ characteristicUuid: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
