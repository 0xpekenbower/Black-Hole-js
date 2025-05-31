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
export async function middleware(request: NextRequest) {
  // Simply pass through requests now that logger is removed
  return NextResponse.next();
}

// Configure middleware to run on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
