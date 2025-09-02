// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/verify-otp'];
const protectedRoutes = ['/admin', '/client', '/hr', '/employee', '/dashboard', '/api/admin', '/api/user'];
const roleRoutes = {
  admin: ['/admin'],
  client: ['/client'],
  hr: ['/hr'],
  employee: ['/employee']
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Skip middleware for public API routes and auth API routes
  if (path.startsWith('/api') && !path.startsWith('/api/admin') && !path.startsWith('/api/user')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirect authenticated users away from auth routes to their role dashboard
  if (isAuthRoute && token) {
    const userRole = token.role as string;
    if (userRole && ['admin', 'client', 'hr', 'employee'].includes(userRole)) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (token && token.role) {
    const userRole = token.role as string;
    
    // Check if user is accessing a role-specific route
    for (const [role, routes] of Object.entries(roleRoutes)) {
      if (routes.some(route => path.startsWith(route))) {
        if (userRole !== role) {
          // Redirect to user's correct dashboard
          return NextResponse.redirect(new URL(`/${userRole}`, request.url));
        }
      }
    }
    
    // Redirect /dashboard to role-specific dashboard
    if (path === '/dashboard') {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/hr/:path*',
    '/employee/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/verify-otp'
  ],
};