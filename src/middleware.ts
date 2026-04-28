import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicPaths = ['/login', '/api/auth']

// Maps exact DB role_name values → their home dashboard
const roleHome: Record<string, string> = {
    'Administrator':     '/admin',
    'Emergency Operator': '/operator',
    'Field Officer':     '/field-officer',
    'Warehouse Manager': '/warehouse',
    'Finance Officer':   '/finance',
}

function isPublicPath(pathname: string) {
    return publicPaths.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isPublicPath(pathname) || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
        return NextResponse.next()
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
    }

    // Let API routes through (they do their own auth)
    if (pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
