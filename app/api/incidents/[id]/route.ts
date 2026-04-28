import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { query, withTransaction, requestQuery, mssql, setSessionUser } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const reportId = Number(id)
        const res = await query('SELECT * FROM vw_ActiveEmergencies WHERE report_id = @id', { id: { type: mssql.Int, value: reportId } })
        return NextResponse.json({ ok: true, data: res.recordset[0] || null })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const reportId = Number(id)
        
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        const body = await req.json()
        const { status, team_id } = body

        await withTransaction(async (r) => {
            // update status
            await requestQuery(r, 'UPDATE EmergencyReports SET status = @status WHERE report_id = @id', {
                status: { type: mssql.VarChar(50), value: status },
                id: { type: mssql.Int, value: reportId },
            })

            if (team_id) {
                // assign team
                await requestQuery(r, `INSERT INTO TeamAssignments (report_id, team_id, assigned_at, status) VALUES (@id,@team_id,GETUTCDATE(),'Assigned')`, {
                    id: { type: mssql.Int, value: reportId },
                    team_id: { type: mssql.Int, value: team_id },
                })
                // Trigger trg_UpdateTeamStatusAfterAssignment will automatically set team status to Busy
            }
        })

        return NextResponse.json({ ok: true, data: { updated: true } })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const reportId = Number(id)

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        await query('UPDATE EmergencyReports SET status = @status WHERE report_id = @id', { status: { type: mssql.VarChar(50), value: 'Deleted' }, id: { type: mssql.Int, value: reportId } })
        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
