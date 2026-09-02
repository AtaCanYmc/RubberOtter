import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
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
  Globe,
  Radio,
  RefreshCw,
  Bluetooth,
  ShieldCheck,
  AlertCircle,
  Cpu,
  CheckCircle2,
  Signal,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../services/storage/macroStore';

interface ScannedDevice {
  id: string;
  name: string;
  rssi?: number;
  serviceUuids: string[];
  lastSeen: string;
  isConnected: boolean;
}

export const SettingsPanel: React.FC = () => {
  const { connectionState, connect, disconnect } = useBluetooth();
  const { settings, updateSettings, t, setLanguage } = useSettings();

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLeScanSupport, setHasLeScanSupport] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator && 'requestLEScan' in (navigator.bluetooth as any)) {
      setHasLeScanSupport(true);
    }
  }, []);

  const handleStartScan = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Otter' },
          { namePrefix: 'RubberOtter' },
          { namePrefix: 'HM-10' },
          { namePrefix: 'Master-Key' },
          { services: [settings.serviceUuid] }
        ],
        optionalServices: [
          settings.serviceUuid,
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '00001800-0000-1000-8000-00805f9b34fb'
        ]
      }).catch(async () => {
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            settings.serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '00001800-0000-1000-8000-00805f9b34fb'
          ]
        });
      });

      if (device) {
        const newDevice: ScannedDevice = {
          id: device.id,
          name: device.name || 'Unnamed BLE Device',
          rssi: -62,
          serviceUuids: [settings.serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
          lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isConnected: connectionState === 'connected'
        };

        setDevices((prev) => {
          const filtered = prev.filter((d) => d.id !== newDevice.id);
          return [newDevice, ...filtered];
        });

        await connect();
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setErrorMessage(err.message || 'Scanning failed');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const getRssiColor = (rssi?: number) => {
    if (!rssi) return 'text-zinc-500';
    if (rssi >= -65) return 'text-emerald-500 dark:text-emerald-400';
    if (rssi >= -78) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

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

      {/* 1. BLE Device Scanner Section */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-4 border-otter-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400">
              <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin text-otter-600 dark:text-otter-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t('scanner.title')}</h3>
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  GATT 0xFFE0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('scanner.description')}</p>
            </div>
          </div>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="btn-tactile px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 border border-zinc-900 dark:border-zinc-200 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? t('scanner.scanning') : t('scanner.startScan')}</span>
          </button>
        </div>

        {/* Advertisements API Badge */}
        {hasLeScanSupport && (
          <div className="rounded-lg p-2.5 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{t('scanner.advertisementSupport')}</span>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="rounded-lg p-2.5 flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Discovered Hardware Devices List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Bluetooth className="w-3.5 h-3.5 text-otter-600 dark:text-otter-400" />
              <span>{t('scanner.discovered')} ({devices.length})</span>
            </h4>
            {devices.length > 0 && (
              <button
                onClick={() => setDevices([])}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                {t('scanner.clearList')}
              </button>
            )}
          </div>

          {devices.length === 0 && !isScanning ? (
            <div className="rounded-lg p-4 text-center bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t('scanner.noDevices')}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t('scanner.noDevicesDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {devices.map((device) => {
                const isConnected = connectionState === 'connected';
                return (
                  <div
                    key={device.id}
                    className={`rounded-lg p-3 transition-all duration-150 border flex items-center justify-between gap-3 ${
                      isConnected
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{device.name}</h4>
                          {isConnected && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{t('scanner.connectedBadge')}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                          <span className={`flex items-center space-x-1 ${getRssiColor(device.rssi)}`}>
                            <Signal className="w-2.5 h-2.5" />
                            <span>{device.rssi} dBm</span>
                          </span>
                          <span>•</span>
                          <span>{t('scanner.seen')}: {device.lastSeen}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={isConnected ? disconnect : connect}
                      className={`btn-tactile px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 border ${
                        isConnected
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-rose-600 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-rose-400 border-rose-500/30'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-200'
                      }`}
                    >
                      {isConnected ? (
                        <span>{t('scanner.disconnectBtn')}</span>
                      ) : (
                        <>
                          <span>{t('scanner.connectBtn')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Language Selector */}
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

      {/* 3. Appearance Theme Selector */}
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

      {/* 4. Target Host OS Selection */}
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

      {/* 5. Protocol Engine Selector */}
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

      {/* 6. Feedback & Haptics */}
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

      {/* 7. GATT Parameters */}
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
