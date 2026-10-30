"use client"

import * as React from "react"
import { ThemeProviderContext } from "@/context/theme-context"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => {
      try {
        const stored = localStorage.getItem(storageKey)
        return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme
      } catch { return defaultTheme }
    }
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (theme !== "light" && theme !== "dark" && theme !== "system") return
      setTheme(theme)
      try { localStorage.setItem(storageKey, theme) } catch { /* Theme remains usable in memory. */ }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
