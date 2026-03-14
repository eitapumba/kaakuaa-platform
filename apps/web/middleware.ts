import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================
// MAINTENANCE MODE
// Set to true to show maintenance page for everyone
// Set to false to disable maintenance mode
// ============================================
const MAINTENANCE_MODE = true

// Emails/IDs that can bypass maintenance (for future use with auth cookies)
// For now, ALL visitors see the maintenance page
const ALLOWED_EMAILS: string[] = [
  // 'eitapumba@gmail.com',
]

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow static assets, images, fonts, etc
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/img') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next()
  }

  // Allow the maintenance page itself
  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  // Redirect everything else to maintenance
  const url = request.nextUrl.clone()
  url.pathname = '/maintenance'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
