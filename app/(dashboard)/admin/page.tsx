'use client'
import React, { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-lg)' }}>
            {label && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.stroke }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {p.name}: {p.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

const AUDIT_ICON_MAP: Record<string, { color: string; svg: React.ReactNode }> = {
    INSERT: {
        color: 'var(--emerald)',
        svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
    },
    UPDATE: {
        color: 'var(--accent-blue)',
        svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>,
    },
    DELETE: {
        color: 'var(--rose)',
        svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>,
    },
}

function getAuditIcon(action: string) {
    const key = action?.toUpperCase().split(' ')[0] || 'UPDATE'
    return AUDIT_ICON_MAP[key] ?? AUDIT_ICON_MAP.UPDATE
}

function AuditTimeline({ logs }: { logs: any[] }) {
    if (!logs.length) return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <svg style={{ width: 28, height: 28, opacity: 0.2, margin: '0 auto 0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No audit events recorded</p>
        </div>
    )

    return (
        <div>
            {logs.map((log, i) => {
                const { color, svg } = getAuditIcon(log.action)
                return (
                    <div key={i} className="timeline-entry">
                        {/* Icon */}
                        <div style={{
                            width: 30, height: 30,
                            borderRadius: 'var(--r-sm)',
                            background: `${color}18`,
                            border: `1px solid ${color}33`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            color,
                        }}>
                            {svg}
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{log.action}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue-light)', fontWeight: 600 }}>{log.user_name}</span>
                                        <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem' }}>·</span>
                                        <span className="chip">{log.table_name}</span>
                                        <StatusBadge status="OK" />
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.6875rem', fontFamily: 'ui-monospace, monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap', letterSpacing: '0.03em', paddingTop: '0.125rem' }}>
                                    {new Date(log.changed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [sRes, aRes] = await Promise.all([
                    fetch('/api/admin/stats').then(r => r.json()),
                    fetch('/api/reports/audit-trail?limit=8').then(r => r.json())
                ])
                if (sRes.ok) setStats(sRes.data)
                if (aRes.ok) setAuditLogs(aRes.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Initializing Secure Environment</p>
        </div>
    )

    const summary = stats?.summary || {}
    const dist = stats?.disasterDistribution || []
    const totalIncidents = dist.reduce((a: number, d: any) => a + (d.count || 0), 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* ── Page header ──────────────────────────────────── */}
            <div className="command-header animate-in">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                        <div className="live-dot pulse-dot" />
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.1em', textShadow: '0 0 12px rgba(16,185,129,0.6)' }}>
                            Live Monitoring Active
                        </span>
                        <span className="kbd-pill" style={{ borderColor: 'rgba(59,130,246,0.35)', color: '#60a5fa' }}>ADMIN</span>
                    </div>
                    <h1 className="gradient-title" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                        Executive Command Overview
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(139,158,197,0.65)', marginTop: '0.4rem' }}>
                        Real-time surveillance · system-wide resource and financial monitoring
                    </p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 20px rgba(59,130,246,0.35)' }}>
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── KPI stat cards ────────────────────────────────── */}
            <div className="grid-4 animate-in-delay-1">
                <StatCard
                    title="Active Incidents"
                    value={summary.active_incidents ?? 0}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>}
                    trend={{ value: 12, label: 'vs last 24h', positive: false }}
                />
                <StatCard
                    title="Ready Teams"
                    value={summary.available_teams ?? 0}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
                    description="Units available for dispatch"
                />
                <StatCard
                    title="Pending Approvals"
                    value={summary.pending_approvals ?? 0}
                    iconColor="amber"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    trend={{ value: 5, label: 'awaiting action', positive: true }}
                />
                <StatCard
                    title="Treasury Balance"
                    value={`$${((summary.total_donations ?? 0) / 1000).toFixed(1)}k`}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>}
                    description="Disaster relief fund balance"
                />
            </div>

            {/* ── Charts: bento 2/1 layout ─────────────────────── */}
            <div className="bento-row bento-2-1 animate-in-delay-2">

                {/* Bar chart: incidents by type (wide) */}
                <div className="chart-container" style={{ minHeight: 360, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, var(--bg-card) 50%)' }}>
                    <div className="chart-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.875rem', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>Incident Distribution</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-rose" style={{ background: 'rgba(244,63,94,0.18)', borderColor: 'rgba(244,63,94,0.45)', color: '#fb7185' }}>{totalIncidents} total</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, marginTop: '0.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dist} barSize={28} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="disaster_type" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                                <Bar dataKey="count" name="Incidents" radius={[5, 5, 0, 0]}>
                                    {dist.map((_: any, i: number) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={1} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right panel: donut + vitals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Donut: severity allocation */}
                    <div className="chart-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="chart-title">
                            <span>Severity Mix</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                            <ResponsiveContainer width="100%" height={140}>
                                <PieChart>
                                    <Pie
                                        data={dist}
                                        cx="50%" cy="50%"
                                        innerRadius={44}
                                        outerRadius={68}
                                        paddingAngle={3}
                                        dataKey="count"
                                        strokeWidth={0}
                                    >
                                        {dist.map((_: any, i: number) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', marginTop: '0.5rem' }}>
                            {dist.map((entry: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{entry.disaster_type}</span>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{entry.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System vitals compact card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.06) 60%, var(--bg-card) 100%)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        borderLeft: '3px solid rgba(16,185,129,0.7)',
                        borderRadius: 'var(--r-xl)',
                        padding: '1rem 1.125rem',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.1)',
                    }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.09em', textShadow: '0 0 12px rgba(16,185,129,0.5)', marginBottom: '0.75rem' }}>
                            System Vitals
                        </p>
                        {[
                            { label: 'DB Response',     value: '12ms',  rgb: '16,185,129'  },
                            { label: 'API Uptime',      value: '99.8%', rgb: '16,185,129'  },
                            { label: 'Active Sessions', value: '7',     rgb: '59,130,246'  },
                            { label: 'Errors (24h)',    value: '2',     rgb: '245,158,11'  },
                        ].map((v, i) => (
                            <div key={i} className="vitals-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: `rgb(${v.rgb})`, boxShadow: `0 0 6px rgba(${v.rgb},0.7)`, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{v.label}</span>
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: `rgb(${v.rgb})`, fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, monospace', textShadow: `0 0 8px rgba(${v.rgb},0.4)` }}>{v.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Audit Timeline ───────────────────────────────── */}
            <div className="card animate-in-delay-3">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>System Audit Trail</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Recent database operations across all modules</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{auditLogs.length} events</span>
                        <button className="btn btn-secondary btn-sm">View Full Logs</button>
                    </div>
                </div>
                <AuditTimeline logs={auditLogs} />
            </div>
        </div>
    )
}
