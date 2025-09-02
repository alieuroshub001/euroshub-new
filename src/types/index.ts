// types/index.ts
// Update your types/index.ts
export interface IUser {
  _id?: string; // MongoDB ObjectId
  id: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  role: 'admin' | 'client' | 'hr' | 'employee';
  emailVerified: boolean;
  verificationToken?: string;
  employeeId?: string; // For hr and employee roles - assigned by admin
  clientId?: string; // For client role - assigned by admin
  otpEmail?: string; // Admin's special email for OTP
  idAssigned: boolean; // Whether admin has assigned ID to user
  idAssignedAt?: Date; // When ID was assigned
  accountStatus: 'pending' | 'approved' | 'declined' | 'blocked';
  statusUpdatedBy?: string;
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithPassword extends IUser {
  password: string;
  confirmPassword: string;
}

// Auth session types
export interface ISessionUser {
  id: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  role: 'admin' | 'client' | 'hr' | 'employee';
  employeeId?: string;
  clientId?: string;
  otpEmail?: string;
  idAssigned: boolean;
  accountStatus: 'pending' | 'approved' | 'declined' | 'blocked';
}

export interface ISession {
  user: ISessionUser;
  expires: string;
}

// OTP and password reset types
export interface IOTP {
  id: string;
  email: string;
  otp: string;
  type: 'verification' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}

export interface IPasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ID Assignment types
export interface IIdAssignmentRequest {
  userId: string;
  employeeId?: string;
  clientId?: string;
}

export interface IIdAssignmentResponse {
  userId: string;
  assignedId: string;
  idType: 'employee' | 'client';
  emailSent: boolean;
}

// User Management types
export interface IUserStatusUpdateRequest {
  userId: string;
  status: 'approved' | 'declined' | 'blocked';
  employeeId?: string;
  clientId?: string;
}

export interface IUserManagementFilters {
  role?: 'client' | 'hr' | 'employee';
  status?: 'pending' | 'approved' | 'declined' | 'blocked';
  search?: string;
}

// API response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}