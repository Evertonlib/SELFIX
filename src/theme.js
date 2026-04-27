export const THEME_STORAGE_KEY = 'selfix_theme'
export const DARK_THEME = 'dark'
export const LIGHT_THEME = 'light'

export function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === LIGHT_THEME
      ? LIGHT_THEME
      : DARK_THEME
  } catch (_) {
    return DARK_THEME
  }
}

export function applyTheme(theme) {
  const root = document.getElementById('root')
  if (!root) return

  const isLight = theme === LIGHT_THEME
  root.classList.toggle('dark', !isLight)
  root.dataset.theme = isLight ? LIGHT_THEME : DARK_THEME
}
