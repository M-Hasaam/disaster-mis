'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-lg)' }}>
            {label && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.fill }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.value} units</span>
                </div>
            ))}
        </div>
    )
}

export default function WarehouseDashboard() {
    const [inventory, setInventory] = useState<any[]>([])
    const [alerts, setAlerts]       = useState<any[]>([])
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [iRes, aRes] = await Promise.all([
                    fetch('/api/inventory').then(r => r.json()),
                    fetch('/api/inventory/threshold-alerts').then(r => r.json()),
                ])
                if (iRes.ok) setInventory(iRes.data)
                if (aRes.ok) setAlerts(aRes.data)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Scanning Inventory Nodes</p>
        </div>
    )

    const totalStock  = inventory.reduce((a, i) => a + (i.current_stock ?? 0), 0)
    const lowCount    = inventory.filter(i => i.stock_status === 'Low Stock').length
    const outCount    = inventory.filter(i => i.stock_status === 'Out of Stock').length
    const healthLabel = outCount > 0 ? `${outCount} Critical` : lowCount > 0 ? `${lowCount} Low` : 'Optimal'
    const healthColor = outCount > 0 ? 'rose' : lowCount > 0 ? 'amber' : 'emerald'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <h1 className="page-title">Inventory Control Panel</h1>
                    <p className="page-subtitle">Warehouse management · Resource threshold monitoring · Stock reporting</p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                        Stock Report
                    </button>
                    <button className="btn btn-primary">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                        Restock Entry
                    </button>
                </div>
            </div>

            {/* ── Stats ────────────────────────────────────────── */}
            <div className="grid-3">
                <StatCard
                    title="Total Stock Units"
                    value={totalStock.toLocaleString()}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>}
                    description={`Across ${inventory.length} resource types`}
                />
                <StatCard
                    title="Critical Alerts"
                    value={alerts.length}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>}
                    description="Items below minimum threshold"
                />
                <StatCard
                    title="Warehouse Health"
                    value={healthLabel}
                    iconColor={healthColor}
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    description="Overall inventory status"
                />
            </div>

            {/* ── Charts + Alerts ───────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

                {/* Stock bar chart */}
                <div className="chart-container" style={{ height: 340, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title">
                        <span>Stock Levels by Resource (Top 8)</span>
                        <span className="badge badge-slate">Min threshold shown</span>
                    </div>
                    <div style={{ flex: 1, marginTop: '0.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventory.slice(0, 8)} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="resource_name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={40} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                                <Bar dataKey="current_stock" name="Stock" radius={[4, 4, 0, 0]}>
                                    {inventory.slice(0, 8).map((entry: any, i: number) => (
                                        <Cell key={i} fill={entry.current_stock < entry.min_threshold ? 'var(--rose)' : 'var(--accent-blue)'} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alerts panel */}
                <div className="card" style={{ borderTop: '2px solid var(--rose)', maxHeight: 340, overflow: 'hidden' }}>
                    <h3 className="section-title" style={{ color: '#fc7187' }}>
                        <svg style={{ width: 14, height: 14, color: 'var(--rose)', flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/></svg>
                        Low Stock Alerts
                    </h3>
                    <div style={{ overflowY: 'auto', maxHeight: 250, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {alerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                <svg style={{ width: 28, height: 28, marginBottom: '0.5rem', opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>All resources OK</p>
                            </div>
                        ) : alerts.map((a, i) => {
                            const pct = Math.round((a.current_stock / a.min_threshold) * 100)
                            return (
                                <div key={i} style={{ padding: '0.75rem 0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.resource_name}</p>
                                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{a.warehouse_name}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--rose)', lineHeight: 1 }}>{a.current_stock}</p>
                                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 1 }}>/ {a.min_threshold} min</p>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct < 30 ? 'var(--rose)' : 'var(--amber)' }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Inventory Ledger ─────────────────────────────── */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Global Inventory Ledger</h3>
                    <span className="badge badge-slate">{inventory.length} items</span>
                </div>
                <DataTable
                    searchPlaceholder="Search resources or warehouses..."
                    columns={[
                        { header: 'Resource',    accessor: (i: any) => <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{i.resource_name}</span> },
                        { header: 'Warehouse',   accessor: (i: any) => <span className="chip">{i.warehouse_name}</span> },
                        { header: 'Stock Level', accessor: (i: any) => {
                            const pct = Math.min(100, (i.current_stock / Math.max(1, i.min_threshold)) * 50)
                            return (
                                <div style={{ width: 100 }}>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: i.current_stock < i.min_threshold ? 'var(--rose)' : 'var(--accent-blue)' }} />
                                    </div>
                                </div>
                            )
                        }},
                        { header: 'Quantity',    accessor: (i: any) => <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{i.current_stock?.toLocaleString()}</span> },
                        { header: 'Min Req',     accessor: (i: any) => <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-muted)' }}>{i.min_threshold}</span> },
                        { header: 'Status',      accessor: (i: any) => <StatusBadge status={i.stock_status} /> },
                        { header: 'Actions',     accessor: () => <button className="btn btn-secondary btn-sm">Update</button> },
                    ]}
                    data={inventory}
                />
            </div>
        </div>
    )
}
