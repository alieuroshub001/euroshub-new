export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IIdAssignmentRequest {
  userId: string;
  assignedId?: string;
  employeeId?: string;
  clientId?: string;
}

export interface IIdAssignmentResponse {
  userId: string;
  assignedId: string;
  email?: string;
  name?: string;
  idType?: string;
  emailSent?: boolean;
}

export interface IOTP {
  email: string;
  otp: string;
  type: 'verification' | 'password-reset';
  expiresAt: Date;
  isUsed: boolean;
}

export interface IUserStatusUpdateRequest {
  userId: string;
  status: 'active' | 'inactive' | 'blocked' | 'approved' | 'declined';
  employeeId?: string;
  clientId?: string;
}

export interface IUserWithPassword {
  _id?: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  password: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
  employeeId?: string;
  clientId?: string;
  idAssigned?: boolean;
  isVerified?: boolean;
  emailVerified?: boolean;
  verificationToken?: string;
  status?: 'active' | 'inactive' | 'blocked' | 'approved' | 'declined' | 'pending';
  accountStatus?: 'active' | 'inactive' | 'blocked' | 'approved' | 'declined' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
  save?: () => Promise<unknown>;
}

export interface ISessionUser {
  id: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
  employeeId?: string;
  clientId?: string;
  idAssigned?: boolean;
  accountStatus?: string;
}

export interface IUser {
  _id: string;
  id: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
  employeeId?: string;
  clientId?: string;
  idAssigned?: boolean;
  isVerified?: boolean;
  emailVerified?: boolean;
  status?: string;
  accountStatus: string;
  statusUpdatedBy?: string;
  statusUpdatedByName?: string;
  statusUpdatedAt?: Date;
  statusHistory?: Array<{
    status: string;
    updatedBy: string;
    updatedByName: string;
    updatedAt: Date;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserManagementFilters {
  search?: string;
  role?: string;
  status?: string;
  idAssigned?: string;
}
