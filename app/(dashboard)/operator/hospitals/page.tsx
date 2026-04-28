'use client'
import React, { useEffect, useState } from 'react'

function CapacityBar({ used, total }: { used: number; total: number }) {
    const pct = total > 0 ? Math.round((used / total) * 100) : 0
    const color = pct >= 90 ? 'var(--color-rose)' : pct >= 70 ? 'var(--color-amber)' : 'var(--color-emerald)'
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{used} / {total} beds</span>
                <span style={{ fontWeight: 700, color }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--r-full)', transition: 'width 0.6s ease', boxShadow: `0 0 8px ${color}55` }} />
            </div>
        </div>
    )
}

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/hospitals').then(r => r.json()).then(d => {
            if (d.ok) setHospitals(d.data)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const totalBeds = hospitals.reduce((a, h) => a + (h.total_beds ?? 0), 0)
    const totalOccupied = hospitals.reduce((a, h) => a + (h.current_patients ?? 0), 0)
    const critical = hospitals.filter(h => h.capacity_status === 'CRITICAL').length

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Hospital Capacity</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Real-time bed availability across all registered medical facilities.</p>
                </div>
            </div>

            {/* KPI strip */}
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Total Facilities', value: hospitals.length, color: 'var(--color-blue)' },
                    { label: 'Total Beds', value: totalBeds, color: 'var(--color-cyan)' },
                    { label: 'Critical Load (≥90%)', value: critical, color: critical > 0 ? 'var(--color-rose)' : 'var(--color-emerald)' },
                ].map(k => (
                    <div key={k.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                    {hospitals.map((h: any) => {
                        const pct = h.total_beds > 0 ? Math.round((h.current_patients / h.total_beds) * 100) : 0
                        const statusColor = h.capacity_status === 'CRITICAL' ? 'var(--color-rose)' : h.capacity_status === 'LIMITED' ? 'var(--color-amber)' : 'var(--color-emerald)'
                        return (
                            <div key={h.hospital_id} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: `1px solid var(--border-subtle)`, borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column', gap: '0.875rem', borderLeft: `3px solid ${statusColor}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{h.hospital_name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.location}{h.specialty ? ` · ${h.specialty}` : ''}</p>
                                    </div>
                                    <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--r-full)', background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
                                        {h.capacity_status}
                                    </span>
                                </div>

                                <CapacityBar used={h.current_patients ?? 0} total={h.total_beds ?? 0} />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { label: 'Total', value: h.total_beds ?? 0 },
                                        { label: 'Admitted', value: h.current_patients ?? 0 },
                                        { label: 'Available', value: h.beds_available ?? 0 },
                                    ].map(b => (
                                        <div key={b.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: b.label === 'Available' ? 'var(--color-emerald)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{b.value}</p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{b.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* System total bar */}
            {!loading && hospitals.length > 0 && (
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System-Wide Bed Occupancy</p>
                    <CapacityBar used={totalOccupied} total={totalBeds} />
                </div>
            )}
        </div>
    )
}
