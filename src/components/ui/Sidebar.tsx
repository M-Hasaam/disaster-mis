'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

/* ─── Module-level flag: entrance animations play only once per session ── */
let _sidebarInitialized = false

/* ─── Types ────────────────────────────────────────────────────────────── */
interface SidebarItemProps {
    href: string
    icon: React.ReactNode
    label: string
    badge?: string | number
    badgeColor?: string
}

/* ─── Animation variants ───────────────────────────────────────────────── */
const navStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
}

const navItemVariant = {
    hidden: { opacity: 0, x: -12, scale: 0.96 },
    show: {
        opacity: 1, x: 0, scale: 1,
        transition: { type: 'spring' as const, stiffness: 380, damping: 30 },
    },
}

const labelVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
}

/* ─── Shared spring for the sliding pill + bar ─────────────────────────── */
const PILL_SPRING = { type: 'spring' as const, stiffness: 500, damping: 42, mass: 0.55 }

/* ─── SectionLabel ─────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={labelVariant}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.875rem 0.75rem 0.375rem', marginTop: '0.125rem',
            }}
        >
            <span style={{
                fontSize: '0.5625rem', fontWeight: 800,
                color: 'rgba(59,130,246,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.15em',
                whiteSpace: 'nowrap',
            }}>
                {children}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(59,130,246,0.25), transparent)' }} />
        </motion.div>
    )
}

/* ─── SidebarItem ──────────────────────────────────────────────────────── */
function SidebarItem({ href, icon, label, badge, badgeColor = 'rose' }: SidebarItemProps) {
    const pathname = usePathname()
    const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
    const [hovered, setHovered] = useState(false)

    return (
        <motion.div
            variants={navItemVariant}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{ position: 'relative', marginBottom: '1px' }}
        >
            <Link
                href={href}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5625rem 0.875rem',
                    borderRadius: 'var(--r-md)',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#93c5fd' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.12s ease',
                    overflow: 'visible',
                }}
            >
                {/* Sliding active pill — bare layoutId, NO AnimatePresence (fights shared layout) */}
                {active && (
                    <motion.div
                        layoutId="sidebar-pill"
                        transition={PILL_SPRING}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 'var(--r-md)',
                            background: 'linear-gradient(90deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 100%)',
                            border: '1px solid rgba(59,130,246,0.28)',
                            boxShadow: '0 0 20px rgba(59,130,246,0.09), inset 0 1px 0 rgba(255,255,255,0.07)',
                        }}
                    />
                )}

                {/* Sliding glowing left bar — same treatment */}
                {active && (
                    <motion.div
                        layoutId="sidebar-bar"
                        transition={PILL_SPRING}
                        style={{
                            position: 'absolute',
                            left: -12,
                            top: '16%',
                            bottom: '16%',
                            width: 3,
                            borderRadius: '0 4px 4px 0',
                            background: 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)',
                            boxShadow: '0 0 10px rgba(59,130,246,0.9), 0 0 22px rgba(59,130,246,0.35)',
                        }}
                    />
                )}

                {/* Hover ghost — AnimatePresence is correct here (no layoutId) */}
                <AnimatePresence>
                    {!active && hovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            style={{
                                position: 'absolute', inset: 0,
                                borderRadius: 'var(--r-md)',
                                background: 'rgba(255,255,255,0.035)',
                                border: '1px solid rgba(255,255,255,0.04)',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Icon */}
                <motion.span
                    animate={{ scale: active ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                    style={{
                        position: 'relative', zIndex: 1,
                        display: 'flex', flexShrink: 0,
                        width: 16, height: 16,
                    }}
                >
                    {icon}
                </motion.span>

                {/* Label */}
                <span style={{ position: 'relative', zIndex: 1, flex: 1, letterSpacing: '-0.01em' }}>
                    {label}
                </span>

                {/* Badge */}
                <AnimatePresence>
                    {badge !== undefined && (
                        <motion.span
                            key={String(badge)}
                            initial={{ scale: 0.5, opacity: 0, y: -4 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: -4 }}
                            transition={{ type: 'spring', stiffness: 440, damping: 22 }}
                            className={`badge badge-${badgeColor}`}
                            style={{ position: 'relative', zIndex: 1, padding: '1px 6px', fontSize: '0.6rem' }}
                        >
                            {badge}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    )
}

/* ─── System Clock ─────────────────────────────────────────────────────── */
function SystemClock() {
    const [time, setTime] = useState('')
    const [date, setDate] = useState('')

    useEffect(() => {
        const update = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
            setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
        }
        update()
        const id = setInterval(update, 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div style={{
            padding: '0.625rem 0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--r-md)',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '0.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    System Time
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)', animation: 'pulse-dot 2.2s ease-in-out infinite' }} />
                    <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIVE</span>
                </div>
            </div>
            <p style={{
                fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--text-primary)', letterSpacing: '0.1em',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>
                {time}
            </p>
            <p style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem', fontWeight: 600 }}>
                {date}
            </p>
        </div>
    )
}

/* ─── Icons ────────────────────────────────────────────────────────────── */
const icons = {
    overview:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    incidents:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>,
    teams:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
    inventory:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>,
    finance:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>,
    approvals:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    reports:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
    performance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
    settings:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>,
    hospital:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/></svg>,
    shield:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
}

/* ─── Role config ──────────────────────────────────────────────────────── */
const ROLE_RGB: Record<string, string> = {
    'Administrator':      '59,130,246',
    'Emergency Operator': '244,63,94',
    'Warehouse Manager':  '245,158,11',
    'Finance Officer':    '16,185,129',
    'Field Officer':      '139,92,246',
}

/* ─── Sidebar ──────────────────────────────────────────────────────────── */
export default function Sidebar({ role }: { role: string }) {
    const isAdmin     = role === 'Administrator'
    const isOperator  = role === 'Emergency Operator'
    const isWarehouse = role === 'Warehouse Manager'
    const isFinance   = role === 'Finance Officer'
    const isField     = role === 'Field Officer'

    const homeHref = isAdmin ? '/admin' : isOperator ? '/operator' : isWarehouse ? '/warehouse' : isFinance ? '/finance' : '/field-officer'
    const rgb = ROLE_RGB[role] ?? ROLE_RGB['Administrator']

    /* Entrance animations only play once — survives hot-reload and strict-mode double-mount */
    const isFirst = useRef(!_sidebarInitialized)
    useEffect(() => {
        _sidebarInitialized = true
    }, [])

    const first = isFirst.current

    return (
        <aside className="sidebar">
            {/* Animated gradient status line */}
            <div className="status-line" />

            {/* ── Logo ──────────────────────────────────────── */}
            <motion.div
                className="sidebar-logo"
                initial={first ? { opacity: 0, y: -8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="sidebar-logo-icon" style={{ position: 'relative' }}>
                    <motion.div
                        style={{
                            position: 'absolute', inset: -4,
                            borderRadius: 'var(--r-lg)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            pointerEvents: 'none',
                        }}
                        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <svg style={{ width: 20, height: 20, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd"/>
                    </svg>
                </div>
                <div>
                    <div className="sidebar-logo-text">DISASTER MIS</div>
                    <div className="sidebar-logo-sub">CRISIS COMMAND · v1.0</div>
                </div>
            </motion.div>

            {/* ── Role badge ─────────────────────────────────── */}
            <motion.div
                initial={first ? { opacity: 0, scale: 0.94 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div style={{
                    background: `rgba(${rgb}, 0.08)`,
                    border: `1px solid rgba(${rgb}, 0.22)`,
                    borderRadius: 'var(--r-md)',
                    padding: '0.4rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <motion.div
                        style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: `rgb(${rgb})`, flexShrink: 0,
                            boxShadow: `0 0 8px rgba(${rgb},0.8)`,
                        }}
                        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span style={{
                        fontSize: '0.6875rem', fontWeight: 700,
                        color: `rgba(${rgb},0.9)`,
                        textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1,
                    }}>
                        {role}
                    </span>
                    <span style={{
                        fontSize: '0.5rem', fontWeight: 800,
                        color: `rgb(${rgb})`,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        background: `rgba(${rgb},0.14)`,
                        padding: '2px 5px', borderRadius: '3px',
                    }}>
                        AUTH
                    </span>
                </div>
            </motion.div>

            {/* ── Navigation ─────────────────────────────────── */}
            <LayoutGroup id="sidebar-nav">
                <motion.nav
                    className="sidebar-nav"
                    initial={isFirst.current ? 'hidden' : false}
                    animate="show"
                    variants={navStagger}
                >
                    <SectionLabel>Overview</SectionLabel>
                    <SidebarItem href={homeHref} icon={icons.overview} label="Dashboard" />

                    <SectionLabel>Operations</SectionLabel>
                    {(isAdmin || isOperator) && (
                        <>
                            <SidebarItem href="/operator/incidents" icon={icons.incidents} label="Incidents" />
                            <SidebarItem href="/operator/hospitals" icon={icons.hospital} label="Hospitals" />
                        </>
                    )}
                    {(isAdmin || isWarehouse) && (
                        <SidebarItem href="/warehouse/inventory" icon={icons.inventory} label="Inventory" />
                    )}
                    {(isAdmin || isField) && (
                        <SidebarItem href="/field-officer/missions" icon={icons.teams} label="Missions" />
                    )}
                    {(isAdmin || isFinance) && (
                        <SidebarItem href="/finance/transactions" icon={icons.finance} label="Finance" />
                    )}

                    <SectionLabel>System</SectionLabel>
                    {isAdmin && (
                        <>
                            <SidebarItem href="/admin/approvals" icon={icons.approvals} label="Approvals" />
                            <SidebarItem href="/admin/users" icon={icons.settings} label="User Management" />
                        </>
                    )}
                    <SidebarItem href="/reports" icon={icons.reports} label="Reports" />
                    <SidebarItem href="/performance" icon={icons.performance} label="Performance" />
                </motion.nav>
            </LayoutGroup>

            {/* ── Footer ─────────────────────────────────────── */}
            <motion.div
                className="sidebar-footer"
                initial={first ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.35 }}
            >
                <SystemClock />

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.75rem', marginBottom: '0.5rem',
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    borderRadius: 'var(--r-md)',
                    fontSize: '0.6875rem', fontWeight: 700,
                    color: 'rgba(52,211,153,0.85)',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                    {icons.shield}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                        <span>Systems Nominal</span>
                    </span>
                    <motion.div
                        style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>

                <motion.button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="sidebar-item"
                    style={{
                        width: '100%', background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left', color: 'var(--text-muted)',
                    }}
                    whileHover={{ color: '#fb7185', backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: '8px' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                >
                    {icons.logout}
                    <span>Sign Out</span>
                </motion.button>
            </motion.div>
        </aside>
    )
}
