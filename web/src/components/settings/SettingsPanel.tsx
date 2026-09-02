import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Language } from '../../@types/bluetooth';
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
  Sun,
  Globe
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../services/storage/macroStore';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, t, setLanguage } = useSettings();

  const handleResetSettings = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  const languages: { id: Language; label: string; flag: string; nativeName: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { id: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { id: 'es', label: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Header Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
            <Settings className="w-5 h-5 text-otter-600 dark:text-otter-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t('settings.description')}</p>
          </div>
        </div>

        <button
          onClick={handleResetSettings}
          className="btn-tactile p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors"
          title={t('settings.resetDefaults')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Language Selector */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Globe className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('settings.languageTitle')}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
          {languages.map((lang) => {
            const isSelected = settings.language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`btn-tactile p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                    : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="text-lg block mb-1">{lang.flag}</span>
                <h4 className="text-xs font-semibold">{lang.label}</h4>
                <p className="text-[10px] opacity-75 font-mono mt-0.5">{lang.nativeName}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance Theme Selector */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Moon className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('settings.themeTitle')}</h3>
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
            <h4 className="text-xs font-semibold">{t('settings.dark')}</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">{t('settings.darkDesc')}</p>
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
            <h4 className="text-xs font-semibold">{t('settings.light')}</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">{t('settings.lightDesc')}</p>
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
            <h4 className="text-xs font-semibold">{t('settings.system')}</h4>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">{t('settings.systemDesc')}</p>
          </button>
        </div>
      </div>

      {/* Target Host OS Selection */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Laptop className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('settings.targetOsTitle')}</h3>
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
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('settings.protocolTitle')}</h3>
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
            <h4 className="text-xs font-semibold">{t('settings.singleByteTitle')}</h4>
            <p className="text-[11px] opacity-75 font-mono mt-1">{t('settings.singleByteDesc')}</p>
          </button>

          <button
            onClick={() => updateSettings({ protocolMode: 'framed_ascii' })}
            className={`btn-tactile p-3.5 rounded-lg border text-left transition-all ${
              settings.protocolMode === 'framed_ascii'
                ? 'bg-otter-500/10 dark:bg-otter-950/40 border-otter-500 text-otter-900 dark:text-otter-200 font-semibold shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <h4 className="text-xs font-semibold">{t('settings.framedAsciiTitle')}</h4>
            <p className="text-[11px] opacity-75 font-mono mt-1">{t('settings.framedAsciiDesc')}</p>
          </button>
        </div>
      </div>

      {/* Feedback & Haptics */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {t('settings.feedbackTitle')}
        </h3>

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('settings.soundEffects')}</h4>
              <p className="text-[11px] text-zinc-500">{t('settings.soundDesc')}</p>
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
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('settings.mobileHaptics')}</h4>
              <p className="text-[11px] text-zinc-500">{t('settings.hapticsDesc')}</p>
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
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('settings.gattTitle')}</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">{t('settings.serviceUuid')}</label>
            <input
              type="text"
              value={settings.serviceUuid}
              onChange={(e) => updateSettings({ serviceUuid: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-otter-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">{t('settings.charUuid')}</label>
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
