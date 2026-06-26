import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isDashboardRoute = pathname.includes('/dashboard');
  const isProfileSetupRoute = pathname.includes('/profile-setup');
  const isProtectedRoute = isDashboardRoute || isProfileSetupRoute;

  // Protect dashboard and profile-setup — both require a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const res = intlMiddleware(req);
  if (res) {
    res.headers.set('x-proxy-executed', 'true');
  }
  return res;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
