import jwt from 'jsonwebtoken';
import { ApprovedUser } from '../types/auth';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
  clientId?: string;
}

export function generateToken(user: ApprovedUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    clientId: user.clientId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

export function generateRefreshToken(user: ApprovedUser): string {
  const payload = {
    userId: user._id,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

export function generateEmployeeId(firstName: string, lastName: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  return `EMP${initials}${timestamp}`;
}

export function generateClientId(firstName: string, lastName: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  return `CLI${initials}${timestamp}`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPExpired(expiry: Date): boolean {
  return new Date() > expiry;
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
}