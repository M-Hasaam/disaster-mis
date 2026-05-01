'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
    theme: Theme
    toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} })

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('mis-theme') as Theme | null
        const resolved = stored ?? 'dark'
        setTheme(resolved)
        document.documentElement.setAttribute('data-theme', resolved)
    }, [])

    useEffect(() => {
        if (!mounted) return
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('mis-theme', theme)
    }, [theme, mounted])

    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}
