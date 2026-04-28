'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

const ROLE_COLOR: Record<string, string> = {
    Administrator: 'var(--color-violet)',
    'Emergency Operator': 'var(--color-blue)',
    'Field Officer': 'var(--color-cyan)',
    'Warehouse Manager': 'var(--color-amber)',
    'Finance Officer': 'var(--color-emerald)',
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('')

    useEffect(() => {
        fetch('/api/admin/users').then(r => r.json()).then(d => {
            if (d.ok) setUsers(d.data)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const roles = [...new Set(users.map((u: any) => u.role_name).filter(Boolean))]

    const filtered = users.filter(u => {
        const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
        const matchRole = !filterRole || u.role_name === filterRole
        return matchSearch && matchRole
    })

    const activeCount = users.filter(u => u.is_active).length

    function getInitials(name: string) {
        if (!name) return '?'
        return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    }

    const columns = [
        {
            key: 'user_id', header: '#', render: (v: any) => (
                <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>#{v}</span>
            )
        },
        {
            key: 'name', header: 'User', render: (v: string, row: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${ROLE_COLOR[row.role_name] ?? 'var(--color-blue)'}55, ${ROLE_COLOR[row.role_name] ?? 'var(--color-blue)'}22)`,
                        border: `1.5px solid ${ROLE_COLOR[row.role_name] ?? 'var(--color-blue)'}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 800, color: ROLE_COLOR[row.role_name] ?? 'var(--color-blue)'
                    }}>
                        {getInitials(v)}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.2 }}>{v}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'role_name', header: 'Role', render: (v: string) => (
                <span style={{ padding: '0.2rem 0.7rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--r-full)', background: `${ROLE_COLOR[v] ?? 'var(--color-blue)'}18`, border: `1px solid ${ROLE_COLOR[v] ?? 'var(--color-blue)'}40`, color: ROLE_COLOR[v] ?? 'var(--color-blue)' }}>
                    {v}
                </span>
            )
        },
        {
            key: 'is_active', header: 'Status', render: (v: any) => (
                <StatusBadge status={v ? 'Active' : 'Inactive'} />
            )
        },
        {
            key: 'created_at', header: 'Joined', render: (v: string) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleDateString() : '—'}</span>
            )
        },
        {
            key: 'phone', header: 'Phone', render: (v: string) => (
                <span style={{ color: v ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.8125rem' }}>{v ?? '—'}</span>
            )
        },
    ]

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>User Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>All registered system accounts across every operational role.</p>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Total Users', value: users.length, color: 'var(--color-blue)' },
                    { label: 'Active', value: activeCount, color: 'var(--color-emerald)' },
                    { label: 'Inactive', value: users.length - activeCount, color: 'var(--color-rose)' },
                    { label: 'Roles', value: roles.length, color: 'var(--color-violet)' },
                ].map(k => (
                    <div key={k.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    style={{ flex: 1, maxWidth: 360, padding: '0.5rem 0.9rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
                <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-secondary)', fontSize: '0.875rem', outline: 'none' }}
                >
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : (
                <DataTable columns={columns} data={filtered} pageSize={20} />
            )}

            {/* Role distribution */}
            {!loading && roles.length > 0 && (
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Role Distribution</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {roles.map(role => {
                            const count = users.filter(u => u.role_name === role).length
                            const pct = users.length > 0 ? (count / users.length) * 100 : 0
                            const color = ROLE_COLOR[role] ?? 'var(--color-blue)'
                            return (
                                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                    <span style={{ width: 140, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{role}</span>
                                    <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--r-full)', transition: 'width 0.6s', boxShadow: `0 0 8px ${color}55` }} />
                                    </div>
                                    <span style={{ width: 24, fontSize: '0.8125rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
