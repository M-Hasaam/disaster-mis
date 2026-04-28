import { NextResponse } from 'next/server'
import { query, mssql } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = searchParams.get('limit') || '50'
        
        const res = await query(`
            SELECT TOP (@limit) 
                al.*, 
                u.name as user_name
            FROM AuditLogs al
            LEFT JOIN Users u ON al.user_id = u.user_id
            ORDER BY al.timestamp DESC
        `, { limit: { type: mssql.Int, value: parseInt(limit) } })

        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
