import { withTransaction, requestQuery, mssql } from '@/lib/db'

export async function assignTeamToIncident(report_id: number, team_id: number) {
    await withTransaction(async (r) => {
        const teamRes = await requestQuery(r, 'SELECT status FROM RescueTeams WHERE team_id = @team_id', {
            team_id: { type: mssql.Int, value: team_id },
        })
        const status = teamRes.recordset[0]?.status
        if (status !== 'Available') throw new Error('Team not available')

        await requestQuery(r, 'INSERT INTO TeamAssignments (report_id, team_id, assigned_at, status) VALUES (@report_id,@team_id,GETUTCDATE(),@status)', {
            report_id: { type: mssql.Int, value: report_id },
            team_id: { type: mssql.Int, value: team_id },
            status: { type: mssql.VarChar(50), value: 'Assigned' },
        })

        await requestQuery(r, 'UPDATE EmergencyReports SET status = @rstatus WHERE report_id = @report_id', {
            rstatus: { type: mssql.VarChar(50), value: 'Dispatched' },
            report_id: { type: mssql.Int, value: report_id },
        })
    })
}
