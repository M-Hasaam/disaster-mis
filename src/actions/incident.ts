import { withTransaction, requestQuery, mssql } from '@/lib/db'

export async function createIncident({ citizen, location, disaster_type, severity }: any) {
    return withTransaction(async (r) => {
        let citizenId = citizen?.citizen_id
        if (!citizenId) {
            const ins = await requestQuery(r, 'INSERT INTO Citizens (name, phone, address, email) OUTPUT INSERTED.citizen_id VALUES (@name,@phone,@address,@email)', {
                name: { type: mssql.VarChar(200), value: citizen?.name ?? '' },
                phone: { type: mssql.VarChar(50), value: citizen?.phone ?? null },
                address: { type: mssql.VarChar(500), value: citizen?.address ?? null },
                email: { type: mssql.VarChar(256), value: citizen?.email ?? null },
            })
            citizenId = ins.recordset[0].citizen_id
        }
        const ins2 = await requestQuery(r, 'INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status) OUTPUT INSERTED.report_id VALUES (@cid,@loc,@dt,@sev,GETUTCDATE(),@status)', {
            cid: { type: mssql.Int, value: citizenId },
            loc: { type: mssql.VarChar(500), value: location },
            dt: { type: mssql.VarChar(100), value: disaster_type },
            sev: { type: mssql.VarChar(50), value: severity },
            status: { type: mssql.VarChar(50), value: 'Pending' },
        })
        return ins2.recordset[0]
    })
}

export async function updateIncidentStatus(reportId: number, status: string) {
    await withTransaction(async (r) => {
        await requestQuery(r, 'UPDATE EmergencyReports SET status = @status WHERE report_id = @id', {
            status: { type: mssql.VarChar(50), value: status },
            id: { type: mssql.Int, value: reportId },
        })
    })
}
