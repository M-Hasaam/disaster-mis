'use client'
import React, { useEffect, useState, useCallback } from 'react'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'

export default function AdminApprovalsPage() {
    const [approvals, setApprovals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<any | null>(null)
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)
    const [decisionNote, setDecisionNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/approvals/pending').then(r => r.json())
            if (res.ok) setApprovals(res.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    async function handleDecision() {
        if (!selected || !action) return
        setSubmitting(true)
        setMsg('')
        try {
            const res = await fetch(`/api/approvals/${selected.request_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, decision_note: decisionNote }),
            }).then(r => r.json())
            if (res.ok) {
                setMsg(action === 'approve' ? 'Request approved.' : 'Request rejected.')
                await fetchData()
                setTimeout(() => { setSelected(null); setAction(null); setDecisionNote(''); setMsg('') }, 1300)
            } else {
                setMsg(res.error || 'Action failed.')
            }
        } finally { setSubmitting(false) }
    }

    const columns = [
        { key: 'request_id', header: '#', render: (v: any) => <span style={{ color: 'var(--text-muted)' }}>#{v}</span> },
        {
            key: 'request_type', header: 'Type', render: (v: string) => (
                <span style={{ padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--r-full)', color: 'var(--color-blue)' }}>{v}</span>
            )
        },
        { key: 'description', header: 'Description' },
        { key: 'requested_by_name', header: 'Requested By' },
        { key: 'status', header: 'Status', render: (v: string) => <StatusBadge status={v} /> },
        {
            key: 'created_at', header: 'Submitted', render: (v: string) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleString() : '—'}</span>
            )
        },
        {
            key: '_actions', header: 'Actions', render: (_: any, row: any) => (
                row.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setSelected(row); setAction('approve'); setDecisionNote('') }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-emerald)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}>
                            Approve
                        </button>
                        <button onClick={() => { setSelected(row); setAction('reject'); setDecisionNote('') }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-rose)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}>
                            Reject
                        </button>
                    </div>
                ) : null
            )
        },
    ]

    const pending = approvals.filter(a => a.status === 'Pending').length

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Approval Queue</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Review and decide on pending authorization requests from all departments.</p>
                </div>
                {pending > 0 && (
                    <div style={{ padding: '0.5rem 1.25rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 'var(--r-full)' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-amber)' }}>{pending} Pending</span>
                    </div>
                )}
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Pending', value: approvals.filter(a => a.status === 'Pending').length, color: 'var(--color-amber)' },
                    { label: 'Approved', value: approvals.filter(a => a.status === 'Approved').length, color: 'var(--color-emerald)' },
                    { label: 'Rejected', value: approvals.filter(a => a.status === 'Rejected').length, color: 'var(--color-rose)' },
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
                <DataTable columns={columns} data={approvals} pageSize={15} />
            )}

            {/* Decision Modal */}
            {selected && action && (
                <Modal title={`${action === 'approve' ? 'Approve' : 'Reject'} Request #${selected.request_id}`} onClose={() => { setSelected(null); setAction(null); setMsg('') }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Type</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-blue)' }}>{selected.request_type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Requested By</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.requested_by_name}</span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{selected.description}</p>
                        </div>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Decision Note (optional)
                            <textarea
                                value={decisionNote}
                                onChange={e => setDecisionNote(e.target.value)}
                                rows={3}
                                placeholder="Add a note for the record…"
                                style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </label>

                        {msg && (
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: msg.includes('approved') ? 'var(--color-emerald)' : msg.includes('rejected') ? 'var(--color-amber)' : 'var(--color-rose)' }}>{msg}</p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setSelected(null); setAction(null) }} style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleDecision} disabled={submitting} style={{ padding: '0.5rem 1.5rem', background: action === 'approve' ? 'var(--color-emerald)' : 'var(--color-rose)', border: 'none', borderRadius: 'var(--r-md)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? 'Processing…' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
