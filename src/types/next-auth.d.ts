import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: DefaultSession['user'] & {
            id: number
            role: string
        }
    }

    interface User {
        id: number
        role: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        userId?: number
        role?: string
    }
}
