import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================
// MAINTENANCE MODE
// Set to true to show maintenance page for everyone
// Set to false to disable maintenance mode
// ============================================
const MAINTENANCE_MODE = true

// Secret key to bypass maintenance
// Visit: junglegames.ai?bypass=pumba2026
const BYPASS_SECRET = 'pumba2026'
const BYPASS_COOKIE = 'kk_bypass'

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next()
  }

  const { pathname, searchParams } = request.nextUrl

  // Allow static assets, images, fonts, API routes, etc
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/img') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff')
  ) {
    return NextResponse.next()
  }

  // Allow the maintenance page itself
  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  // Check if bypass param is in URL → set cookie and let through
  const bypassParam = searchParams.get('bypass')
  if (bypassParam === BYPASS_SECRET) {
    const response = NextResponse.next()
    response.cookies.set(BYPASS_COOKIE, 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    })
    return response
  }

  // Check if bypass cookie exists → let through
  const bypassCookie = request.cookies.get(BYPASS_COOKIE)
  if (bypassCookie?.value === 'true') {
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
