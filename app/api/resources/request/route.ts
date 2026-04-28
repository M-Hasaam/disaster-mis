import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { query, mssql, setSessionUser } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        const body = await req.json()
        const { request_type, details } = body
        const res = await query(`INSERT INTO ApprovalRequests (requested_by, request_type, details, status, created_at) OUTPUT INSERTED.request_id VALUES (@userId,@request_type,@details,'Pending',GETUTCDATE())`, {
            userId: { type: mssql.Int, value: userId },
            request_type: { type: mssql.VarChar(100), value: request_type },
            details: { type: mssql.VarChar(2000), value: details },
        })
        return NextResponse.json({ ok: true, data: res.recordset[0] })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
