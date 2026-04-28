'use client'
import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'

type Tab = 'donations' | 'expenses'

export default function FinanceTransactionsPage() {
    const [tab, setTab] = useState<Tab>('donations')
    const [donations, setDonations] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Add Donation modal
    const [showDonate, setShowDonate] = useState(false)
    const [dForm, setDForm] = useState({ donor_name: '', amount: '', type: 'Cash', disaster_event: '' })
    const [dSubmitting, setDSubmitting] = useState(false)
    const [dMsg, setDMsg] = useState('')

    // Add Expense modal
    const [showExpense, setShowExpense] = useState(false)
    const [eForm, setEForm] = useState({ category: '', amount: '', disaster_event: '' })
    const [eSubmitting, setESubmitting] = useState(false)
    const [eMsg, setEMsg] = useState('')

    async function fetchData() {
        setLoading(true)
        try {
            const [dRes, eRes] = await Promise.all([
                fetch('/api/finance/donations').then(r => r.json()),
                fetch('/api/finance/expenses').then(r => r.json()),
            ])
            if (dRes.ok) setDonations(dRes.data)
            if (eRes.ok) setExpenses(eRes.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const totalDonations = donations.reduce((a, d) => a + Number(d.amount ?? 0), 0)
    const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount ?? 0), 0)
    const net = totalDonations - totalExpenses

    async function submitDonation(e: React.FormEvent) {
        e.preventDefault()
        setDSubmitting(true)
        setDMsg('')
        try {
            const res = await fetch('/api/finance/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...dForm, amount: Number(dForm.amount) }),
            }).then(r => r.json())
            if (res.ok) {
                setDMsg('Donation recorded.')
                await fetchData()
                setTimeout(() => { setShowDonate(false); setDMsg(''); setDForm({ donor_name: '', amount: '', type: 'Cash', disaster_event: '' }) }, 1200)
            } else {
                setDMsg(res.error || 'Failed.')
            }
        } finally { setDSubmitting(false) }
    }

    async function submitExpense(e: React.FormEvent) {
        e.preventDefault()
        setESubmitting(true)
        setEMsg('')
        try {
            const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...eForm, amount: Number(eForm.amount) }),
            }).then(r => r.json())
            if (res.ok) {
                setEMsg('Expense recorded.')
                await fetchData()
                setTimeout(() => { setShowExpense(false); setEMsg(''); setEForm({ category: '', amount: '', disaster_event: '' }) }, 1200)
            } else {
                setEMsg(res.error || 'Failed.')
            }
        } finally { setESubmitting(false) }
    }

    const donationCols = [
        { key: 'donation_id', header: '#', render: (v: any) => <span style={{ color: 'var(--text-muted)' }}>#{v}</span> },
        { key: 'donor_name', header: 'Donor' },
        {
            key: 'amount', header: 'Amount', render: (v: any) => (
                <span style={{ fontWeight: 700, color: 'var(--color-emerald)', fontVariantNumeric: 'tabular-nums' }}>
                    ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        },
        { key: 'type', header: 'Type', render: (v: string) => <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-full)', color: 'var(--color-emerald)' }}>{v}</span> },
        { key: 'disaster_event', header: 'Event' },
        { key: 'donated_at', header: 'Date', render: (v: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleDateString() : '—'}</span> },
    ]

    const expenseCols = [
        { key: 'expense_id', header: '#', render: (v: any) => <span style={{ color: 'var(--text-muted)' }}>#{v}</span> },
        { key: 'category', header: 'Category' },
        {
            key: 'amount', header: 'Amount', render: (v: any) => (
                <span style={{ fontWeight: 700, color: 'var(--color-rose)', fontVariantNumeric: 'tabular-nums' }}>
                    ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        },
        { key: 'disaster_event', header: 'Event' },
        { key: 'incurred_at', header: 'Date', render: (v: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{v ? new Date(v).toLocaleDateString() : '—'}</span> },
    ]

    const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.8rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }
    const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="command-header">
                <div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Transactions</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Full ledger of donations received and operational expenses incurred.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowDonate(true)} style={{ padding: '0.45rem 1.1rem', fontSize: '0.8125rem', fontWeight: 700, background: 'var(--color-emerald)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}>
                        + Donation
                    </button>
                    <button onClick={() => setShowExpense(true)} style={{ padding: '0.45rem 1.1rem', fontSize: '0.8125rem', fontWeight: 700, background: 'var(--color-rose)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}>
                        + Expense
                    </button>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'Total Donations', value: `$${totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--color-emerald)' },
                    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--color-rose)' },
                    { label: 'Net Balance', value: `$${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: net >= 0 ? 'var(--color-emerald)' : 'var(--color-rose)' },
                ].map(k => (
                    <div key={k.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{k.label}</p>
                        <p style={{ fontSize: '1.625rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-subtle)' }}>
                {(['donations', 'expenses'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', textTransform: 'capitalize',
                        color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${tab === t ? (t === 'donations' ? 'var(--color-emerald)' : 'var(--color-rose)') : 'transparent'}`,
                        marginBottom: -1,
                    }}>
                        {t} <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.7, fontWeight: 600, fontSize: '0.75rem' }}>({t === 'donations' ? donations.length : expenses.length})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-ring" /></div>
            ) : tab === 'donations' ? (
                <DataTable columns={donationCols} data={donations} pageSize={20} />
            ) : (
                <DataTable columns={expenseCols} data={expenses} pageSize={20} />
            )}

            {/* Add Donation Modal */}
            {showDonate && (
                <Modal title="Record Donation" onClose={() => { setShowDonate(false); setDMsg('') }}>
                    <form onSubmit={submitDonation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={labelStyle}>Donor Name <input required style={inputStyle} value={dForm.donor_name} onChange={e => setDForm(f => ({ ...f, donor_name: e.target.value }))} /></label>
                        <label style={labelStyle}>Amount (USD) <input required type="number" min="0.01" step="0.01" style={inputStyle} value={dForm.amount} onChange={e => setDForm(f => ({ ...f, amount: e.target.value }))} /></label>
                        <label style={labelStyle}>Type
                            <select style={inputStyle} value={dForm.type} onChange={e => setDForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="Cash">Cash</option>
                                <option value="In-Kind">In-Kind</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Online">Online</option>
                            </select>
                        </label>
                        <label style={labelStyle}>Disaster Event <input style={inputStyle} value={dForm.disaster_event} onChange={e => setDForm(f => ({ ...f, disaster_event: e.target.value }))} /></label>
                        {dMsg && <p style={{ color: dMsg.includes('recorded') ? 'var(--color-emerald)' : 'var(--color-rose)', fontSize: '0.875rem', fontWeight: 600 }}>{dMsg}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" onClick={() => setShowDonate(false)} style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" disabled={dSubmitting} style={{ padding: '0.5rem 1.5rem', background: 'var(--color-emerald)', border: 'none', borderRadius: 'var(--r-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: dSubmitting ? 0.7 : 1 }}>
                                {dSubmitting ? 'Saving…' : 'Record'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Expense Modal */}
            {showExpense && (
                <Modal title="Record Expense" onClose={() => { setShowExpense(false); setEMsg('') }}>
                    <form onSubmit={submitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={labelStyle}>Category <input required style={inputStyle} value={eForm.category} onChange={e => setEForm(f => ({ ...f, category: e.target.value }))} /></label>
                        <label style={labelStyle}>Amount (USD) <input required type="number" min="0.01" step="0.01" style={inputStyle} value={eForm.amount} onChange={e => setEForm(f => ({ ...f, amount: e.target.value }))} /></label>
                        <label style={labelStyle}>Disaster Event <input style={inputStyle} value={eForm.disaster_event} onChange={e => setEForm(f => ({ ...f, disaster_event: e.target.value }))} /></label>
                        {eMsg && <p style={{ color: eMsg.includes('recorded') ? 'var(--color-emerald)' : 'var(--color-rose)', fontSize: '0.875rem', fontWeight: 600 }}>{eMsg}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" onClick={() => setShowExpense(false)} style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" disabled={eSubmitting} style={{ padding: '0.5rem 1.5rem', background: 'var(--color-rose)', border: 'none', borderRadius: 'var(--r-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: eSubmitting ? 0.7 : 1 }}>
                                {eSubmitting ? 'Saving…' : 'Record'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
