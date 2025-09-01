import { SignupRequest, AdminSignupRequest, SignupValidation, EUROSHUB_DOMAIN } from '../types/auth';
import { UserRole } from '../types/user-roles';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isAuthorizedDomain(email: string): boolean {
  return email.toLowerCase().includes(EUROSHUB_DOMAIN.toLowerCase());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidRole(role: string): boolean {
  const validRoles: UserRole[] = ['admin', 'hr', 'client', 'employee'];
  return validRoles.includes(role as UserRole);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
}

export function validateSignupRequest(request: SignupRequest | AdminSignupRequest): SignupValidation {
  const errors: string[] = [];
  
  const emailValid = isValidEmail(request.email);
  const domainValid = isAuthorizedDomain(request.email);
  const roleValid = isValidRole(request.role);
  
  if (!emailValid) {
    errors.push('Invalid email format');
  }
  
  if (!domainValid) {
    errors.push('Email must be from authorized domain');
  }
  
  if (!isValidPassword(request.password)) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!roleValid) {
    errors.push('Invalid role specified');
  }
  
  if (!isValidName(request.firstName)) {
    errors.push('First name must be at least 2 characters and contain only letters');
  }
  
  if (!isValidName(request.lastName)) {
    errors.push('Last name must be at least 2 characters and contain only letters');
  }
  
  if (request.phone && !isValidPhone(request.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValidEmail: emailValid,
    isAuthorizedDomain: domainValid,
    isValidRole: roleValid,
    errors,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

export function isValidEmployeeId(employeeId: string): boolean {
  return /^EMP[A-Z]{2}\d{6}$/.test(employeeId);
}

export function isValidClientId(clientId: string): boolean {
  return /^CLI[A-Z]{2}\d{6}$/.test(clientId);
}