'use client'
import React, { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'

export default function PerformancePage() {
    const [benchmarks, setBenchmarks] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    async function runBenchmarks() {
        setLoading(true)
        try {
            const res = await fetch('/api/performance/compare').then(r => r.json())
            if (res.ok) setBenchmarks(res.data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const bestIndexed     = benchmarks.length ? Math.min(...benchmarks.map(b => b.indexed_ms))     : null
    const worstNonIndexed = benchmarks.length ? Math.max(...benchmarks.map(b => b.non_indexed_ms)) : null
    const gainPct         = (bestIndexed != null && worstNonIndexed != null && worstNonIndexed > 0)
        ? Math.round(((worstNonIndexed - bestIndexed) / worstNonIndexed) * 100)
        : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <h1 className="page-title">Database Performance Diagnostics</h1>
                    <p className="page-subtitle">Comparative analysis: Indexed vs Non-Indexed · Views vs Base Tables · Query latency benchmarks</p>
                </div>
                <button
                    onClick={runBenchmarks}
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                >
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span className="loading-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            Running Stress Test...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                            Execute Diagnostic Suite
                        </span>
                    )}
                </button>
            </div>

            {/* ── KPI stats ────────────────────────────────────── */}
            <div className="grid-3">
                <StatCard
                    title="Best Indexed Latency"
                    value={bestIndexed != null ? `${bestIndexed}ms` : '—'}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>}
                    description="Fastest indexed query response"
                />
                <StatCard
                    title="Worst Baseline Latency"
                    value={worstNonIndexed != null ? `${worstNonIndexed}ms` : '—'}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>}
                    description="Slowest non-indexed table scan"
                />
                <StatCard
                    title="Optimization Gain"
                    value={gainPct != null ? `${gainPct}%` : '—'}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>}
                    description="Performance improvement with indexing"
                />
            </div>

            {/* ── Benchmark results ────────────────────────────── */}
            {benchmarks.length === 0 ? (
                <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'var(--border)' }}>
                    <svg style={{ width: 48, height: 48, color: 'var(--text-disabled)', margin: '0 auto 1.25rem', display: 'block' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                    </svg>
                    <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No diagnostics run yet</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Click "Execute Diagnostic Suite" to run live performance benchmarks against the database.</p>
                    <button onClick={runBenchmarks} className="btn btn-primary">Run Benchmarks</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {benchmarks.map((b: any, i: number) => {
                        const maxMs  = Math.max(b.indexed_ms, b.non_indexed_ms)
                        const idxPct = (b.indexed_ms     / maxMs) * 100
                        const basePct= (b.non_indexed_ms / maxMs) * 100
                        const faster = b.indexed_ms < b.non_indexed_ms

                        return (
                            <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{b.query_name}</h3>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.description}</p>
                                    </div>
                                    <StatusBadge status={faster ? 'Optimized' : 'Warning'} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Indexed bar */}
                                        <div>
                                            <div className="flex-between" style={{ marginBottom: '0.375rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom Indexing / Views</span>
                                                <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{b.indexed_ms}ms</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill" style={{ width: `${idxPct}%`, background: 'var(--emerald)', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                        {/* Non-indexed bar */}
                                        <div>
                                            <div className="flex-between" style={{ marginBottom: '0.375rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Baseline (Direct Tables)</span>
                                                <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{b.non_indexed_ms}ms</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill" style={{ width: `${basePct}%`, background: 'var(--rose)', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>

                                        {/* Delta */}
                                        <div style={{ padding: '0.625rem 0.875rem', background: faster ? 'var(--emerald-dim)' : 'var(--amber-dim)', borderRadius: 'var(--r-md)', border: `1px solid ${faster ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: faster ? 'var(--emerald)' : 'var(--amber)' }}>
                                                {faster ? `${b.non_indexed_ms - b.indexed_ms}ms faster with indexing` : 'Indexing not beneficial for this query'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rationale */}
                                    <div style={{ padding: '1rem 1.125rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Technical Rationale</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                            {b.rationale || 'Custom composite indexing on high-cardinality attributes reduces logical reads by skipping full table scans. Stored Views further optimize execution by leveraging pre-structured joins.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Optimization strategy ─────────────────────────── */}
            <div className="card card-accent-emerald">
                <h3 className="section-title" style={{ color: '#34d399' }}>Optimization Strategy Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
                    {[
                        {
                            title: '1. Indexing Strategy',
                            body:  'Deployed B-Tree indexes on IncidentLocation, DisasterType, and TransactionTimestamp to accelerate filtering and sorting across high-volume tables.',
                        },
                        {
                            title: '2. View Abstraction',
                            body:  'Implemented logical views to encapsulate multi-table joins, reducing application-layer complexity and improving read performance for MIS reporting.',
                        },
                        {
                            title: '3. Transaction Isolation',
                            body:  'Utilized Snapshot Isolation where appropriate to prevent read-write blocking, ensuring dashboard responsiveness during high-frequency emergency reporting.',
                        },
                    ].map(s => (
                        <div key={s.title} style={{ padding: '1.125rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>{s.title}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
