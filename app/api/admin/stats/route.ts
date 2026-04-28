import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM EmergencyReports WHERE status != 'Resolved' AND status != 'Deleted') as active_incidents,
                (SELECT COUNT(*) FROM RescueTeams WHERE status = 'Available') as available_teams,
                (SELECT COUNT(*) FROM ApprovalRequests WHERE status = 'Pending') as pending_approvals,
                (SELECT SUM(amount) FROM Donations) as total_donations,
                (SELECT COUNT(*) FROM StockAlerts) as stock_alerts
        `)
        
        const charts = await query(`
            SELECT disaster_type, COUNT(*) as count 
            FROM EmergencyReports 
            GROUP BY disaster_type
        `)

        return NextResponse.json({ 
            ok: true, 
            data: {
                summary: stats.recordset[0],
                disasterDistribution: charts.recordset
            } 
        })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
