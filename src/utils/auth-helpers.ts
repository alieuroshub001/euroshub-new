import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { authOptions } from '../lib/auth';
import { UserRole } from '../types/user-roles';
import { NextRequest } from 'next/server';

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function getClientAuthSession() {
  return await getSession();
}

export function hasRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

export function isHR(userRole: string): boolean {
  return ['admin', 'hr'].includes(userRole);
}

export function isEmployee(userRole: string): boolean {
  return ['admin', 'hr', 'employee'].includes(userRole);
}

export function isClient(userRole: string): boolean {
  return ['admin', 'hr', 'client'].includes(userRole);
}

export async function requireAuth(req: NextRequest) {
  const session = await getServerAuthSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}

export async function requireRole(req: NextRequest, allowedRoles: UserRole[]) {
  const session = await requireAuth(req);
  
  if (!hasRole(session.user.role, allowedRoles)) {
    throw new Error('Insufficient permissions');
  }
  
  return session;
}

export async function requireAdmin(req: NextRequest) {
  return await requireRole(req, ['admin']);
}

export async function requireHR(req: NextRequest) {
  return await requireRole(req, ['admin', 'hr']);
}

export async function requireEmployee(req: NextRequest) {
  return await requireRole(req, ['admin', 'hr', 'employee']);
}

export async function requireClient(req: NextRequest) {
  return await requireRole(req, ['admin', 'hr', 'client']);
}

export function requireProfileComplete(session: any) {
  if (!session.user.isProfileComplete) {
    throw new Error('Profile completion required');
  }
}

export function requireActiveAccount(session: any) {
  if (!session.user.isActive) {
    throw new Error('Account is not active');
  }
}

export interface AuthContext {
  session: any;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    clientId?: string;
    isActive: boolean;
    isProfileComplete: boolean;
  };
}

export async function createAuthContext(): Promise<AuthContext | null> {
  const session = await getServerAuthSession();
  
  if (!session) {
    return null;
  }
  
  return {
    session,
    user: session.user,
  };
}

export function getUserDisplayName(user: any): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getUserIdentifier(user: any): string {
  return user.employeeId || user.clientId || user.email;
}