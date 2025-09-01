import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/admin-signup',
      '/auth/verify-otp',
      '/auth/error',
      '/api/auth/signup',
      '/api/auth/admin-signup',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp',
    ];

    // API routes that don't require authentication
    const publicApiRoutes = [
      '/api/auth/signup',
      '/api/auth/admin-signup',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp',
    ];

    // Check if the route is public
    if (publicRoutes.includes(pathname) || publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // If no token and trying to access protected route, redirect to signin
    if (!token && !pathname.startsWith('/auth/')) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Role-based access control
    if (token) {
      const userRole = token.role as string;

      // Admin-only routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        if (userRole !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // HR-only routes
      if (pathname.startsWith('/hr') || pathname.startsWith('/api/hr')) {
        if (!['admin', 'hr'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Employee-only routes
      if (pathname.startsWith('/employee') || pathname.startsWith('/api/employee')) {
        if (!['admin', 'hr', 'employee'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Client-only routes
      if (pathname.startsWith('/client') || pathname.startsWith('/api/client')) {
        if (!['admin', 'hr', 'client'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Check if profile is complete for protected routes
      if (!token.isProfileComplete && !pathname.startsWith('/profile/complete') && 
          !pathname.startsWith('/api/user/complete-profile')) {
        return NextResponse.redirect(new URL('/profile/complete', req.url));
      }

      // Check if account is active
      if (!token.isActive && !pathname.startsWith('/account/inactive')) {
        return NextResponse.redirect(new URL('/account/inactive', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes without token
        const publicRoutes = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/auth/admin-signup',
          '/auth/verify-otp',
          '/auth/error',
        ];

        const publicApiRoutes = [
          '/api/auth/signup',
          '/api/auth/admin-signup',
          '/api/auth/verify-otp',
          '/api/auth/resend-otp',
        ];

        if (publicRoutes.includes(pathname) || 
            publicApiRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};