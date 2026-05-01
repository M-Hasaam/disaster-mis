'use client'
import React, { useEffect, useState, useCallback } from 'react'
import StatCard from '@/components/ui/StatCard'

const CATEGORY_LABEL: Record<string, string> = {
    index: 'Index Benchmark',
    view:  'View Benchmark',
}
const CATEGORY_COLOR: Record<string, string> = {
    index: '#14b8a6',
    view:  '#8b5cf6',
}

function SqlBlock({ label, code, color }: { label: string; code: string; color: string }) {
    return (
        <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{label}</p>
            <pre style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.6875rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '0.625rem 0.75rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.6,
                margin: 0,
            }}>{code}</pre>
        </div>
    )
}

export default function PerformancePage() {
    const [benchmarks, setBenchmarks]   = useState<any[]>([])
    const [loading,    setLoading]      = useState(true)
    const [error,      setError]        = useState<string | null>(null)
    const [expanded,   setExpanded]     = useState<number | null>(null)

    const runBenchmarks = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/performance/compare').then(r => r.json())
            if (res.ok) {
                setBenchmarks(res.data)
            } else {
                setError(res.error || 'Benchmark failed — check database connection')
                setBenchmarks([])
            }
        } catch (e: any) {
            setError(e.message || 'Network error — could not reach the API')
            setBenchmarks([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { runBenchmarks() }, [runBenchmarks])

    /* ── KPI summary values ─────────────────────────────────────────────── */
    const allFast   = benchmarks.map(b => b.indexed_ms)
    const allSlow   = benchmarks.map(b => b.non_indexed_ms)
    const bestFast  = allFast.length  ? Math.min(...allFast)  : null
    const worstSlow = allSlow.length  ? Math.max(...allSlow)  : null
    const gainPct   = (bestFast != null && worstSlow != null && worstSlow > 0)
        ? Math.round(((worstSlow - bestFast) / worstSlow) * 100) : null
    const avgImprovement = benchmarks.length
        ? Math.round(benchmarks.reduce((a, b) => a + Math.max(0, b.non_indexed_ms - b.indexed_ms), 0) / benchmarks.length)
        : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="command-header">
                <div>
                    <h1 className="page-title gradient-title">Database Performance</h1>
                    <p className="page-subtitle">
                        Live benchmarks · Indexed vs Non-Indexed · Views vs Base Tables · Query latency comparisons
                    </p>
                </div>
                <button
                    onClick={runBenchmarks}
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                >
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span className="loading-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            Running Suite...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                            Re-run Diagnostic Suite
                        </span>
                    )}
                </button>
            </div>

            {/* ── KPI cards ───────────────────────────────────────────────── */}
            <div className="grid-4">
                <StatCard
                    title="Fastest Optimized Query"
                    value={loading ? '...' : bestFast != null ? `${bestFast}ms` : '—'}
                    iconColor="emerald"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>}
                    description="Best result (view / indexed)"
                />
                <StatCard
                    title="Slowest Baseline Query"
                    value={loading ? '...' : worstSlow != null ? `${worstSlow}ms` : '—'}
                    iconColor="rose"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/></svg>}
                    description="Worst result (scan / raw join)"
                />
                <StatCard
                    title="Max Latency Gain"
                    value={loading ? '...' : gainPct != null ? `${gainPct}%` : '—'}
                    iconColor="blue"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>}
                    description="Best improvement across benchmarks"
                />
                <StatCard
                    title="Avg Latency Saved"
                    value={loading ? '...' : avgImprovement != null ? `${avgImprovement}ms` : '—'}
                    iconColor="amber"
                    icon={<svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                    description="Per-query average improvement"
                />
            </div>

            {/* ── Loading skeleton ─────────────────────────────────────────── */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="card" style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="skeleton" style={{ width: '45%', height: 18, borderRadius: 'var(--r-sm)' }} />
                                <div className="skeleton" style={{ width: '65%', height: 13, borderRadius: 'var(--r-sm)' }} />
                                <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 4, marginTop: '0.5rem' }} />
                                <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Error state ──────────────────────────────────────────────── */}
            {!loading && error && (
                <div className="card" style={{
                    padding: '3rem 2rem', textAlign: 'center',
                    background: 'rgba(244,63,94,0.04)',
                    border: '1px solid rgba(244,63,94,0.2)',
                }}>
                    <svg style={{ width: 40, height: 40, color: 'var(--rose)', margin: '0 auto 1rem', display: 'block', opacity: 0.7 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                    <p style={{ fontWeight: 700, color: 'var(--rose)', marginBottom: '0.375rem' }}>Benchmark Failed</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontFamily: 'ui-monospace, monospace' }}>{error}</p>
                    <button onClick={runBenchmarks} className="btn btn-secondary">Retry</button>
                </div>
            )}

            {/* ── Results ──────────────────────────────────────────────────── */}
            {!loading && !error && benchmarks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {benchmarks.map((b: any, i: number) => {
                        const maxMs   = Math.max(b.indexed_ms, b.non_indexed_ms, 1)
                        const fastPct = (b.indexed_ms     / maxMs) * 100
                        const slowPct = (b.non_indexed_ms / maxMs) * 100
                        const faster  = b.indexed_ms < b.non_indexed_ms
                        const diffMs  = b.non_indexed_ms - b.indexed_ms
                        const catColor = CATEGORY_COLOR[b.category] ?? '#14b8a6'
                        const isOpen  = expanded === i

                        return (
                            <div key={i} className="card" style={{ overflow: 'hidden' }}>

                                {/* Card header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                                                letterSpacing: '0.1em', padding: '0.18rem 0.55rem',
                                                background: `${catColor}18`, border: `1px solid ${catColor}44`,
                                                borderRadius: 'var(--r-full)', color: catColor,
                                            }}>
                                                {CATEGORY_LABEL[b.category] ?? b.category}
                                            </span>
                                            <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', fontWeight: 700 }}>
                                                TEST {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
                                            {b.query_name}
                                        </h3>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{b.description}</p>
                                    </div>

                                    {/* Diff badge */}
                                    <div style={{
                                        flexShrink: 0,
                                        padding: '0.4rem 0.875rem',
                                        borderRadius: 'var(--r-lg)',
                                        background: faster ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        border: `1px solid ${faster ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 900, color: faster ? 'var(--emerald)' : 'var(--amber)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, monospace' }}>
                                            {faster ? `−${diffMs}ms` : `+${Math.abs(diffMs)}ms`}
                                        </p>
                                        <p style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {faster ? 'improvement' : 'overhead'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {b.category === 'view' ? 'View Query' : 'Indexed Query'}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {b.indexed_ms}ms
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-bar-fill" style={{ width: `${fastPct}%`, background: 'var(--emerald)', boxShadow: '0 0 8px rgba(16,185,129,0.4)', transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {b.category === 'view' ? 'Direct Table Join' : 'Table Scan (No Index)'}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {b.non_indexed_ms}ms
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-bar-fill" style={{ width: `${slowPct}%`, background: 'var(--rose)', boxShadow: '0 0 8px rgba(244,63,94,0.3)', transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Rationale */}
                                <div style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Analysis: </span>
                                        {b.rationale}
                                    </p>
                                </div>

                                {/* Expand SQL */}
                                <button
                                    onClick={() => setExpanded(isOpen ? null : i)}
                                    style={{
                                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                        color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
                                        padding: '0.25rem 0', letterSpacing: '0.03em',
                                    }}
                                >
                                    <svg style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                                    {isOpen ? 'Hide SQL' : 'Show SQL queries'}
                                </button>

                                {isOpen && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                                        <SqlBlock label="Optimized query" color="var(--emerald)" code={b.sql_fast} />
                                        <SqlBlock label="Baseline query" color="var(--rose)"    code={b.sql_slow} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Optimization strategy summary ────────────────────────────── */}
            <div className="card card-accent-emerald">
                <h3 className="section-title" style={{ color: 'var(--emerald)', marginBottom: '1rem' }}>Optimization Strategy Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        {
                            num: '01',
                            title: 'B-Tree Non-Clustered Indexes',
                            body:  'Single-column indexes on high-frequency filter attributes (status, timestamp, location) convert O(n) full table scans into O(log n) seeks. Critical for sub-second emergency dashboards.',
                            color: '#14b8a6',
                        },
                        {
                            num: '02',
                            title: 'Composite & Filtered Indexes',
                            body:  'Composite index on (resource_id, warehouse_id) covers both FK lookups in one seek. Filtered index WHERE status=\'Pending\' reduces index size and scan cost for the approval queue.',
                            color: '#8b5cf6',
                        },
                        {
                            num: '03',
                            title: 'View-Based Query Abstraction',
                            body:  'Five pre-structured views cache complex join execution plans. Dashboard reads hit pre-optimized paths instead of recompiling multi-table joins on every request.',
                            color: '#f59e0b',
                        },
                    ].map(s => (
                        <div key={s.num} style={{ padding: '1rem 1.125rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: s.color, fontFamily: 'ui-monospace, monospace', background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 'var(--r-sm)', padding: '0.1rem 0.4rem' }}>{s.num}</span>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</p>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
