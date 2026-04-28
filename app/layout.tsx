import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata = {
    title: 'Disaster Response MIS',
    description: 'Smart Disaster Response Management Information System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className={geist.className}>
                <Toaster />
                {children}
            </body>
        </html>
    )
}
