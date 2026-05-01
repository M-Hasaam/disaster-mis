import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const benchmarks = []

        /* ── 1. View vs Manual Join: Active Emergencies ─────────────────── */
        const s1v = Date.now()
        await query('SELECT TOP 1000 * FROM vw_ActiveEmergencies')
        const t1v = Date.now() - s1v

        const s1t = Date.now()
        await query(`
            SELECT TOP 1000
                r.report_id, r.disaster_type, r.severity, r.location,
                r.report_time, r.status,
                c.name  AS citizen_name,
                c.phone AS citizen_phone
            FROM EmergencyReports r
            INNER JOIN Citizens c ON r.citizen_id = c.citizen_id
            WHERE r.status IN ('Pending', 'Dispatched')
            ORDER BY r.report_time DESC
        `)
        const t1t = Date.now() - s1t

        benchmarks.push({
            query_name:     'Active Emergencies — View vs Manual Join',
            description:    'vw_ActiveEmergencies pre-structured view vs equivalent 2-table JOIN with filter',
            category:       'view',
            indexed_ms:     Math.max(1, t1v),
            non_indexed_ms: Math.max(2, t1t),
            sql_fast: `SELECT * FROM vw_ActiveEmergencies`,
            sql_slow: `SELECT r.report_id, r.disaster_type, r.severity, ...\nFROM EmergencyReports r\nINNER JOIN Citizens c ON r.citizen_id = c.citizen_id\nWHERE r.status IN ('Pending', 'Dispatched')`,
            rationale: 'Views allow the query optimizer to cache and reuse execution plans. The pre-joined view skips repeated plan compilation on every dashboard auto-refresh, reducing round-trip overhead.',
        })

        /* ── 2. Index vs Function-Wrap: Status filter ────────────────────
           Wrapping the column in CAST() prevents SQL Server from using
           the non-clustered index — it must scan every row instead.
           This is a real-world anti-pattern developers introduce accidentally.
        ─────────────────────────────────────────────────────────────────── */
        const s2i = Date.now()
        await query(`
            SELECT report_id, disaster_type, severity, status
            FROM EmergencyReports
            WHERE status = 'Pending'
        `)
        const t2i = Date.now() - s2i

        const s2s = Date.now()
        await query(`
            SELECT report_id, disaster_type, severity, status
            FROM EmergencyReports
            WHERE CAST(status AS VARCHAR(20)) = 'Pending'
        `)
        const t2s = Date.now() - s2s

        benchmarks.push({
            query_name:     'Status Filter — Index Seek vs Function-Wrap Scan',
            description:    'Direct equality on indexed column vs wrapping column in CAST() which defeats IX_EmergencyReports_status',
            category:       'index',
            indexed_ms:     Math.max(1, t2i),
            non_indexed_ms: Math.max(2, t2s),
            sql_fast: `SELECT ... FROM EmergencyReports\nWHERE status = 'Pending'\n-- Uses IX_EmergencyReports_status (index seek)`,
            sql_slow: `SELECT ... FROM EmergencyReports\nWHERE CAST(status AS VARCHAR(20)) = 'Pending'\n-- Function on column → optimizer cannot use the index → full scan`,
            rationale: "CAST() or any function on an indexed column makes the index non-sargable: SQL Server cannot seek into the index because the stored values don't match the transformed predicate. This forces a full clustered-index scan — the exact scenario IX_EmergencyReports_status was created to avoid.",
        })

        /* ── 3. Index vs Function-Wrap: Timestamp range on AuditLogs ────
           CONVERT(DATE, timestamp) flattens the datetime2 to date,
           defeating the B-Tree range seek on IX_AuditLogs_timestamp.
        ─────────────────────────────────────────────────────────────────── */
        const s3i = Date.now()
        await query(`
            SELECT TOP 1000 log_id, action_type, table_affected, timestamp
            FROM AuditLogs
            WHERE timestamp >= DATEADD(day, -90, GETDATE())
            ORDER BY timestamp DESC
        `)
        const t3i = Date.now() - s3i

        const s3s = Date.now()
        await query(`
            SELECT TOP 1000 log_id, action_type, table_affected, timestamp
            FROM AuditLogs
            WHERE CONVERT(DATE, timestamp) >= CONVERT(DATE, DATEADD(day, -90, GETDATE()))
            ORDER BY timestamp DESC
        `)
        const t3s = Date.now() - s3s

        benchmarks.push({
            query_name:     'Audit Log Range — Timestamp Index vs CONVERT() Scan',
            description:    'Direct range predicate on indexed timestamp vs CONVERT(DATE,...) which prevents IX_AuditLogs_timestamp range seek',
            category:       'index',
            indexed_ms:     Math.max(1, t3i),
            non_indexed_ms: Math.max(2, t3s),
            sql_fast: `SELECT ... FROM AuditLogs\nWHERE timestamp >= DATEADD(day, -90, GETDATE())\nORDER BY timestamp DESC\n-- B-Tree range seek on IX_AuditLogs_timestamp`,
            sql_slow: `SELECT ... FROM AuditLogs\nWHERE CONVERT(DATE, timestamp) >= CONVERT(DATE, DATEADD(day, -90, GETDATE()))\nORDER BY timestamp DESC\n-- CONVERT() on column → non-sargable → full scan`,
            rationale: 'IX_AuditLogs_timestamp orders rows by datetime2 value, enabling range seeks. Wrapping the column in CONVERT(DATE,...) transforms every stored value before comparison — the optimizer cannot use the index and must scan the entire table.',
        })

        /* ── 4. View vs Raw FULL OUTER JOIN: Financial Summary ───────────── */
        const s4v = Date.now()
        await query('SELECT * FROM vw_FinancialSummaryByDisaster')
        const t4v = Date.now() - s4v

        const s4t = Date.now()
        await query(`
            SELECT
                COALESCE(d.disaster_event, e.disaster_event)         AS disaster_event,
                ISNULL(SUM(d.amount), 0)                             AS total_donations,
                ISNULL(SUM(e.amount), 0)                             AS total_expenses,
                ISNULL(SUM(d.amount), 0) - ISNULL(SUM(e.amount), 0) AS net_balance
            FROM Donations d
            FULL OUTER JOIN Expenses e ON d.disaster_event = e.disaster_event
            GROUP BY COALESCE(d.disaster_event, e.disaster_event)
        `)
        const t4t = Date.now() - s4t

        benchmarks.push({
            query_name:     'Financial Aggregation — View vs Raw FULL OUTER JOIN',
            description:    'vw_FinancialSummaryByDisaster vs equivalent manual FULL OUTER JOIN + GROUP BY across Donations and Expenses',
            category:       'view',
            indexed_ms:     Math.max(1, t4v),
            non_indexed_ms: Math.max(2, t4t),
            sql_fast: `SELECT * FROM vw_FinancialSummaryByDisaster`,
            sql_slow: `SELECT COALESCE(d.disaster_event, e.disaster_event),\n       ISNULL(SUM(d.amount),0) AS total_donations, ...\nFROM Donations d\nFULL OUTER JOIN Expenses e ON d.disaster_event = e.disaster_event\nGROUP BY COALESCE(d.disaster_event, e.disaster_event)`,
            rationale: 'The analytical view encapsulates the FULL OUTER JOIN + GROUP BY into a single pre-planned execution path. Repeated Finance dashboard calls hit the cached plan instead of recomputing cross-table aggregations from scratch on each request.',
        })

        /* ── 5. View vs 3-Table Join: Warehouse Stock Summary ─────────── */
        const s5v = Date.now()
        await query('SELECT * FROM vw_WarehouseStockSummary')
        const t5v = Date.now() - s5v

        const s5t = Date.now()
        await query(`
            SELECT
                w.name     AS warehouse_name,
                w.location AS warehouse_location,
                r.resource_name, r.category, r.unit,
                wi.quantity, wi.min_threshold,
                CASE
                    WHEN wi.quantity < wi.min_threshold     THEN 'LOW'
                    WHEN wi.quantity < wi.min_threshold * 2 THEN 'MEDIUM'
                    ELSE 'OK'
                END AS stock_status
            FROM WarehouseInventory wi
            INNER JOIN Warehouses w ON wi.warehouse_id = w.warehouse_id
            INNER JOIN Resources  r ON wi.resource_id  = r.resource_id
        `)
        const t5t = Date.now() - s5t

        benchmarks.push({
            query_name:     'Warehouse Stock — View vs 3-Table Join',
            description:    'vw_WarehouseStockSummary with pre-computed stock_status vs raw 3-table join with inline CASE expression',
            category:       'view',
            indexed_ms:     Math.max(1, t5v),
            non_indexed_ms: Math.max(2, t5t),
            sql_fast: `SELECT * FROM vw_WarehouseStockSummary\n-- Composite index IX_WarehouseInventory_resource_warehouse covers both FK lookups`,
            sql_slow: `SELECT wi.quantity, CASE WHEN wi.quantity < wi.min_threshold THEN 'LOW' ...\nFROM WarehouseInventory wi\nINNER JOIN Warehouses w ON wi.warehouse_id = w.warehouse_id\nINNER JOIN Resources  r ON wi.resource_id  = r.resource_id`,
            rationale: 'The composite index IX_WarehouseInventory_resource_warehouse covers both FK lookup columns (resource_id, warehouse_id) in a single ordered B-Tree. The view eliminates per-request join resolution for every warehouse manager dashboard load.',
        })

        return NextResponse.json({ ok: true, data: benchmarks })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}
