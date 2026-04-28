import { NextResponse } from 'next/server'
import { query, mssql } from '@/lib/db'

export async function GET() {
    try {
        const res = await query('SELECT * FROM RescueTeams ORDER BY team_name')
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
