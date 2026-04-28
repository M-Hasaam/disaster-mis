'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import StatCard from '@/components/ui/StatCard'

export default function FieldOfficerDashboard() {
    const [missions, setMissions] = useState<any[]>([])
    const [loading, setLoading]   = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/reports/response-time').then(r => r.json())
                if (res.ok) setMissions(res.data)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Establishing Tactical Link</p>
        </div>
    )

    const active    = missions.filter(m => !['Completed', 'Cancelled'].includes(m.assignment_status))
    const completed = missions.filter(m => m.assignment_status === 'Completed')
    const avgDur    = completed.length
        ? Math.round(completed.reduce((a, m) => a + (m.duration_minutes ?? 0), 0) / completed.length)
        : 0

    const nextAction = (status: string) => {
        if (status === 'Assigned')  return { label: 'Mark En Route',      color: 'btn-primary' }
        if (status === 'EnRoute')   return { label: 'Mark On Site',       color: 'btn-amber' }
        if (status === 'OnSite')    return { label: 'Mission Completed',  color: 'btn-success' }
        return null
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                        <div className="critical-dot pulse-dot" />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tactical Operations Active</span>
                    </div>
                    <h1 className="page-title">Field Operations Command</h1>
                    <p className="page-subtitle">Real-time mission tracking · Tactical status reporting · Team coordination</p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                        Mission Log
                    </button>
                    <button className="btn btn-primary">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Request Support
                    </button>
                </div>
            </div>

            {/* ── Stats ────────────────────────────────────────── */}
            <div className="grid-3">
                <StatCard
                    title="Active Missions"
                    value={active.length}
                    iconColor="amber"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>}
                    description="Tactical deployments in progress"
                />
                <StatCard
                    title="Teams Deployed"
                    value={new Set(active.map((m: any) => m.team_name)).size}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
                    description="Unique units currently deployed"
                />
                <StatCard
                    title="Avg Response Time"
                    value={avgDur > 0 ? `${avgDur}m` : 'N/A'}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    description="Mean time to mission completion"
                />
            </div>

            {/* ── Active mission cards ─────────────────────────── */}
            {active.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', borderWidth: 2, borderColor: 'var(--border)' }}>
                    <svg style={{ width: 36, height: 36, color: 'var(--text-disabled)', marginBottom: '1rem', margin: '0 auto 1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>No active tactical deployments at this time</p>
                </div>
            ) : (
                <div>
                    <h3 className="section-title">Active Deployments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
                        {active.map((m: any, i: number) => {
                            const action = nextAction(m.assignment_status)
                            return (
                                <div key={i} className="card" style={{ borderLeft: '3px solid var(--amber)' }}>
                                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Active Mission</span>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.25 }}>
                                                {m.disaster_type}
                                            </h3>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{m.location}</p>
                                        </div>
                                        <StatusBadge status={m.assignment_status} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Unit Assigned', value: m.team_name },
                                            { label: 'Deployed At',   value: new Date(m.assigned_at).toLocaleTimeString() },
                                        ].map(p => (
                                            <div key={p.label} style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{p.label}</p>
                                                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {action && (
                                            <button className={`btn ${action.color}`} style={{ flex: 1, justifyContent: 'center' }}>
                                                {action.label}
                                            </button>
                                        )}
                                        <button className="btn btn-secondary btn-sm">Details</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Mission History ──────────────────────────────── */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Mission History Ledger</h3>
                    <span className="badge badge-slate">{completed.length} completed</span>
                </div>
                <DataTable
                    columns={[
                        { header: 'Mission ID', accessor: (m: any) => <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{m.assignment_id}</span> },
                        { header: 'Incident',   accessor: (m: any) => (
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{m.disaster_type}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>{m.location}</p>
                            </div>
                        )},
                        { header: 'Unit',      accessor: (m: any) => <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{m.team_name}</span> },
                        { header: 'Duration',  accessor: (m: any) => <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', color: 'var(--accent-blue-light)' }}>{m.duration_minutes ? `${m.duration_minutes}m` : 'In Progress'}</span> },
                        { header: 'Status',    accessor: (m: any) => <StatusBadge status={m.assignment_status} /> },
                        { header: 'Timestamp', accessor: (m: any) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>{new Date(m.assigned_at).toLocaleString()}</span> },
                    ]}
                    data={completed}
                />
            </div>
        </div>
    )
}
