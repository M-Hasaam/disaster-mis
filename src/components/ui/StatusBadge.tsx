'use client'
import React from 'react'

const statusMap: Record<string, string> = {
    // Incident
    'Pending':        'badge-amber',
    'Dispatched':     'badge-blue',
    'Resolved':       'badge-emerald',
    'Closed':         'badge-slate',
    // Severity
    'Critical':       'badge-rose',
    'CRITICAL':       'badge-rose',
    'High':           'badge-rose',
    'HIGH':           'badge-rose',
    'Medium':         'badge-amber',
    'MEDIUM':         'badge-amber',
    'Low':            'badge-cyan',
    'LOW':            'badge-cyan',
    // Teams / Resources
    'Available':      'badge-emerald',
    'AVAILABLE':      'badge-emerald',
    'Busy':           'badge-blue',
    'BUSY':           'badge-blue',
    'Offline':        'badge-slate',
    'OFFLINE':        'badge-slate',
    'EnRoute':        'badge-violet',
    'OnSite':         'badge-orange',
    // Approval / Finance
    'Approved':       'badge-emerald',
    'APPROVED':       'badge-emerald',
    'Rejected':       'badge-rose',
    'REJECTED':       'badge-rose',
    'Cancelled':      'badge-slate',
    'CANCELLED':      'badge-slate',
    // Inventory
    'Low Stock':      'badge-amber',
    'Out of Stock':   'badge-rose',
    'Adequate':       'badge-emerald',
    'LIMITED':        'badge-amber',
    // Beds
    'Critical Beds':  'badge-rose',
    // Status
    'Active':         'badge-emerald',
    'Inactive':       'badge-slate',
    'OK':             'badge-emerald',
    'Warning':        'badge-amber',
    'Error':          'badge-rose',
    'Completed':      'badge-emerald',
    'In Progress':    'badge-blue',
}

export default function StatusBadge({ status }: { status: string }) {
    const color = statusMap[status] || 'badge-slate'
    return (
        <span className={`badge ${color}`}>{status}</span>
    )
}
