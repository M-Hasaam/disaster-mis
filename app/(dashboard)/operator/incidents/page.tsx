'use client'
import React, { useEffect, useState, useCallback } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import DataTable from '@/components/ui/DataTable'

const SEVERITY_COLOR: Record<string, string> = {
    Critical: 'var(--color-rose)',
    High: 'var(--color-amber)',
    Medium: 'var(--color-blue)',
    Low: 'var(--color-emerald)',
}

const SEV_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

export default function OperatorIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([])
    const [teams, setTeams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<any | null>(null)
    const [assigning, setAssigning] = useState(false)
    const [assignTeam, setAssignTeam] = useState('')
    const [assignMsg, setAssignMsg] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [iRes, tRes] = await Promise.all([
                fetch('/api/incidents').then(r => r.json()),
                fetch('/api/teams').then(r => r.json()),
            ])
            if (iRes.ok) setIncidents(iRes.data)
            if (tRes.ok) setTeams(tRes.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const filtered = incidents
        .filter(i => filter === 'all' || i.severity === filter)
        .filter(i => !search || i.disaster_type?.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9))

    async function handleAssign() {
        if (!assignTeam || !selected) return
        setAssigning(true)
        setAssignMsg('')
        try {
            const res = await fetch('/api/teams/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_id: selected.report_id, team_id: Number(assignTeam) }),
            }).then(r => r.json())
            if (res.ok) {
                setAssignMsg('Team assigned successfully.')
                await fetchData()
                setTimeout(() => { setSelected(null); setAssignMsg('') }, 1200)
            } else {
                setAssignMsg(res.error || 'Assignment failed.')
            }
        } finally {
            setAssigning(false)
        }
    }

    const availableTeams = teams.filter(t => t.status === 'Available')

    const columns = [
        { key: 'report_id', header: '#', render: (v: any) => <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>#{v}</span> },
        {
            key: 'severity', header: 'Severity', render: (v: string) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: SEVERITY_COLOR[v] ?? 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SEVERITY_COLOR[v] ?? 'var(--text-muted)', display: 'inline-block', boxShadow: `0 0 6px ${SEVERITY_COLOR[v] ?? 'transparent'}` }} />
                    {v}
                </span>
            )
        },
        { key: 'disaster_type', header: 'Type' },
        { key: 'location', header: 'Location' },
        { key: 'citizen_name', header: 'Reported By' },
        { key: 'report_status', header: 'Status', render: (v: string) => <StatusBadge status={v} /> },
        {
            key: 'report_time', header: 'Time', render: (v: string) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {v ? new Date(v).toLocaleString() : '—'}
                </span>
            )
        },
        {
            key: '_action', header: '', render: (_: any, row: any) => (
                row.status !== 'Resolved' && row.status !== 'Deleted' ? (
                    <button onClick={() => { setSelected(row); setAssignTeam('') }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-blue)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}>
                        Assign
                    </button>
                ) : null
            )
        },
    ]

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Incident Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>All active emergency reports — assign rescue teams and track status.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{
                            padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--r-full)', cursor: 'pointer', textTransform: s === 'all' ? 'uppercase' : undefined, letterSpacing: '0.04em', transition: 'all 0.15s',
                            background: filter === s ? (s === 'all' ? 'var(--color-blue)' : (SEVERITY_COLOR[s] ?? 'var(--color-blue)')) : 'var(--bg-elevated)',
                            color: filter === s ? '#fff' : 'var(--text-secondary)',
                            border: `1px solid ${filter === s ? 'transparent' : 'var(--border-subtle)'}`,
                        }}>
                            {s === 'all' ? 'ALL' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by type or location…"
                    style={{ flex: 1, maxWidth: 380, padding: '0.5rem 0.9rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{filtered.length} incident{filtered.length !== 1 ? 's' : ''}</span>
                <button onClick={fetchData} style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Refresh
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : (
                <DataTable columns={columns} data={filtered} pageSize={15} />
            )}

            {/* Assign Modal */}
            {selected && (
                <Modal isOpen={!!selected} title={`Assign Team — Incident #${selected.report_id}`} onClose={() => { setSelected(null); setAssignMsg('') }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Type</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.disaster_type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Location</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.location}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Severity</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: SEVERITY_COLOR[selected.severity] }}>{selected.severity}</span>
                            </div>
                        </div>

                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Available Rescue Teams
                        </label>
                        {availableTeams.length === 0 ? (
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-amber)', fontWeight: 600 }}>No teams currently available.</p>
                        ) : (
                            <select value={assignTeam} onChange={e => setAssignTeam(e.target.value)} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                <option value="">Select a team…</option>
                                {availableTeams.map((t: any) => (
                                    <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.specialty})</option>
                                ))}
                            </select>
                        )}

                        {assignMsg && (
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: assignMsg.includes('success') ? 'var(--color-emerald)' : 'var(--color-rose)' }}>{assignMsg}</p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelected(null)} style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleAssign} disabled={!assignTeam || assigning} style={{ padding: '0.5rem 1.5rem', background: !assignTeam ? 'var(--border-subtle)' : 'var(--color-blue)', border: 'none', borderRadius: 'var(--r-md)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: !assignTeam ? 'not-allowed' : 'pointer', opacity: assigning ? 0.7 : 1 }}>
                                {assigning ? 'Assigning…' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
