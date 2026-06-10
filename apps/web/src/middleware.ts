import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth-only pages: redirect to dashboard if already have a session cookie.
// Protected pages (dashboard, builder, etc.) rely on client-side auth guards
// in each page component — middleware cannot read Firebase's IndexedDB session.
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('__session')?.value;

  // Only redirect away from auth pages if a session cookie exists
  if (AUTH_ROUTES.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register'],
};
