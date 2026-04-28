import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const res = await query(`SELECT ar.*, u.name as requested_by_name FROM ApprovalRequests ar LEFT JOIN Users u ON ar.requested_by = u.user_id WHERE ar.status = 'Pending' ORDER BY ar.created_at DESC`)
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
