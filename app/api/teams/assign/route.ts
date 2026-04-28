import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { withTransaction, requestQuery, mssql, setSessionUser } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        const body = await req.json()
        const { report_id, team_id } = body
        if (!report_id || !team_id) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })

        await withTransaction(async (r) => {
            // check availability
            const teamRes = await requestQuery(r, 'SELECT status FROM RescueTeams WHERE team_id = @team_id', {
                team_id: { type: mssql.Int, value: team_id },
            })
            const status = teamRes.recordset[0]?.status
            if (status !== 'Available') throw new Error('Team not available')

            // insert assignment (trigger will set team busy)
            await requestQuery(r, `INSERT INTO TeamAssignments (report_id, team_id, assigned_at, status) VALUES (@report_id,@team_id,GETUTCDATE(),'Assigned')`, {
                report_id: { type: mssql.Int, value: report_id },
                team_id: { type: mssql.Int, value: team_id },
            })

            // update report status
            await requestQuery(r, 'UPDATE EmergencyReports SET status = @status WHERE report_id = @report_id', {
                status: { type: mssql.VarChar(50), value: 'Dispatched' },
                report_id: { type: mssql.Int, value: report_id },
            })
        })

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
