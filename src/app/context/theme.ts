import { createContext } from "react";

export enum ThemeType {
  DARK = "dark",
  LIGHT = "light",
}

export interface Theme {
  theme: ThemeType;
  setTheme: () => void;
}

export const ThemeContext = createContext({
  theme: ThemeType.LIGHT,
  setTheme: () => {},
});

export function isDark() {
  return document.documentElement.getAttribute("data-theme") === ThemeType.DARK;
}

export function isLight() {
  return (
    document.documentElement.getAttribute("data-theme") === ThemeType.LIGHT
  );
}

export function swap(onSwap: (t: ThemeType) => void) {
  if (isDark()) {
    document.documentElement.setAttribute("data-theme", ThemeType.LIGHT);
    onSwap(ThemeType.LIGHT);
  } else {
    document.documentElement.setAttribute("data-theme", ThemeType.DARK);
    onSwap(ThemeType.DARK);
  }
}

export function generateColor(token: string) {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = token.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash *= 100;
  const hue = hash % 360;
  const saturation = 100;
  const light = isDark() ? 70 : 30;
  return `hsl(${hue}, ${saturation}%, ${light}%)`;
}
