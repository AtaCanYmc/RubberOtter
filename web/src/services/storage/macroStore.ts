import { CustomMacro, AppSettings, TargetOs, Language } from '../../@types/bluetooth';

const MACROS_KEY = 'master_key_custom_macros_v1';
const SETTINGS_KEY = 'master_key_settings_v1';

const detectOs = (): TargetOs => {
  if (typeof navigator !== 'undefined') {
    const platform = navigator.platform.toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) {
      return 'macos';
    }
    if (platform.includes('linux') || ua.includes('linux')) {
      return 'linux';
    }
  }
  return 'windows';
};

const detectLanguage = (): Language => {
  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('tr')) return 'tr';
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('es')) return 'es';
  }
  return 'en';
};

export const DEFAULT_MACROS: CustomMacro[] = [
  {
    id: 'cs_buy_armor',
    name: 'CS Buy Armor & Helmet',
    description: "Sequences 'b' -> Armor Menu (4) -> Helmet (2)",
    category: 'Gaming',
    bytes: [0x41],
    delayMs: 120,
  },
  {
    id: 'task_mgr',
    name: 'Open Task Manager',
    description: 'Triggers Ctrl + Shift + Esc shortcut',
    category: 'Security',
    bytes: [0x33],
    delayMs: 50,
  },
  {
    id: 'show_desktop',
    name: 'Toggle Show Desktop',
    description: 'Triggers Win + D shortcut',
    category: 'Security',
    bytes: [0x34],
    delayMs: 50,
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  serviceUuid: '0000ffe0-0000-1000-8000-00805f9b34fb',
  characteristicUuid: '0000ffe1-0000-1000-8000-00805f9b34fb',
  enableHaptics: true,
  enableSound: true,
  jiggleIntervalSec: 20,
  trackpadSensitivity: 2.5,
  protocolMode: 'single_byte',
  targetOs: detectOs(),
  themeMode: 'dark',
  language: detectLanguage(),
};

export function loadSavedMacros(): CustomMacro[] {
  try {
    const raw = localStorage.getItem(MACROS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved macros:', err);
  }
  return DEFAULT_MACROS;
}

export function saveMacros(macros: CustomMacro[]): void {
  try {
    localStorage.setItem(MACROS_KEY, JSON.stringify(macros));
  } catch (err) {
    console.error('Failed to save macros:', err);
  }
}

export function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load saved settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
