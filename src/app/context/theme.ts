import {createContext} from "react";

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
