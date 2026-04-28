import { query, mssql, setSessionUser } from '@/lib/db'
import crypto from 'crypto'

export async function authorizeCredentials(email: string, password: string) {
    const hashed = crypto.createHash('sha256').update(password).digest('hex')
    const res = await query('SELECT u.user_id, u.name, u.email, r.role_name FROM Users u JOIN Roles r ON u.role_id = r.role_id WHERE u.email = @email AND u.password_hash = @hash AND u.is_active = 1', {
        email: { type: mssql.VarChar(256), value: email },
        hash: { type: mssql.VarChar(256), value: hashed },
    })
    return res.recordset[0] || null
}

export async function setSession(userId: number) {
    await setSessionUser(userId)
}
