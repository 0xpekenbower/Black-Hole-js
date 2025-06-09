/**
 * Next.js middleware
 * Applies middleware functions to all requests
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware handler for Next.js requests
 * @param {NextRequest} request - The incoming request
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  
  requestHeaders.set('x-pathname', request.nextUrl.pathname);  
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
