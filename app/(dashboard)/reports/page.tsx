'use client'
import React, { useEffect, useState, useRef } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import StatCard from '@/components/ui/StatCard'

const COLORS = ['#14b8a6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-lg)' }}>
            {label && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.stroke }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name || 'Value'}: {p.value}</span>
                </div>
            ))}
        </div>
    )
}

const kpis = [
    { label: 'SLA Compliance',      value: '92%',  color: 'var(--emerald)',  desc: 'Response within target window' },
    { label: 'Resource Efficiency', value: '4.8',  color: 'var(--accent)',   desc: 'Score out of 5.0' },
    { label: 'Avg Log Time',        value: '12s',  color: 'var(--amber)',    desc: 'Mean report ingestion time' },
    { label: 'Audit Traceability',  value: '100%', color: 'var(--violet)',   desc: 'Full audit trail coverage' },
]

export default function ReportsPage() {
    const [incidentStats, setIncidentStats] = useState<any[]>([])
    const [financials,    setFinancials]    = useState<any[]>([])
    const [adminSummary,  setAdminSummary]  = useState<any>(null)
    const [auditLogs,     setAuditLogs]     = useState<any[]>([])
    const [loading,       setLoading]       = useState(true)
    const [generating,    setGenerating]    = useState(false)
    const [showReport,    setShowReport]    = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const [iRes, fRes] = await Promise.all([
                    fetch('/api/admin/stats').then(r => r.json()),
                    fetch('/api/reports/financial-summary').then(r => r.json()),
                ])
                if (iRes.ok) {
                    setIncidentStats(iRes.data?.disasterDistribution ?? [])
                    setAdminSummary(iRes.data?.summary ?? null)
                }
                if (fRes.ok) setFinancials(fRes.data ?? [])
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    async function handleGenerateReport() {
        setGenerating(true)
        try {
            const aRes = await fetch('/api/reports/audit-trail?limit=20').then(r => r.json())
            if (aRes.ok) setAuditLogs(aRes.data ?? [])
        } catch (e) { console.error(e) }
        finally {
            setGenerating(false)
            setShowReport(true)
        }
    }

    function handlePrint() {
        if (!reportRef.current) return
        const html = reportRef.current.innerHTML
        const win = window.open('', '_blank', 'width=900,height=700')
        if (!win) return
        win.document.write(`<!DOCTYPE html><html><head><title>Disaster Response MIS — Management Report</title><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:2rem;font-size:13px}h1{font-size:1.5rem;font-weight:800;margin-bottom:.25rem}h2{font-size:1rem;font-weight:700;margin:1.5rem 0 .75rem;border-bottom:2px solid #e2e8f0;padding-bottom:.375rem}table{width:100%;border-collapse:collapse;font-size:.8rem;margin-bottom:1.5rem}th{background:#f8fafc;padding:.5rem .75rem;text-align:left;font-weight:700;color:#475569;border-bottom:2px solid #e2e8f0;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em}td{padding:.5rem .75rem;border-bottom:1px solid #f1f5f9;color:#1e293b}.footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:.7rem;color:#94a3b8;display:flex;justify-content:space-between}@media print{body{padding:.5rem}}</style></head><body>${html}</body></html>`)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 400)
    }

    const totalDonations = financials.reduce((a, f) => a + Number(f.total_donations ?? 0), 0)
    const totalExpenses  = financials.reduce((a, f) => a + Number(f.total_expenses  ?? 0), 0)
    const totalIncidents = incidentStats.reduce((a, i) => a + Number(i.count ?? 0), 0)
    const generatedAt    = new Date().toLocaleString()

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Loading Report Data</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <h1 className="page-title gradient-title">Management Reports</h1>
                    <p className="page-subtitle">Historical analysis · Cross-departmental analytics · Compliance reporting</p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={handlePrint} disabled={!showReport} style={{ opacity: !showReport ? 0.4 : 1 }}>
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                        Export PDF
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerateReport} disabled={generating} style={{ opacity: generating ? 0.7 : 1, minWidth: 140 }}>
                        {generating ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="loading-ring" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                Generating…
                            </span>
                        ) : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* ── KPI strip ───────────────────────────────────── */}
            <div className="grid-4">
                {kpis.map(k => (
                    <div key={k.label} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 900, color: k.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{k.value}</p>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{k.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── Charts ───────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="chart-container" style={{ height: 360, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title"><span>Incident Volume by Category</span></div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incidentStats} barSize={30} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="disaster_type" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,184,166,0.06)' }} />
                                <Bar dataKey="count" name="Incidents" radius={[5, 5, 0, 0]}>
                                    {incidentStats.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container" style={{ height: 360, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title"><span>Financial Flow per Disaster Event</span></div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financials} barSize={22} barGap={3} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="disaster_event" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} angle={-15} textAnchor="end" height={45} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,184,166,0.05)' }} />
                                <Bar dataKey="total_donations" name="Funding"  fill="var(--emerald)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                <Bar dataKey="total_expenses"  name="Spending" fill="var(--rose)"    radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Drilldown ────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
                <div className="chart-container" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
                    <div className="chart-title"><span>Category Distribution</span></div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={incidentStats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="count" strokeWidth={0}>
                                    {incidentStats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="section-title">Analytical Drill-down</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {[
                            { label: 'Total Incidents Logged',  value: totalIncidents, color: 'var(--rose)' },
                            { label: 'Total Donations Received', value: `$${totalDonations.toLocaleString(undefined,{minimumFractionDigits:2})}`, color: 'var(--emerald)' },
                            { label: 'Total Expenses Incurred',  value: `$${totalExpenses.toLocaleString(undefined,{minimumFractionDigits:2})}`,  color: 'var(--amber)' },
                            { label: 'Net Financial Balance',    value: `$${(totalDonations-totalExpenses).toLocaleString(undefined,{minimumFractionDigits:2})}`, color: totalDonations >= totalExpenses ? 'var(--emerald)' : 'var(--rose)' },
                            { label: 'Active Incidents',         value: adminSummary?.active_incidents ?? '—', color: 'var(--accent-light)' },
                            { label: 'Pending Approvals',        value: adminSummary?.pending_approvals ?? '—', color: 'var(--violet)' },
                        ].map(row => (
                            <div key={row.label} className="kpi-row">
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Report Modal ─────────────────────────────────── */}
            {showReport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
                    <div style={{ background: '#fff', color: '#1a1a2e', borderRadius: 12, width: '100%', maxWidth: 860, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1e293b' }}>Management Report Preview</span>
                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                                <button onClick={handlePrint} style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem', fontWeight: 700, background: '#0d9488', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' }}>Print / Save PDF</button>
                                <button onClick={() => setShowReport(false)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8125rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 7, cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                        <div ref={reportRef} style={{ padding: '2rem 2.5rem', fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1a1a2e', fontSize: 13 }}>
                            <div style={{ borderBottom: '3px solid #0d9488', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h1 style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Disaster Response MIS</h1>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d9488' }}>Management Information Report</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Generated</p>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>{generatedAt}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>CONFIDENTIAL — Internal Use Only</p>
                                    </div>
                                </div>
                            </div>
                            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Summary</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
                                {[
                                    { label: 'Active Incidents',  value: adminSummary?.active_incidents  ?? 0, color: '#dc2626' },
                                    { label: 'Available Teams',   value: adminSummary?.available_teams   ?? 0, color: '#059669' },
                                    { label: 'Pending Approvals', value: adminSummary?.pending_approvals ?? 0, color: '#d97706' },
                                    { label: 'Total Incidents',   value: totalIncidents,                       color: '#0d9488' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                                <span>Disaster Response Management Information System</span>
                                <span>Generated: {generatedAt} — CONFIDENTIAL</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
