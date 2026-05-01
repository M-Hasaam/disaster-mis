'use client'
import React, { useState } from 'react'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

type FormData = { email: string; password: string }

const roleHome: Record<string, string> = {
    'Administrator':      '/admin',
    'Emergency Operator': '/operator',
    'Field Officer':      '/field-officer',
    'Warehouse Manager':  '/warehouse',
    'Finance Officer':    '/finance',
}

const features = [
    { label: 'Role-Based Access Control',       icon: '🔐' },
    { label: 'ACID Transaction Compliance',      icon: '🛡' },
    { label: 'Real-Time Emergency Alerts',       icon: '⚡' },
    { label: 'Full Audit Trail Coverage',        icon: '📋' },
    { label: 'Multi-Agency Coordination',        icon: '🌐' },
]

const stats = [
    { value: '2.4s',  label: 'Avg Response' },
    { value: '99.9%', label: 'System Uptime' },
    { value: 'ACID',  label: 'DB Standard' },
    { value: '100%',  label: 'Audit Cover' },
]

const demoAccounts = [
    { short: 'Admin',     role: 'Administrator',      email: 'admin@mis.pk',     password: 'admin123', color: '#14b8a6' },
    { short: 'Operator',  role: 'Emergency Operator', email: 'operator@mis.pk',  password: 'op123',    color: '#f43f5e' },
    { short: 'Warehouse', role: 'Warehouse Manager',  email: 'warehouse@mis.pk', password: 'wh123',    color: '#f59e0b' },
    { short: 'Finance',   role: 'Finance Officer',    email: 'finance@mis.pk',   password: 'fin123',   color: '#10b981' },
]

/* ── Variants ─────────────────────────────────────────────── */
const leftStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
}
const leftItem = {
    hidden: { opacity: 0, x: -22 },
    show:   { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
}
const rightCard = {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 26, delay: 0.14 } },
}

