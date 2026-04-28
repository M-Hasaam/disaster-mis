import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const res = await query(`
            SELECT sa.alert_id, sa.alert_time,
                   r.resource_name, w.name AS warehouse_name,
                   wi.quantity AS current_stock, wi.min_threshold
            FROM StockAlerts sa
            JOIN WarehouseInventory wi ON sa.inventory_id = wi.inventory_id
            JOIN Resources r ON wi.resource_id = r.resource_id
            JOIN Warehouses w ON wi.warehouse_id = w.warehouse_id
            ORDER BY sa.alert_time DESC
        `)
        return NextResponse.json({ ok: true, data: res.recordset })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
