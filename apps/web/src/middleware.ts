import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/builder', '/settings', '/notifications', '/onboarding'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Firebase session cookie (set by the app after sign-in)
  const session = request.cookies.get('__session')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
};
