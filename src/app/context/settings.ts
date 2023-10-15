import { createContext } from "react";
import { Settings } from "../../shared/interface";
import { baseSettings } from "../../shared/settings";

interface SettingsContext {
  settings: Settings;
  persistSettings: (settings: Settings) => void;
}

export const SettingsContext = createContext<SettingsContext>({
  settings: { ...baseSettings },
  persistSettings: (_) => {},
});
