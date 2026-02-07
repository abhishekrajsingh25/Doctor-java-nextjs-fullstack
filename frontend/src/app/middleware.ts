import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read token from cookies
  const token = request.cookies.get('token')?.value

  // Routes that REQUIRE login
  const protectedRoutes = [
    '/my-profile',
    '/my-appointments',
    '/appointment',
  ]

  // Routes that should NOT be accessed when logged in
  const authRoutes = ['/login']

  // 🚫 Block unauthenticated access
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !token
  ) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  // 🚫 Block logged-in users from login page
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(
      new URL('/', request.url)
    )
  }

  return NextResponse.next()
}

/**
 * Apply middleware only to these routes
 */
export const config = {
  matcher: [
    '/my-profile/:path*',
    '/my-appointments/:path*',
    '/appointment/:path*',
    '/login',
  ],
}
