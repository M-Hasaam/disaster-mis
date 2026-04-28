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
        const { request_id, inventory_id, quantity_dispatched, destination } = body
        if (!request_id || !inventory_id || !quantity_dispatched) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })

        await withTransaction(async (r) => {
            // confirm approval request status
            const approval = await requestQuery(r, 'SELECT status FROM ApprovalRequests WHERE request_id = @request_id', {
                request_id: { type: mssql.Int, value: request_id },
            })
            if (approval.recordset[0]?.status !== 'Approved') throw new Error('Request not approved')

            // insert allocation (trigger will reduce inventory)
            await requestQuery(r, `INSERT INTO ResourceAllocations (request_id, inventory_id, quantity_dispatched, destination, allocated_at) VALUES (@request_id,@inventory_id,@quantity,@destination,GETUTCDATE())`, {
                request_id: { type: mssql.Int, value: request_id },
                inventory_id: { type: mssql.Int, value: inventory_id },
                quantity: { type: mssql.Int, value: quantity_dispatched },
                destination: { type: mssql.VarChar(500), value: destination },
            })
        })

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
