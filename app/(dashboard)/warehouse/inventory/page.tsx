'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

export default function WarehouseInventoryPage() {
    const [inventory, setInventory] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterLow, setFilterLow] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/inventory').then(r => r.json()),
            fetch('/api/inventory/threshold-alerts').then(r => r.json()),
        ]).then(([inv, al]) => {
            if (inv.ok) setInventory(inv.data)
            if (al.ok) setAlerts(al.data)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const filtered = inventory.filter(i => {
        const matchSearch = !search || i.resource_name?.toLowerCase().includes(search.toLowerCase()) || i.warehouse_name?.toLowerCase().includes(search.toLowerCase())
        const matchLow = !filterLow || (i.quantity <= i.min_threshold)
        return matchSearch && matchLow
    })

    const totalItems = inventory.reduce((a, i) => a + (i.quantity ?? 0), 0)
    const lowStockCount = inventory.filter(i => i.quantity <= i.min_threshold).length
    const warehouseCount = [...new Set(inventory.map(i => i.warehouse_name))].length

    const columns = [
        { key: 'warehouse_name', header: 'Warehouse' },
        { key: 'resource_name', header: 'Resource' },
        {
            key: 'category', header: 'Category', render: (v: string) => (
                <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-full)', color: 'var(--text-secondary)' }}>{v}</span>
            )
        },
        {
            key: 'quantity', header: 'Stock', render: (v: number, row: any) => {
                const low = v <= (row.min_threshold ?? 0)
                return (
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: low ? 'var(--color-rose)' : v === 0 ? 'var(--color-amber)' : 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {v ?? 0}
                    </span>
                )
            }
        },
        {
            key: 'min_threshold', header: 'Min Threshold', render: (v: number) => (
                <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{v ?? '—'}</span>
            )
        },
        {
            key: 'unit', header: 'Unit', render: (v: string) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ?? '—'}</span>
            )
        },
        {
            key: 'stock_status', header: 'Status', render: (v: string) => {
                const label = v === 'LOW' ? 'Low Stock' : v === 'MEDIUM' ? 'Medium' : 'In Stock'
                return <StatusBadge status={label} />
            }
        },
    ]

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Inventory Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Track stock levels, thresholds, and reorder alerts across all warehouses.</p>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Warehouses', value: warehouseCount, color: 'var(--color-blue)' },
                    { label: 'Total Units in Stock', value: totalItems.toLocaleString(), color: 'var(--color-emerald)' },
                    { label: 'Low Stock Lines', value: lowStockCount, color: lowStockCount > 0 ? 'var(--color-rose)' : 'var(--color-emerald)' },
                ].map(k => (
                    <div key={k.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Alerts banner */}
            {alerts.length > 0 && (
                <div style={{ padding: '1rem 1.25rem', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-rose)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {alerts.length} Active Stock Alert{alerts.length !== 1 ? 's' : ''}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {alerts.slice(0, 8).map((a: any, i: number) => (
                            <span key={i} style={{ padding: '0.2rem 0.7rem', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-rose)' }}>
                                {a.resource_name ?? a.warehouse_name ?? `Alert #${a.alert_id}`}
                            </span>
                        ))}
                        {alerts.length > 8 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{alerts.length - 8} more</span>}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search resource or warehouse…"
                    style={{ flex: 1, maxWidth: 360, padding: '0.5rem 0.9rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
                    <input type="checkbox" checked={filterLow} onChange={e => setFilterLow(e.target.checked)} style={{ accentColor: 'var(--color-rose)', width: 14, height: 14 }} />
                    Low stock only
                </label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{filtered.length} line{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : (
                <DataTable columns={columns} data={filtered} pageSize={20} />
            )}
        </div>
    )
}