export default function LoginPage() {
    const { register, handleSubmit, setValue } = useForm<FormData>()
    const [loading,      setLoading]      = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [filledRole,   setFilledRole]   = useState<string | null>(null)
    const router = useRouter()

    async function onSubmit(data: FormData) {
        setLoading(true)
        try {
            const res = await signIn('credentials', { redirect: false, email: data.email, password: data.password })
            if (res?.ok) {
                toast.success('Access Granted')
                const session = await getSession()
                router.replace(roleHome[session?.user?.role ?? ''] ?? '/operator')
            } else {
                toast.error('Authentication Failed — Invalid credentials')
            }
        } catch {
            toast.error('System Error — Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    async function fillDemo(acc: typeof demoAccounts[0]) {
        setFilledRole(acc.short)
        setValue('email',    acc.email)
        setValue('password', acc.password)
        setLoading(true)
        try {
            const res = await signIn('credentials', { redirect: false, email: acc.email, password: acc.password })
            if (res?.ok) {
                toast.success(`Access Granted — ${acc.role}`)
                const session = await getSession()
                router.replace(roleHome[session?.user?.role ?? ''] ?? '/operator')
            } else {
                toast.error('Authentication Failed — Invalid credentials')
            }
        } catch {
            toast.error('System Error — Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-base)', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════════════════
                LEFT — always-dark atmospheric hero panel
            ══════════════════════════════════════════════════ */}
            <motion.div
                initial="hidden" animate="show" variants={leftStagger}
                style={{
                    position: 'relative',
                    background: 'linear-gradient(155deg, #0b1916 0%, #081210 50%, #060809 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: '2.5rem 3rem', overflow: 'hidden',
                }}
                className="hidden lg:flex"
            >
                {/* Grid texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(20,184,166,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.055) 1px, transparent 1px)',
                    backgroundSize: '52px 52px',
                }} />

                {/* Animated primary orb */}
                <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: '-18%', left: '-12%',
                        width: 540, height: 540,
                        background: 'radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 68%)',
                        borderRadius: '50%', pointerEvents: 'none',
                    }}
                />
                {/* Secondary orb */}
                <div style={{
                    position: 'absolute', bottom: '-8%', right: '-12%',
                    width: 420, height: 420,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 68%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                {/* ── Top section ── */}
                <div style={{ position: 'relative', zIndex: 1 }}>

                    {/* Brand + live badge */}
                    <motion.div variants={leftItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div className="sidebar-logo-icon" style={{ width: 46, height: 46 }}>
                                <svg style={{ width: 22, height: 22, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#eef2f0', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.1 }}>DISASTER MIS</div>
                                <div style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 2 }}>CRISIS COMMAND SYSTEM</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '100px', padding: '0.28rem 0.7rem' }}>
                            <div className="live-dot pulse-dot" style={{ width: 6, height: 6 }} />
                            <span style={{ fontSize: '0.5875rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SYSTEMS LIVE</span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={leftItem} style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#eef2f0', letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: '1.25rem' }}>
                            Command Center<br />
                            <span style={{
                                background: 'linear-gradient(90deg, #2dd4bf 0%, #34d399 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                Built for Crisis.
                            </span>
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: 360 }}>
                            Secure, real-time coordination for high-stakes emergency response, resource dispatch, and full financial compliance.
                        </p>
                    </motion.div>

                    {/* Feature list */}
                    <motion.div variants={leftItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {features.map(f => (
                            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.28)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg style={{ width: 10, height: 10, color: '#2dd4bf' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                                    </svg>
                                </div>
                                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{f.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── Bottom stats ── */}
                <motion.div variants={leftItem} style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(20,184,166,0.3), transparent)', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                        {stats.map((s, i) => (
                            <div key={s.label} style={{
                                paddingRight: '1rem', paddingLeft: i > 0 ? '1rem' : 0,
                                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            }}>
                                <p style={{ fontSize: '1.375rem', fontWeight: 900, color: '#eef2f0', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                                <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 700, marginTop: '0.3rem' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.5875rem', color: 'rgba(255,255,255,0.16)', marginTop: '1.25rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                        © 2026 National Disaster Response Agency · All data encrypted at rest
                    </p>
                </motion.div>
            </motion.div>

            {/* ══════════════════════════════════════════════════
                RIGHT — theme-aware auth form
            ══════════════════════════════════════════════════ */}
            <div suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>

                {/* Sweep line at top */}
                <div className="status-line" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

                {/* Ambient glow */}
                <div style={{ position: 'absolute', top: '20%', right: '-12%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '12%', left: '-8%',  width: 260, height: 260, background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <motion.div initial="hidden" animate="show" variants={rightCard} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }} className="lg:hidden">
                        <div className="sidebar-logo-icon" style={{ width: 40, height: 40 }}>
                            <svg style={{ width: 20, height: 20, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DISASTER MIS</div>
                    </div>

                    {/* ── Form card ── */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-2xl)',
                        padding: '2.25rem 2rem 2rem',
                        boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.04) inset',
                        position: 'relative', overflow: 'hidden',
                        marginBottom: '1.125rem',
                    }}>
                        {/* Top shimmer line */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.45), transparent)' }} />

                        {/* Header */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ width: 7, height: 7, borderRadius: '50%', background: '#14b8a6', boxShadow: '0 0 8px rgba(20,184,166,0.8)' }}
                                />
                                <span style={{ fontSize: '0.5875rem', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.11em' }}>SECURE ACCESS PORTAL</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.375rem' }}>
                                Sign in to your account
                            </h2>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                Use your government credentials to access the MIS dashboard.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Email field */}
                            <div>
                                <label className="form-label">Email address</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                                        <svg style={{ width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="form-input"
                                        style={{ paddingLeft: '2.375rem', height: '44px' }}
                                        placeholder="name@ndra.gov.pk"
                                        autoComplete="email"
                                        {...register('email', { required: true })}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                                        <svg style={{ width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        style={{ paddingLeft: '2.375rem', paddingRight: '2.75rem', height: '44px' }}
                                        placeholder="••••••••••"
                                        autoComplete="current-password"
                                        {...register('password', { required: true })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                                    >
                                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                            {showPassword
                                                ? <><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></>
                                                : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.015 } : {}}
                                whileTap={!loading ? { scale: 0.975 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', height: 46, marginTop: '0.25rem', fontSize: '0.9375rem', letterSpacing: '0.01em' }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {loading ? (
                                        <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <span className="loading-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                            Authenticating...
                                        </motion.span>
                                    ) : (
                                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
                                            </svg>
                                            Establish Secure Connection
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </form>
                    </div>

                    {/* ── Demo credentials ── */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            <span style={{ fontSize: '0.5875rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                                Demo accounts — click to fill
                            </span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {demoAccounts.map(acc => (
                                <motion.button
                                    key={acc.short}
                                    type="button"
                                    onClick={() => fillDemo(acc)}
                                    whileHover={{ scale: 1.025 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: filledRole === acc.short ? `${acc.color}12` : 'var(--bg-card)',
                                        border: `1px solid ${filledRole === acc.short ? acc.color + '44' : 'var(--border)'}`,
                                        borderRadius: 'var(--r-md)',
                                        padding: '0.6rem 0.75rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.15s, border-color 0.15s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.2rem' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: acc.color, flexShrink: 0, boxShadow: filledRole === acc.short ? `0 0 6px ${acc.color}` : 'none' }} />
                                        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: acc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{acc.short}</span>
                                    </div>
                                    <p style={{ fontSize: '0.5875rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.5 }}>{acc.email}</p>
                                    <p style={{ fontSize: '0.5875rem', color: 'var(--text-disabled)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.5 }}>{acc.password}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', fontSize: '0.5875rem', color: 'var(--text-disabled)', marginTop: '1.125rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                        AES-256 Encrypted · NDRA Auth Protocol v2.6 · © 2026
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
