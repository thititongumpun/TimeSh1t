export const THEMES = ['timecheese', 'timecheese-dark', 'light', 'dark', 'retro', 'nord', 'abyss', 'aqua', 'lofi', 'acid', 'dracula'] as const
export type ThemeMode = (typeof THEMES)[number]

const THEME_STORAGE_KEY = 'timesh1t-theme'

function defaultTheme(): ThemeMode {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'timecheese-dark' : 'timecheese'
}

export function getStoredTheme(): ThemeMode {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (THEMES.includes(storedTheme as ThemeMode)) return storedTheme as ThemeMode
  return defaultTheme()
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}
