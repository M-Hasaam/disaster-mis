import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== 'Administrator') {
            return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
        }
        const res = await query(`
            SELECT u.user_id, u.name, u.email, u.phone, u.is_active, u.created_at, r.role_name
            FROM Users u
            JOIN Roles r ON u.role_id = r.role_id
            ORDER BY u.created_at DESC
        `)
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
