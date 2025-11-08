import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isAuthenticatedRequest } from 'next-jwt-auth'

const publicRoutes = ['/', '/login', '/signup', '/test-image']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = publicRoutes.includes(pathname)
  const isAuthenticated = isAuthenticatedRequest(request)

  // Allow public routes
  if (isPublic) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // All authenticated routes are allowed
  // Role-specific redirects are handled in the page components
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico).*)',
  ],
}

