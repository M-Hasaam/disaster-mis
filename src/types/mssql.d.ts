// Minimal type stubs for mssql (no official @types package).
// Uses the CommonJS namespace pattern so `mssql.config`, `mssql.Int`, etc. work.

declare namespace mssql {
    interface config {
        server?: string
        database?: string
        user?: string
        password?: string
        port?: number
        options?: {
            instanceName?: string
            encrypt?: boolean
            trustServerCertificate?: boolean
            connectTimeout?: number
            [key: string]: any
        }
        pool?: {
            max?: number
            min?: number
            idleTimeoutMillis?: number
            acquireTimeoutMillis?: number
        }
        [key: string]: any
    }

    interface IResult<T = any> {
        recordsets: any[][]
        recordset: any[]
        rowsAffected: number[]
        output: Record<string, any>
    }

    class Request {
        input(name: string, type?: any, value?: any): this
        query<T = any>(sql: string): Promise<IResult<T>>
        execute<T = any>(procedure: string): Promise<IResult<T>>
    }

    class ConnectionPool {
        connected: boolean
        connect(): Promise<this>
        request(): Request
        close(): Promise<void>
    }

    class Transaction {
        constructor(pool: ConnectionPool)
        begin(): Promise<void>
        commit(): Promise<void>
        rollback(): Promise<void>
        request(): Request
    }

    const Int: any
    const BigInt: any
    const NVarChar: any
    const VarChar: any
    const Decimal: any
    const DateTime: any
    const Bit: any
    const Float: any

    function connect(config: config): Promise<ConnectionPool>
}

declare module 'mssql' {
    export = mssql
}
