import { useEffect, useState } from 'react'
import { applyTheme, DARK_THEME, getInitialTheme, LIGHT_THEME, THEME_STORAGE_KEY } from '../theme'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === DARK_THEME

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (_) {}
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? LIGHT_THEME : DARK_THEME)}
      className="selfix-theme-toggle fixed right-5 top-14 z-[100] flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-colors active:scale-95"
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
