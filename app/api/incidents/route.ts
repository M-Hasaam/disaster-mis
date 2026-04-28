import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { query, withTransaction, requestQuery, mssql, setSessionUser } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const status = url.searchParams.get('status')
        const severity = url.searchParams.get('severity')
        const location = url.searchParams.get('location')

        const where: string[] = []
        const params: any = {}
        if (status) {
            where.push('status = @status')
            params.status = { type: mssql.VarChar(50), value: status }
        }
        if (severity) {
            where.push('severity = @severity')
            params.severity = { type: mssql.VarChar(50), value: severity }
        }
        if (location) {
            where.push('location LIKE @location')
            params.location = { type: mssql.VarChar(256), value: `%${location}%` }
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const sql = `SELECT * FROM vw_ActiveEmergencies ${whereSql} ORDER BY report_time DESC`
        const res = await query(sql, params)
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        const body = await req.json()
        const { citizen, location, disaster_type, severity } = body

        const result = await withTransaction(async (r) => {
            let citizenId = citizen?.citizen_id as number | undefined
            if (!citizenId) {
                const existing = await requestQuery(r, 'SELECT citizen_id FROM Citizens WHERE email = @email OR phone = @phone', {
                    email: { type: mssql.VarChar(256), value: citizen?.email ?? null },
                    phone: { type: mssql.VarChar(50), value: citizen?.phone ?? null },
                })
                citizenId = existing.recordset[0]?.citizen_id
                if (!citizenId) {
                    const created = await requestQuery(
                        r,
                        'INSERT INTO Citizens (name, phone, address, email) OUTPUT INSERTED.citizen_id VALUES (@name,@phone,@address,@email)',
                        {
                            name: { type: mssql.VarChar(200), value: citizen?.name ?? '' },
                            phone: { type: mssql.VarChar(50), value: citizen?.phone ?? null },
                            address: { type: mssql.VarChar(500), value: citizen?.address ?? null },
                            email: { type: mssql.VarChar(256), value: citizen?.email ?? null },
                        },
                    )
                    citizenId = created.recordset[0].citizen_id
                }
            }

            const insRes = await requestQuery(r, `INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status) OUTPUT INSERTED.report_id VALUES (@citizen_id,@location,@disaster_type,@severity,GETUTCDATE(),'Pending')`, {
                citizen_id: { type: mssql.Int, value: citizenId },
                location: { type: mssql.VarChar(500), value: location },
                disaster_type: { type: mssql.VarChar(100), value: disaster_type },
                severity: { type: mssql.VarChar(50), value: severity },
            })
            return insRes.recordset[0]
        })

        return NextResponse.json({ ok: true, data: result })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
