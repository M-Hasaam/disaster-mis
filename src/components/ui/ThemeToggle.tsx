'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
    const { theme, toggle } = useTheme()
    const isDark = theme === 'dark'

    return (
        <motion.button
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            whileTap={{ scale: 0.92 }}
            style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: 'flex', position: 'absolute' }}
                    >
                        {/* Sun */}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="4"/>
                            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                        </svg>
                    </motion.span>
                ) : (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: 60, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -60, scale: 0.6 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: 'flex', position: 'absolute' }}
                    >
                        {/* Moon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                        </svg>
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
