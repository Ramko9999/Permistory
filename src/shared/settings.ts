import { Settings } from "./interface";

export const baseSettings: Settings = { isDarkMode: false };

export async function getSettings(): Promise<Settings> {
  const response = await chrome.storage.sync.get("settings");
  const settings = "settings" in response ? response.settings : {};
  console.log("Invoked getSettings:", settings);
  return { ...baseSettings, ...settings };
}

export async function putSettings(settings: Settings): Promise<Settings> {
  console.log("Invoked putSettings with:", settings);
  await chrome.storage.sync.set({ settings });
  return settings;
}
