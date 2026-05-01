'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'

const REFRESH_MS = 10_000

export default function OperatorDashboard() {
    const [incidents, setIncidents]           = useState<any[]>([])
    const [hospitals, setHospitals]           = useState<any[]>([])
    const [loading, setLoading]               = useState(true)
    const [isReportModalOpen, setReportModal] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const [iRes, hRes] = await Promise.all([
                    fetch('/api/incidents').then(r => r.json()),
                    fetch('/api/hospitals/beds').then(r => r.json()),
                ])
                if (iRes.ok) setIncidents(iRes.data)
                if (hRes.ok) setHospitals(hRes.data)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
        const id = setInterval(fetchData, REFRESH_MS)
        return () => clearInterval(id)
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
            <div className="loading-ring" />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Synchronizing Emergency Feed</p>
        </div>
    )

    const pending    = incidents.filter(i => i.status === 'Pending').length
    const dispatched = incidents.filter(i => i.status === 'Dispatched').length
    const totalBeds  = hospitals.reduce((acc, h) => acc + (h.available_beds ?? 0), 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Page header ─────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                        <div className="live-dot pulse-dot" />
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.1em', textShadow: '0 0 12px rgba(16,185,129,0.6)' }}>
                            Live Feed — updates every 10s
                        </span>
                    </div>
                    <h1 className="gradient-title-danger" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                        Emergency Response Hub
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(139,158,197,0.65)', marginTop: '0.4rem' }}>
                        Monitoring active reports · Hospital coordination · Team dispatch
                    </p>
                </div>
                <div className="command-header-actions">
                    <button className="btn btn-secondary btn-sm">
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                        Export Log
                    </button>
                    <button onClick={() => setReportModal(true)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', boxShadow: '0 0 20px rgba(244,63,94,0.4)', border: 'none' }}>
                        <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                        Log Emergency
                    </button>
                </div>
            </div>

            {/* ── Stats ────────────────────────────────────────── */}
            <div className="grid-3">
                <StatCard
                    title="Pending Queue"
                    value={pending}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    description="Reports awaiting team assignment"
                />
                <StatCard
                    title="Dispatched Units"
                    value={dispatched}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>}
                    description="Teams currently en-route"
                />
                <StatCard
                    title="Available Beds"
                    value={totalBeds}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/></svg>}
                    description="Across all registered hospitals"
                />
            </div>

            {/* ── Live Incident Feed ────────────────────────────── */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Live Incident Feed</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="live-dot pulse-dot" />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-refresh active</span>
                    </div>
                </div>
                <DataTable
                    searchPlaceholder="Filter by location, type, severity..."
                    columns={[
                        { header: 'ID',       accessor: (i: any) => <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{i.report_id}</span> },
                        { header: 'Type',     accessor: (i: any) => <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{i.disaster_type}</span> },
                        { header: 'Severity', accessor: (i: any) => <StatusBadge status={i.severity_level} /> },
                        { header: 'Location', accessor: (i: any) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{i.location}</span> },
                        { header: 'Reporter', accessor: (i: any) => (
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{i.citizen_name}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>{i.citizen_phone}</p>
                            </div>
                        )},
                        { header: 'Logged',   accessor: (i: any) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>{new Date(i.report_time).toLocaleTimeString()}</span> },
                        { header: 'Status',   accessor: (i: any) => <StatusBadge status={i.status} /> },
                        { header: 'Action',   accessor: (i: any) => (
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                {i.status === 'Pending' && <button className="btn btn-primary btn-sm">Assign</button>}
                                <button className="btn btn-secondary btn-sm">Details</button>
                            </div>
                        )},
                    ]}
                    data={incidents}
                />
            </div>

            {/* ── Hospital capacity + protocols ─────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* Hospital beds */}
                <div className="card">
                    <h3 className="section-title">Hospital Bed Capacity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
                        {hospitals.length === 0 ? (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No hospital data available</p>
                        ) : hospitals.map((h, i) => {
                            const pct = Math.min(100, (h.available_beds / (h.total_beds || 100)) * 100)
                            const isLow = pct < 20, isMid = pct >= 20 && pct < 50
                            const statusRgb = isLow ? '244,63,94' : isMid ? '245,158,11' : '16,185,129'
                            const barColor  = isLow ? '#f43f5e' : isMid ? '#f59e0b' : '#10b981'
                            return (
                                <div key={i} style={{
                                    padding: '0.875rem 1rem',
                                    background: `linear-gradient(135deg, rgba(${statusRgb}, 0.07) 0%, var(--bg-secondary) 60%)`,
                                    borderRadius: 'var(--r-lg)',
                                    border: `1px solid rgba(${statusRgb}, 0.2)`,
                                    borderLeft: `3px solid rgba(${statusRgb}, 0.65)`,
                                }}>
                                    <div className="flex-between" style={{ marginBottom: '0.625rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{h.hospital_name}</p>
                                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{h.location}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: barColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 16px rgba(${statusRgb},0.4)` }}>{h.available_beds}</p>
                                            <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 2, letterSpacing: '0.08em' }}>beds free</p>
                                        </div>
                                    </div>
                                    <div className="progress-bar" style={{ height: '5px', background: `rgba(${statusRgb},0.1)` }}>
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px rgba(${statusRgb},0.5)` }} />
                                    </div>
                                    <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.6875rem', color: `rgba(${statusRgb},0.75)`, fontWeight: 600 }}>{Math.round(pct)}% available</span>
                                        <StatusBadge status={h.bed_status} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Field protocols */}
                <div className="card card-accent-blue">
                    <h3 className="section-title">Field Coordination Protocols</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                        {[
                            { num: '01', title: 'Verify',   body: 'Confirm report details with citizen before dispatching units.' },
                            { num: '02', title: 'Allocate', body: 'Choose teams based on proximity and disaster type specialty.' },
                            { num: '03', title: 'Triage',   body: 'Coordinate with nearest hospitals for critical case admissions.' },
                        ].map(p => (
                            <div key={p.num} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--accent-blue-subtle)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--accent-blue-light)' }}>{p.num}</span>
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{p.title}</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{p.body}</p>
                                </div>
                            </div>
                        ))}
                        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--r-lg)', padding: '0.875rem 1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <svg style={{ width: 14, height: 14, color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/></svg>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(251,191,36,0.9)', lineHeight: 1.55 }}>
                                    Ensure all financial approvals for resource dispatch are initiated immediately upon incident confirmation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Log Emergency Modal ───────────────────────────── */}
            <Modal isOpen={isReportModalOpen} onClose={() => setReportModal(false)} title="Log Emergency Report">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div className="form-group">
                            <label className="form-label">Disaster Type</label>
                            <select className="form-input">
                                <option>Flood</option>
                                <option>Earthquake</option>
                                <option>Urban Fire</option>
                                <option>Medical Emergency</option>
                                <option>Chemical Leak</option>
                                <option>Landslide</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Severity Level</label>
                            <select className="form-input" style={{ color: 'var(--rose)' }}>
                                <option>Critical</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Incident Location</label>
                        <input className="form-input" placeholder="Sector G-11, Street 4, Islamabad" />
                    </div>
                    <div className="divider" />
                    <p className="text-label" style={{ marginBottom: '0.875rem' }}>Reporter Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" placeholder="+92-333-XXXXXXX" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address (Optional)</label>
                        <input className="form-input" placeholder="Home address" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setReportModal(false)}>Cancel</button>
                        <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
                            <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                            Submit Report
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
