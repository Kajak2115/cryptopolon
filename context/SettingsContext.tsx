import { createContext, useContext, useState } from 'react';

interface Settings {
  interval: string;
}

const SettingsContext = createContext<{
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}>({ settings: { interval: '1m' }, setSettings: () => {} });

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({ interval: '1m' });
  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);