import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, CustomMacro, Language } from '../@types/bluetooth';
import { loadSavedSettings, saveSettings, loadSavedMacros, saveMacros } from '../services/storage/macroStore';
import { translations, Translations } from '../i18n/translations';
import { universalBle } from '../services/bluetooth/universalBle';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  macros: CustomMacro[];
  addMacro: (macro: CustomMacro) => void;
  deleteMacro: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSavedSettings);
  const [macros, setMacros] = useState<CustomMacro[]>(loadSavedMacros);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveMacros(macros);
  }, [macros]);

  // Apply theme to document HTML element & sync Native Mobile Status Bar + Meta Theme Color
  useEffect(() => {
    const applyTheme = () => {
      const mode = settings.themeMode || 'dark';
      const root = document.documentElement;
      let isDark = true;

      if (mode === 'dark') {
        root.classList.add('dark');
        isDark = true;
      } else if (mode === 'light') {
        root.classList.remove('dark');
        isDark = false;
      } else if (mode === 'system') {
        const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) {
          root.classList.add('dark');
          isDark = true;
        } else {
          root.classList.remove('dark');
          isDark = false;
        }
      }

      // 1. Set explicit colorScheme on document
      root.style.colorScheme = isDark ? 'dark' : 'light';

      // 2. Set explicit background on body to prevent white flashes on iOS bounce
      document.body.style.backgroundColor = isDark ? '#09090b' : '#fafafa';

      // 3. Dynamically update meta theme-color for iOS Safari / PWA top and bottom bars
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute('content', isDark ? '#09090b' : '#fafafa');
      }

      // 4. Update Native Mobile Status Bar (iOS Core / Android)
      universalBle.setStatusBarStyle(isDark);
    };

    applyTheme();

    if (settings.themeMode === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.themeMode]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setLanguage = (lang: Language) => {
    updateSettings({ language: lang });
  };

  const addMacro = (macro: CustomMacro) => {
    setMacros((prev) => [...prev.filter((m) => m.id !== macro.id), macro]);
  };

  const deleteMacro = (id: string) => {
    setMacros((prev) => prev.filter((m) => m.id !== id));
  };

  const currentLang: Language = settings.language || 'en';

  const t = useCallback(
    (key: keyof Translations): string => {
      const dict = translations[currentLang] || translations.en;
      return dict[key] || translations.en[key] || (key as string);
    },
    [currentLang]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        macros,
        addMacro,
        deleteMacro,
        language: currentLang,
        setLanguage,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage } = useSettings();
  return { t, language, setLanguage };
};
