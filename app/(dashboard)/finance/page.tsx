'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import StatCard from '@/components/ui/StatCard'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-lg)' }}>
            {label && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.stroke }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {p.name}: <span style={{ fontVariantNumeric: 'tabular-nums' }}>${Number(p.value).toLocaleString()}</span>
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function FinanceDashboard() {
    const [summary,   setSummary]   = useState<any[]>([])
    const [donations, setDonations] = useState<any[]>([])
    const [expenses,  setExpenses]  = useState<any[]>([])
    const [loading,   setLoading]   = useState(true)
    const [activeTab, setActiveTab] = useState<'donations' | 'expenses'>('donations')

    useEffect(() => {
        async function fetchData() {
            try {
                const [sRes, dRes, eRes] = await Promise.all([
                    fetch('/api/reports/financial-summary').then(r => r.json()),
                    fetch('/api/finance/donations').then(r => r.json()),
                    fetch('/api/finance/expenses').then(r => r.json()),
                ])
                if (sRes.ok) setSummary(sRes.data)
                if (dRes.ok) setDonations(dRes.data)
                if (eRes.ok) setExpenses(eRes.data)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Decrypting Financial Ledgers</p>
        </div>
    )

    const totalDonations = donations.reduce((a, d) => a + (d.amount ?? 0), 0)
    const totalExpenses  = expenses.reduce((a, e) => a + (e.amount ?? 0), 0)
    const netBalance     = totalDonations - totalExpenses
    const utilizationPct = totalDonations > 0 ? ((totalExpenses / totalDonations) * 100).toFixed(1) : '0'

    const tableData = activeTab === 'donations'
        ? donations.map(d => ({ ...d, _type: 'donation' }))
        : expenses.map(e => ({ ...e, _type: 'expense' }))

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <h1 className="page-title">Financial Audit & Treasury</h1>
                    <p className="page-subtitle">Tracking disaster funding · Expenditures · Budget allocation compliance</p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                        Export Audit
                    </button>
                    <button className="btn btn-success btn-sm">Record Donation</button>
                    <button className="btn btn-danger btn-sm">Log Expense</button>
                </div>
            </div>

            {/* ── KPI Stats ────────────────────────────────────── */}
            <div className="grid-4">
                <StatCard
                    title="Total Funding"
                    value={`$${(totalDonations / 1000).toFixed(1)}k`}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    trend={{ value: 8, label: 'vs last month', positive: true }}
                    description="Total donations received"
                />
                <StatCard
                    title="Total Expenditure"
                    value={`$${(totalExpenses / 1000).toFixed(1)}k`}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>}
                    description="Operational and field costs"
                />
                <StatCard
                    title="Reserve Balance"
                    value={`$${Math.abs(netBalance / 1000).toFixed(1)}k`}
                    iconColor={netBalance >= 0 ? 'blue' : 'amber'}
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>}
                    description={`${utilizationPct}% budget utilized`}
                />
                <StatCard
                    title="Active Donors"
                    value={donations.length}
                    iconColor="violet"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
                    description="Donation entries on record"
                />
            </div>

            {/* ── Charts ───────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

                {/* Grouped bar: funding vs spending per event */}
                <div className="chart-container" style={{ height: 360, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title">
                        <span>Event Budget vs Expenditure</span>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--emerald)' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Funding</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--rose)' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Spending</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, marginTop: '0.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary} barSize={20} barGap={4} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="disaster_event" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" height={45} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                                <Bar dataKey="total_donations" name="Funding"  fill="var(--emerald)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                <Bar dataKey="total_expenses"  name="Spending" fill="var(--rose)"    radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Net liquidity table */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 className="chart-title">
                        <span>Net Liquidity by Event</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, overflowY: 'auto' }}>
                        {summary.map((s: any, i: number) => {
                            const isPos = (s.net_balance ?? 0) >= 0
                            return (
                                <div key={i} className="kpi-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.375rem' }}>
                                    <div className="flex-between w-full">
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.disaster_event}</span>
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: isPos ? 'var(--emerald)' : 'var(--rose)', fontVariantNumeric: 'tabular-nums' }}>
                                            {isPos ? '+' : '-'}${Math.abs(s.net_balance ?? 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex-between w-full">
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            In: <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>${(s.total_donations ?? 0).toLocaleString()}</span>
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            Out: <span style={{ color: 'var(--rose)', fontWeight: 600 }}>${(s.total_expenses ?? 0).toLocaleString()}</span>
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        {summary.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No financial data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Transactions table ────────────────────────────── */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Transaction Ledger</h3>
                    <div className="tabs" style={{ margin: 0, maxWidth: 280 }}>
                        <button className={`tab ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>Donations ({donations.length})</button>
                        <button className={`tab ${activeTab === 'expenses'  ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses ({expenses.length})</button>
                    </div>
                </div>
                <DataTable
                    columns={[
                        { header: activeTab === 'donations' ? 'Donor' : 'Category', accessor: (i: any) => <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{i.donor_name || i.category || '—'}</span> },
                        { header: 'Event',    accessor: (i: any) => <span className="chip">{i.disaster_event || '—'}</span> },
                        { header: 'Amount',   accessor: (i: any) => <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: activeTab === 'donations' ? 'var(--emerald)' : 'var(--rose)' }}>${(i.amount ?? 0).toLocaleString()}</span> },
                        { header: 'Date',     accessor: (i: any) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>{new Date(i.donated_at || i.incurred_at || Date.now()).toLocaleDateString()}</span> },
                        { header: 'Status',   accessor: () => <StatusBadge status="Approved" /> },
                    ]}
                    data={tableData}
                />
            </div>
        </div>
    )
}
