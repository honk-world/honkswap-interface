import React, { useContext, useLayoutEffect, useState } from 'react'
import { Sun, Moon } from 'react-feather'
import cookie from 'cookie-cutter'

type Theme = 'light' | 'dark'

export default function ThemeSwitch() {
  const { theme = 'dark', setTheme } = useTheme()

  const ICON = theme === 'dark' ? Sun : Moon

  return (
    <button
      onClick={() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'
        cookie.set('Theme', nextTheme)
        setTheme(nextTheme)
      }}
      className="inline-flex justify-center p-2 text-sm font-bold bg-transparent border rounded-full shadow-sm text-primary border-dark-800 hover:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-dark-800"
    >
      <ICON size="20" />
    </button>
  )
}

const themeContext = React.createContext<{
  theme: Theme
  setTheme(theme: Theme): void
}>({
  theme: 'dark',
  setTheme(theme: Theme) {},
})

export function ThemeProvider(props: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return cookie.get('Theme') || 'dark'
  })

  useLayoutEffect(() => {
    const themeEl = document.querySelector('[name="theme-color"]');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log(themeEl);
      themeEl && themeEl.setAttribute('content', '#F338C3')
    } else {
      document.documentElement.classList.remove('dark')
      themeEl && themeEl.setAttribute('content', '#8DCC56')
    }
  }, [theme])

  return (
    <themeContext.Provider
      value={{
        setTheme,
        theme,
      }}
    >
      {props.children}
    </themeContext.Provider>
  )
}

export const useTheme = () => {
  return useContext(themeContext)
}
