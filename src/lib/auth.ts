// lib/auth.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IOTP } from '@/types';
import { sendOTPEmail } from './email';
import NextAuth, { SessionStrategy, User as NextAuthUser, Session, Account, Profile } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import connectToDatabase from './db';

// Extended user type for NextAuth
interface ExtendedUser extends NextAuthUser {
  id: string;
  role: string;
  fullname?: string;
  number?: string;
  employeeId?: string;
  clientId?: string;
  idAssigned?: boolean;
  accountStatus?: string;
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      fullname?: string | null;
      number?: string | null;
      email?: string | null;
      role: string;
      employeeId?: string | null;
      clientId?: string | null;
      idAssigned?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string;
    role: string;
    fullname?: string;
    number?: string;
    employeeId?: string;
    clientId?: string;
    idAssigned?: boolean;
    accountStatus?: string;
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// OTP utilities
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function createOTPRecord(
  email: string,
  type: IOTP['type']
): Promise<string> {
  const OTP = (await import('@/models/OTP')).default;
  const otp = generateOTP();
 
  await OTP.findOneAndUpdate(
    { email, type },
    { otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    { upsert: true, new: true }
  );
  // Send OTP via email
  await sendOTPEmail(email, otp, type);
 
  return otp;
}

export async function verifyOTP(
  email: string,
  otp: string,
  type: IOTP['type']
): Promise<boolean> {
  const OTP = (await import('@/models/OTP')).default;
  const record = await OTP.findOne({ email, otp, type });
 
  if (!record || record.expiresAt < new Date()) {
    return false;
  }
 
  await OTP.deleteOne({ id: record.id });
  return true;
}

// Token utilities
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

interface JwtCallbackParams {
  token: JWT;
  user?: NextAuthUser | AdapterUser;
  account?: Account | null;
  profile?: Profile;
  trigger?: "signIn" | "signUp" | "update";
  isNewUser?: boolean;
  session?: Session;
}

// NextAuth Configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        await connectToDatabase();
       
        const user = await User.findOne({ email: credentials?.email }).select('+password');
        if (!user) throw new Error('No user found with this email');
       
        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }

        // Check account status
        if (user.accountStatus === 'pending') {
          throw new Error('Your account is pending approval by the admin');
        }
        if (user.accountStatus === 'declined') {
          throw new Error('Your account has been declined by the admin');
        }
        if (user.accountStatus === 'blocked') {
          throw new Error('Your account has been blocked. Please contact the admin');
        }

        // Check if non-admin users have assigned IDs
        if (user.role !== 'admin' && !user.idAssigned) {
          throw new Error('Please wait for admin to assign your ID before logging in');
        }
       
        const isValid = await verifyPassword(
          credentials?.password || '',
          user.password
        );
        if (!isValid) throw new Error('Incorrect password');
       
        return {
          id: user._id.toString(),
          name: user.name,
          fullname: user.fullname,
          number: user.number,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          clientId: user.clientId,
          idAssigned: user.idAssigned,
          accountStatus: user.accountStatus
        };
      }
    })
  ],
  callbacks: {
    async jwt(params: JwtCallbackParams) {
      const { token, user } = params;
      if (user && 'role' in user) {
        const extUser = user as ExtendedUser;
        token.id = extUser.id;
        token.name = extUser.name;
        token.role = extUser.role;
        token.fullname = extUser.fullname;
        token.number = extUser.number;
        token.employeeId = extUser.employeeId;
        token.clientId = extUser.clientId;
        token.idAssigned = extUser.idAssigned;
        token.accountStatus = extUser.accountStatus;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.fullname = token.fullname;
        session.user.number = token.number;
        session.user.employeeId = token.employeeId;
        session.user.clientId = token.clientId;
        session.user.idAssigned = token.idAssigned;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    verifyRequest: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

// Export the NextAuth handler
export default NextAuth(authOptions);