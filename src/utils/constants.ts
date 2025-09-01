export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    ADMIN_SIGNUP: '/api/auth/admin-signup',
    LOGIN: '/api/auth/login',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  ADMIN: {
    APPROVE_USER: '/api/admin/approve-user',
    PENDING_USERS: '/api/admin/pending-users',
    ALL_USERS: '/api/admin/users',
  },
  USER: {
    PROFILE: '/api/user/profile',
    COMPLETE_PROFILE: '/api/user/complete-profile',
    UPDATE_PROFILE: '/api/user/update-profile',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  CLIENT: 'client',
  EMPLOYEE: 'employee',
} as const;

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  BLOCKED: 'blocked',
} as const;

export const EMAIL_TEMPLATES = {
  OTP: 'otp',
  APPROVAL: 'approval',
  REJECTION: 'rejection',
  CREDENTIALS: 'credentials',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  UNAUTHORIZED_DOMAIN: 'Email must be from authorized domain',
  WEAK_PASSWORD: 'Password must be at least 6 characters long',
  INVALID_ROLE: 'Invalid role specified',
  INVALID_NAME: 'Name must be at least 2 characters and contain only letters',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_OTP: 'Invalid OTP format',
  OTP_EXPIRED: 'OTP has expired',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  EMAIL_SEND_FAILED: 'Failed to send email',
  DATABASE_ERROR: 'Database operation failed',
  PROFILE_INCOMPLETE: 'Profile is not complete',
  ACCOUNT_INACTIVE: 'Account is not active',
  OTP_NOT_VERIFIED: 'OTP verification required',
} as const;

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Signup successful. Please verify your email.',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  USER_APPROVED: 'User approved successfully',
  USER_DECLINED: 'User declined successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_COMPLETED: 'Profile completed successfully',
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  NAME_MIN_LENGTH: 2,
  PHONE_MIN_LENGTH: 10,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const EUROSHUB_CONFIG = {
  DOMAIN: 'euroshub@gmail.com',
  APP_NAME: 'EurosHub',
  SUPPORT_EMAIL: 'support@euroshub.com',
  DEFAULT_TIMEZONE: 'UTC',
} as const;