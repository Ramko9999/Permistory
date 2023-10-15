export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function generateColor(token: string, isDarkMode: boolean) {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = token.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash *= 100;
  const hue = hash % 360;
  const saturation = 100;
  const light = isDarkMode ? 70 : 30;
  return `hsl(${hue}, ${saturation}%, ${light}%)`;
}
