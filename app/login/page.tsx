'use client'
import React, { useState } from 'react'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type FormData = { email: string; password: string }

const roleHome: Record<string, string> = {
    'Administrator':       '/admin',
    'Emergency Operator':  '/operator',
    'Field Officer':       '/field-officer',
    'Warehouse Manager':   '/warehouse',
    'Finance Officer':     '/finance',
}

const stats = [
    { value: '2.4s',  label: 'Avg Response Time' },
    { value: '99.9%', label: 'System Uptime' },
    { value: 'ACID',  label: 'DB Compliance' },
    { value: '100%',  label: 'Audit Coverage' },
]

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function onSubmit(data: FormData) {
        setLoading(true)
        try {
            const res = await signIn('credentials', { redirect: false, email: data.email, password: data.password })
            if (res?.ok) {
                toast.success('Access Granted')
                const session = await getSession()
                const role = session?.user?.role ?? ''
                router.replace(roleHome[role] ?? '/operator')
            } else {
                toast.error('Authentication Failed: Invalid credentials')
            }
        } catch {
            toast.error('System Error: Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-base)', overflow: 'hidden' }} className="max-lg:grid-cols-1">

            {/* ── Left: Hero panel ─────────────────────────────── */}
            <div style={{ position: 'relative', background: 'linear-gradient(160deg, #0a1628 0%, #071020 50%, #050810 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 3.5rem', overflow: 'hidden' }} className="hidden lg:flex">

                {/* Grid pattern overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.5 }} />

                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Top: branding */}
                <div style={{ position: 'relative', zIndex: 1 }} className="animate-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2.5rem' }}>
                        <div className="sidebar-logo-icon" style={{ width: 48, height: 48 }}>
                            <svg style={{ width: 24, height: 24, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>DISASTER MIS</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>CRISIS COMMAND SYSTEM</div>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '1.25rem' }}>
                        Smart Disaster<br />
                        <span className="gradient-text">Response Platform</span>
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 380, fontWeight: 400 }}>
                        Secure, real-time crisis management for high-stakes coordination, resource dispatch, and financial audit compliance.
                    </p>

                    {/* Feature chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem' }}>
                        {['Role-Based Access', 'ACID Transactions', 'Real-Time Alerts', 'Full Audit Trail', 'Multi-Agency Coordination'].map(f => (
                            <span key={f} className="chip" style={{ fontSize: '0.75rem' }}>
                                <svg style={{ width: 10, height: 10, color: 'var(--emerald)' }} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/></svg>
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom: stats grid */}
                <div style={{ position: 'relative', zIndex: 1 }} className="animate-in-delay-1">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {stats.map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1rem 0.875rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '0.4rem' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="live-dot pulse-dot" />
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            © 2026 National Disaster Response Agency · All data encrypted at rest
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Login form ──────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)', position: 'relative' }}>

                {/* Top accent gradient */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent-blue), var(--violet), var(--emerald))' }} />

                {/* Right-side glow */}
                <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }} className="animate-in">

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }} className="lg:hidden">
                        <div className="sidebar-logo-icon" style={{ width: 40, height: 40 }}>
                            <svg style={{ width: 20, height: 20, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DISASTER MIS</div>
                        </div>
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: '2.25rem' }}>
                        <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                            Secure Authentication
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Enter your government credentials to access the system
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                        {/* Email */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Government Email Address</label>
                            <div style={{ position: 'relative' }} suppressHydrationWarning>
                                <span style={{ position: 'absolute', inset: 'auto 0 0 0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <svg style={{ width: 15, height: 15, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                                    </svg>
                                </span>
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem', height: '44px' }}
                                    placeholder="name@ndra.gov.pk"
                                    autoComplete="email"
                                    {...register('email', { required: true })}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Access Password</label>
                            <div style={{ position: 'relative' }} suppressHydrationWarning>
                                <span style={{ position: 'absolute', inset: 'auto 0 0 0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <svg style={{ width: 15, height: 15, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', height: '44px' }}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    {...register('password', { required: true })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                >
                                    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                                        {showPassword
                                            ? <><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></>
                                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>
                                        }
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: '0.25rem', fontSize: '0.9375rem', letterSpacing: '0.01em' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <span className="loading-ring" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Authenticating...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
                                    </svg>
                                    Establish Secure Connection
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="divider" style={{ margin: '1.75rem 0' }} />

                    {/* Demo credentials */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.125rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                            <svg style={{ width: 12, height: 12, color: 'var(--amber)' }} viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd"/>
                            </svg>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Access</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {[
                                { role: 'Admin', color: 'var(--accent-blue-light)', cred: 'admin@mis.pk / admin123' },
                                { role: 'Operator', color: 'var(--emerald)', cred: 'operator@mis.pk / op123' },
                            ].map(d => (
                                <div key={d.role} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem 0.75rem' }}>
                                    <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{d.role}</p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.6 }}>{d.cred}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '1.5rem', fontWeight: 500 }}>
                        Secured with AES-256 · NDRA Auth Protocol v2.6
                    </p>
                </div>
            </div>
        </div>
    )
}
