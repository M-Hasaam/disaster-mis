'use client'
import React, { useState, useMemo } from 'react'

export interface Column<T = any> {
    header: string
    // New API: key + optional render
    key?: string
    render?: (value: any, row: T) => React.ReactNode
    // Legacy API: accessor function or key string
    accessor?: keyof T | ((item: T) => React.ReactNode)
    sortable?: boolean
}

interface DataTableProps<T = any> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    searchPlaceholder?: string
    pageSize?: number
}

export default function DataTable<T extends Record<string, any>>({ columns, data, loading, searchPlaceholder, pageSize = 10 }: DataTableProps<T>) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter(row => JSON.stringify(row).toLowerCase().includes(q))
    }, [data, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

    function renderCell(col: Column<T>, row: T): React.ReactNode {
        // New API: key + render
        if (col.key !== undefined) {
            const value = row[col.key]
            if (col.render) return col.render(value, row)
            if (value === null || value === undefined || value === '') return <span style={{ color: 'var(--text-muted)' }}>—</span>
            return String(value)
        }
        // Legacy API: accessor
        if (col.accessor !== undefined) {
            if (typeof col.accessor === 'function') return (col.accessor as (item: T) => React.ReactNode)(row)
            const value = row[col.accessor as string]
            if (value === null || value === undefined || value === '') return <span style={{ color: 'var(--text-muted)' }}>—</span>
            return String(value)
        }
        return <span style={{ color: 'var(--text-muted)' }}>—</span>
    }

    return (
        <div className="w-full">
            {/* Search + count row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-muted)', pointerEvents: 'none', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                    </svg>
                    <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', height: '36px' }}
                        placeholder={searchPlaceholder || 'Search records...'}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table wrapper */}
            <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => <th key={i}>{col.header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                        <div className="loading-ring" style={{ width: 24, height: 24, borderWidth: 2 }} />
                                        <span style={{ fontSize: '0.875rem' }}>Loading data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
                                        <svg style={{ width: 28, height: 28, opacity: 0.25 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                                        </svg>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>No records found</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginated.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col, j) => (
                                    <td key={j}>{renderCell(col, row)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                    </span>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                            const p = idx + 1
                            return (
                                <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p)}>{p}</button>
                            )
                        })}
                        <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    )
}
