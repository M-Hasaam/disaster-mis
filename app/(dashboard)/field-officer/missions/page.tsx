'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

const SEVERITY_COLOR: Record<string, string> = {
    Critical: 'var(--color-rose)',
    High: 'var(--color-amber)',
    Medium: 'var(--color-blue)',
    Low: 'var(--color-emerald)',
}

function DurationChip({ minutes }: { minutes: number }) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const label = h > 0 ? `${h}h ${m}m` : `${m}m`
    const color = minutes > 120 ? 'var(--color-rose)' : minutes > 60 ? 'var(--color-amber)' : 'var(--color-emerald)'
    return (
        <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--r-full)', background: `${color}18`, border: `1px solid ${color}40`, color, fontVariantNumeric: 'tabular-nums' }}>
            {label}
        </span>
    )
}

export default function FieldOfficerMissionsPage() {
    const [missions, setMissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    useEffect(() => {
        fetch('/api/reports/response-time').then(r => r.json()).then(d => {
            if (d.ok) setMissions(d.data)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const statuses = [...new Set(missions.map(m => m.mission_status).filter(Boolean))]

    const filtered = missions.filter(m => {
        const matchSearch = !search ||
            m.team_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.emergency_location?.toLowerCase().includes(search.toLowerCase()) ||
            m.disaster_type?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = !filterStatus || m.mission_status === filterStatus
        return matchSearch && matchStatus
    })

    const active = missions.filter(m => !['Completed', 'Cancelled'].includes(m.mission_status))
    const completed = missions.filter(m => m.mission_status === 'Completed')
    const avgDuration = completed.length
        ? Math.round(completed.reduce((a, m) => a + (m.mission_duration_minutes ?? 0), 0) / completed.length)
        : 0

    const columns = [
        {
            key: 'team_name', header: 'Team', render: (v: string, row: any) => (
                <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{v}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.team_type}</p>
                </div>
            )
        },
        {
            key: 'disaster_type', header: 'Mission Type', render: (v: string, row: any) => (
                <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{v}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.emergency_location}</p>
                </div>
            )
        },
        {
            key: 'severity', header: 'Severity', render: (v: string) => (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: SEVERITY_COLOR[v] ?? 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SEVERITY_COLOR[v] ?? 'var(--text-muted)', display: 'inline-block', boxShadow: `0 0 5px ${SEVERITY_COLOR[v] ?? 'transparent'}` }} />
                    {v}
                </span>
            )
        },
        { key: 'mission_status', header: 'Status', render: (v: string) => <StatusBadge status={v} /> },
        {
            key: 'assigned_at', header: 'Assigned', render: (v: string) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleString() : '—'}</span>
            )
        },
        {
            key: 'completed_at', header: 'Completed', render: (v: string) => (
                <span style={{ color: v ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleString() : '—'}</span>
            )
        },
        {
            key: 'mission_duration_minutes', header: 'Duration', render: (v: number) => (
                v != null ? <DurationChip minutes={v} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>
            )
        },
    ]

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Mission Log</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Complete history of all team assignments and field operations.</p>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Total Missions', value: missions.length, color: 'var(--color-blue)' },
                    { label: 'Active', value: active.length, color: active.length > 0 ? 'var(--color-amber)' : 'var(--color-emerald)' },
                    { label: 'Completed', value: completed.length, color: 'var(--color-emerald)' },
                    { label: 'Avg Duration', value: avgDuration > 0 ? `${avgDuration}m` : '—', color: 'var(--color-cyan)' },
                ].map(k => (
                    <div key={k.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Active missions cards */}
            {active.length > 0 && (
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                        Active Operations ({active.length})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
                        {active.map((m: any, i: number) => {
                            const statusColor = m.mission_status === 'OnSite' ? 'var(--color-rose)' : m.mission_status === 'EnRoute' ? 'var(--color-amber)' : 'var(--color-blue)'
                            return (
                                <div key={i} style={{ padding: '1rem 1.125rem', background: 'var(--bg-card)', border: `1px solid var(--border-subtle)`, borderRadius: 'var(--r-xl)', borderLeft: `3px solid ${statusColor}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{m.team_name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.team_type}</p>
                                        </div>
                                        <StatusBadge status={m.mission_status} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600 }}>{m.disaster_type}</span> — {m.emergency_location}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Started {m.assigned_at ? new Date(m.assigned_at).toLocaleTimeString() : '—'}
                                        </span>
                                        {m.mission_duration_minutes != null && <DurationChip minutes={m.mission_duration_minutes} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Filters + full table */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search team, location, or type…"
                    style={{ flex: 1, maxWidth: 380, padding: '0.5rem 0.9rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-secondary)', fontSize: '0.875rem', outline: 'none' }}
                >
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : (
                <DataTable columns={columns} data={filtered} pageSize={20} />
            )}
        </div>
    )
}
