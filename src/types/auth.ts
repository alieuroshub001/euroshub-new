import { UserRole } from './user-roles';

export interface SignupRequest {
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AdminSignupRequest {
  email: string;
  password: string;
  role: 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  tempToken?: string;
}

export interface PendingUser {
  _id: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
  firstName: string;
  lastName: string;
  phone?: string;
  otpCode: string;
  otpExpiry: Date;
  isOtpVerified: boolean;
  status: 'pending' | 'approved' | 'declined' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovedUser {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  clientId?: string;
  isActive: boolean;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface AdminApprovalRequest {
  userId: string;
  action: 'approve' | 'decline' | 'block';
  employeeId?: string;
  clientId?: string;
}

export interface AdminApprovalResponse {
  success: boolean;
  message: string;
  user?: ApprovedUser;
}

export interface ProfileCompletionRequest {
  userId: string;
  profileData: {
    dateOfBirth?: Date;
    address?: string;
    department?: string;
    position?: string;
    startDate?: Date;
    emergencyContact?: string;
    skills?: string[];
    bio?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: ApprovedUser;
  refreshToken?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  template: 'otp' | 'approval' | 'rejection' | 'credentials';
  data: {
    firstName?: string;
    otpCode?: string;
    employeeId?: string;
    clientId?: string;
    reason?: string;
  };
}

export interface SignupValidation {
  isValidEmail: boolean;
  isAuthorizedDomain: boolean;
  isValidRole: boolean;
  errors: string[];
}

export const EUROSHUB_DOMAIN = 'euroshub@gmail.com';

export const OTP_EXPIRY_MINUTES = 10;

export const JWT_EXPIRES_IN = '24h';

export const REFRESH_TOKEN_EXPIRES_IN = '7d';