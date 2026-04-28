import mssql, { ConnectionPool, IResult, Request } from 'mssql'

// When DB_PORT is set, connect directly — no Browser service needed.
// When DB_PORT is not set, split SERVER\INSTANCE and let mssql use Browser.
const _rawServer = process.env.DB_SERVER || ''
const _serverParts = _rawServer.split('\\')
const _server   = _serverParts[0]
const _instance = _serverParts[1] || ''
const _port     = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined

const poolConfig: mssql.config = {
    server: _server,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: _port,
    options: {
        // Only set instanceName when NOT using a static port — the two conflict
        instanceName: _port ? undefined : (_instance || undefined),
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 15000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 15000,
    },
}

let pool: ConnectionPool | null = null

export async function getPool(): Promise<ConnectionPool> {
    if (pool && pool.connected) return pool
    pool = await mssql.connect(poolConfig)
    return pool
}

export type Params = Record<string, { type: any; value: any }>;

function bindParameters(req: Request, params?: Params) {
    if (!params) return req
    for (const [name, { type, value }] of Object.entries(params)) {
        req.input(name, type, value)
    }
    return req
}

export async function query<T = any>(queryText: string, params?: Params): Promise<IResult<T>> {
    const p = await getPool()
    const req = p.request()
    bindParameters(req, params)
    return req.query<T>(queryText)
}

export async function requestQuery<T = Record<string, unknown>>(req: Request, queryText: string, params?: Params): Promise<IResult<T>> {
    bindParameters(req, params)
    return req.query<T>(queryText)
}

export async function executeProcedure<T = any>(procName: string, params?: Params): Promise<IResult<T>> {
    const p = await getPool()
    const req = p.request()
    bindParameters(req, params)
    return req.execute<T>(procName)
}

export async function withTransaction<T>(fn: (req: Request) => Promise<T>): Promise<T> {
    const p = await getPool()
    const tx = new mssql.Transaction(p)
    await tx.begin()
    try {
        const req = tx.request()
        const res = await fn(req)
        await tx.commit()
        return res
    } catch (err) {
        await tx.rollback()
        throw err
    }
}

export async function executeTransaction<T>(statements: { sql: string; params?: Params }[]): Promise<void> {
    await withTransaction(async (req) => {
        for (const s of statements) {
            await requestQuery(req, s.sql, s.params)
        }
    })
}

export async function setSessionUser(userId: number) {
    const p = await getPool()
    const req = p.request()
    req.input('userId', mssql.Int, userId)
    await req.query(`EXEC sp_set_session_context 'user_id', @userId`)
}

export async function closePool() {
    if (pool) {
        await pool.close()
        pool = null
    }
}

export { mssql }
