import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes don't use locale prefix - redirect /:locale/admin to /admin
  const localesPattern = routing.locales.join('|');
  const adminMatch = pathname.match(new RegExp(`^\/(${localesPattern})(\/admin.*)$`));
  if (adminMatch) {
    return NextResponse.redirect(new URL(adminMatch[2], request.url));
  }

  // Admin routes require ADMIN role (handles /admin but not /:locale/admin after redirect above)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'ADMIN') {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // All other routes go through i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|auth/.*|.*\\..*).*)'],
};
