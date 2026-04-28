import { withTransaction, requestQuery, mssql } from '@/lib/db'

export async function requestResource(userId: number, request_type: string, details: string) {
    const res = await withTransaction(async (r) => {
        const out = await requestQuery(r, 'INSERT INTO ApprovalRequests (requested_by, request_type, details, status, created_at) OUTPUT INSERTED.request_id VALUES (@userId,@rt,@details,\'Pending\',GETUTCDATE())', {
            userId: { type: mssql.Int, value: userId },
            rt: { type: mssql.VarChar(100), value: request_type },
            details: { type: mssql.VarChar(2000), value: details },
        })
        return out.recordset[0]
    })
    return res
}

export async function approveAndAllocate(request_id: number, inventory_id: number, quantity: number, destination: string) {
    await withTransaction(async (r) => {
        await requestQuery(r, 'UPDATE ApprovalRequests SET status = @s WHERE request_id = @id', {
            s: { type: mssql.VarChar(50), value: 'Approved' },
            id: { type: mssql.Int, value: request_id },
        })
        await requestQuery(r, 'INSERT INTO ResourceAllocations (request_id, inventory_id, quantity_dispatched, destination, allocated_at) VALUES (@rid,@inv,@qty,@dest,GETUTCDATE())', {
            rid: { type: mssql.Int, value: request_id },
            inv: { type: mssql.Int, value: inventory_id },
            qty: { type: mssql.Int, value: quantity },
            dest: { type: mssql.VarChar(500), value: destination },
        })
    })
}
