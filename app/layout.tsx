import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata = {
    title: 'Disaster Response MIS',
    description: 'Smart Disaster Response Management Information System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Inline script in <head> executes before React hydration — prevents theme flash */}
                <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('mis-theme');document.documentElement.setAttribute('data-theme',t||'dark')}catch(e){}})()` }} />
            </head>
            <body suppressHydrationWarning className={geist.className}>
                <ThemeProvider>
                    <Toaster />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
