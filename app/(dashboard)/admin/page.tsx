'use client'
import React, { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
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
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.value}</span></span>
                </div>
            ))}
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
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Initializing Secure Environment</p>
        </div>
    )

    const summary = stats?.summary || {}
    const dist = stats?.disasterDistribution || []

    const totalIncidents = dist.reduce((a: number, d: any) => a + (d.count || 0), 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Page header ─────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                        <div className="live-dot pulse-dot" />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Monitoring Active</span>
                    </div>
                    <h1 className="page-title">Executive Command Overview</h1>
                    <p className="page-subtitle">Real-time surveillance · system-wide resource and financial monitoring</p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export Report
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* ── KPI stat cards ───────────────────────────────── */}
            <div className="grid-4 animate-in-delay-1">
                <StatCard
                    title="Active Incidents"
                    value={summary.active_incidents ?? 0}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>}
                    trend={{ value: 12, label: 'vs last 24h', positive: false }}
                    description="Critical operations in progress"
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
                    trend={{ value: 5, label: 'Awaiting action', positive: true }}
                    description="Resource requests queued"
                />
                <StatCard
                    title="Treasury Balance"
                    value={`$${((summary.total_donations ?? 0) / 1000).toFixed(1)}k`}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>}
                    description="Disaster relief fund balance"
                />
            </div>

            {/* ── Charts row ───────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }} className="animate-in-delay-2">

                {/* Bar chart: incidents by type */}
                <div className="chart-container" style={{ height: 380, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title">
                        <span>Incident Distribution by Disaster Type</span>
                        <span className="badge badge-blue">{totalIncidents} total</span>
                    </div>
                    <div style={{ flex: 1, marginTop: '0.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dist} barSize={32} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="disaster_type" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.07)' }} />
                                <Bar dataKey="count" name="Incidents" radius={[5, 5, 0, 0]}>
                                    {dist.map((_: any, i: number) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut: severity allocation */}
                <div className="chart-container" style={{ height: 380, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title">
                        <span>Severity Allocation</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={dist}
                                    cx="50%" cy="50%"
                                    innerRadius={58}
                                    outerRadius={88}
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
                    {/* Legend */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {dist.map((entry: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.625rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{entry.disaster_type}</span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{entry.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent System Audit Trail ─────────────────────── */}
            <div className="card animate-in-delay-3">
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Recent System Audit Trail</h3>
                    <button className="btn btn-secondary btn-sm">View Full Logs</button>
                </div>
                <DataTable
                    columns={[
                        { header: 'Action',    accessor: (item: any) => <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{item.action}</span> },
                        { header: 'User',      accessor: (item: any) => <span style={{ color: 'var(--accent-blue-light)', fontWeight: 600, fontSize: '0.8125rem' }}>{item.user_name}</span> },
                        { header: 'Table',     accessor: (item: any) => <span className="chip">{item.table_name}</span> },
                        { header: 'Timestamp', accessor: (item: any) => <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'var(--text-secondary)' }}>{new Date(item.changed_at).toLocaleString()}</span> },
                        { header: 'Status',    accessor: () => <StatusBadge status="OK" /> },
                    ]}
                    data={auditLogs}
                />
            </div>
        </div>
    )
}
