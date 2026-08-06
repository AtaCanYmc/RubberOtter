import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Settings, Cpu, Volume2, Smartphone, Shield, RotateCcw } from 'lucide-react';
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
            <p className="text-xs text-slate-400">GATT parameters & Feedback options</p>
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

      {/* Hardware Driver Mode Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl border-brand-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Hardware Simulator Mode</h3>
              <p className="text-[10px] text-slate-400">
                Simulates HM-10 BLE without physical hardware
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useMockDriver}
              onChange={(e) => updateSettings({ useMockDriver: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
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
