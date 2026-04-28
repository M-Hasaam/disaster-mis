import { NextResponse } from 'next/server'
import { query, mssql } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')

        const sql = `SELECT disaster_type, severity, COUNT(*) as count FROM EmergencyReports WHERE (@from IS NULL OR report_time >= @from) AND (@to IS NULL OR report_time <= @to) GROUP BY disaster_type, severity ORDER BY count DESC`
        const params: any = {
            from: { type: mssql.DateTime, value: from || null },
            to: { type: mssql.DateTime, value: to || null },
        }
        const res = await query(sql, params)
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
