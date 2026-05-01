import React from 'react'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import Sidebar from '@/components/ui/Sidebar'
import PageTransition from '@/components/ui/PageTransition'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const role     = session.user.role
    const name     = session.user.name
    const initials = name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'

    const avatarGradients: Record<string, string> = {
        'Administrator':      'linear-gradient(135deg, #3b82f6, #6366f1)',
        'Emergency Operator': 'linear-gradient(135deg, #f43f5e, #f97316)',
        'Warehouse Manager':  'linear-gradient(135deg, #f59e0b, #84cc16)',
        'Finance Officer':    'linear-gradient(135deg, #10b981, #06b6d4)',
        'Field Officer':      'linear-gradient(135deg, #8b5cf6, #ec4899)',
    }
    const avatarGrad = avatarGradients[role] ?? avatarGradients['Administrator']

    return (
        <div className="main-layout">
            <Sidebar role={role} />
            <main className="main-content">

                {/* ── Topbar ─────────────────────────────────────── */}
                <header className="topbar">

                    {/* Left: system status + search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="live-dot pulse-dot" />
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Operational
                            </span>
                        </div>

                    </div>

                    {/* Right: notifications + user */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* Notification bell */}
                        <button
                            style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
                            className="btn-ghost"
                            aria-label="Notifications"
                        >
                            <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                            </svg>
                            <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: 'var(--rose)', borderRadius: '50%', border: '1.5px solid var(--bg-topbar)', animation: 'pulse-dot 2.4s ease-in-out infinite' }} />
                        </button>

                        {/* Divider */}
                        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                        {/* User info + avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0 0.125rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{name}</p>
                                <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{role.split(' ')[0]}</p>
                            </div>
                            <div style={{
                                width: 34, height: 34,
                                borderRadius: 'var(--r-md)',
                                background: avatarGrad,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6875rem', fontWeight: 800,
                                color: '#fff',
                                letterSpacing: '0.04em',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                                flexShrink: 0,
                                border: '1px solid rgba(255,255,255,0.15)',
                            }}>
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Page content ───────────────────────────────── */}
                <div className="page-content">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    )
}
