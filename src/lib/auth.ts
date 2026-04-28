import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { query, Params, setSessionUser, mssql } from './db'
import crypto from 'crypto'

import type { UserRow } from '../types'

type AuthUserRow = UserRow & { role_name: string }

async function verifyCredentials(email: string, password: string) {
    const hashed = crypto.createHash('sha256').update(password).digest('hex').toUpperCase()
    const sql = `SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name FROM Users u JOIN Roles r on u.role_id = r.role_id WHERE u.email = @email AND u.is_active = 1`
    const params: Params = {
        email: { type: mssql.VarChar(256), value: email },
    }
    const res = await query<AuthUserRow>(sql, params)
    const user = res.recordset[0]
    if (!user) return null
    if (user.password_hash !== hashed) return null
    return { id: user.user_id, name: user.name, email: user.email, role: user.role_name }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null
                try {
                    const user = await verifyCredentials(credentials.email, credentials.password)
                    if (user) return user
                    console.warn('[auth] Bad credentials for:', credentials.email)
                    return null
                } catch (err) {
                    console.error('[auth] DB error during login:', err)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userId = Number(user.id)
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.userId as number
                session.user.role = token.role as string
            }
            return session
        },
    },
}

export async function setSessionContextForRequest(userId?: number) {
    if (!userId) return
    await setSessionUser(userId)
}

export default authOptions
