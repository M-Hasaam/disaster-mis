import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { withTransaction, requestQuery, mssql, setSessionUser } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const requestId = Number(id)

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id as number
        await setSessionUser(userId)

        const body = await req.json()
        const { action, decision_note, allocation_details } = body // action: 'approve' | 'reject'

        await withTransaction(async (r) => {
            const newStatus = action === 'approve' ? 'Approved' : 'Rejected'
            
            // 1. Update Approval Request
            await requestQuery(r, 'UPDATE ApprovalRequests SET status = @status, decided_by = @decided_by, decision_note = @note, decided_at = GETUTCDATE() WHERE request_id = @id', {
                status: { type: mssql.VarChar(50), value: newStatus },
                decided_by: { type: mssql.Int, value: userId },
                note: { type: mssql.VarChar(2000), value: decision_note ?? null },
                id: { type: mssql.Int, value: requestId },
            })

            // 2. If approved and it's a resource dispatch, execute allocation
            if (action === 'approve') {
                // Get request details
                const reqDetails = await requestQuery(r, 'SELECT request_type, request_payload FROM ApprovalRequests WHERE request_id = @id', {
                    id: { type: mssql.Int, value: requestId }
                })
                const type = reqDetails.recordset[0]?.request_type
                const payload = JSON.parse(reqDetails.recordset[0]?.request_payload || '{}')

                if (type === 'ResourceDispatch') {
                    const { inventory_id, quantity, destination } = allocation_details || payload
                    
                    // Insert into ResourceAllocations (Trigger trg_ReduceInventoryAfterAllocation handles the stock update)
                    await requestQuery(r, `INSERT INTO ResourceAllocations (report_id, inventory_id, quantity, destination, allocated_at) VALUES (@report_id, @inventory_id, @quantity, @destination, GETUTCDATE())`, {
                        report_id: { type: mssql.Int, value: payload.report_id || null },
                        inventory_id: { type: mssql.Int, value: inventory_id },
                        quantity: { type: mssql.Int, value: quantity },
                        destination: { type: mssql.VarChar(500), value: destination }
                    })
                }
            }
        })

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
