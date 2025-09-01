export type UserRole = 'admin' | 'hr' | 'client' | 'employee';

export interface User {
  id: string;
  role: UserRole;
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface HRUser extends User {
  role: 'hr';
}

export interface ClientUser extends User {
  role: 'client';
}

export interface EmployeeUser extends User {
  role: 'employee';
}

export type RoleBasedUser = AdminUser | HRUser | ClientUser | EmployeeUser;