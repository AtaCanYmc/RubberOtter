import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, CustomMacro } from '../@types/bluetooth';
import { loadSavedSettings, saveSettings, loadSavedMacros, saveMacros } from '../services/storage/macroStore';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  macros: CustomMacro[];
  addMacro: (macro: CustomMacro) => void;
  deleteMacro: (id: string) => void;
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

  // Apply theme to document HTML element
  useEffect(() => {
    const applyTheme = () => {
      const mode = settings.themeMode || 'dark';
      const root = document.documentElement;

      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else if (mode === 'system') {
        const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
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

  const addMacro = (macro: CustomMacro) => {
    setMacros((prev) => [...prev.filter((m) => m.id !== macro.id), macro]);
  };

  const deleteMacro = (id: string) => {
    setMacros((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, macros, addMacro, deleteMacro }}>
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
