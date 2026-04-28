import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { query, mssql, setSessionUser } from '@/lib/db'

export async function GET() {
    try {
        const res = await query('SELECT * FROM Expenses ORDER BY incurred_at DESC')
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
        const { category, amount, disaster_event } = body
        const res = await query(`INSERT INTO Expenses (category, amount, disaster_event, incurred_at, approved_by) OUTPUT INSERTED.expense_id VALUES (@category,@amount,@disaster_event,GETUTCDATE(),NULL)`, {
            category: { type: mssql.VarChar(200), value: category },
            amount: { type: mssql.Decimal(18, 2), value: amount },
            disaster_event: { type: mssql.VarChar(200), value: disaster_event },
        })
        return NextResponse.json({ ok: true, data: res.recordset[0] })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
