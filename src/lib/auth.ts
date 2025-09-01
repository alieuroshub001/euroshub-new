import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import PendingUser from '../models/PendingUser';
import dbConnect from './db';
import { ApprovedUser } from '../types/auth';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

declare module 'next-auth' {
  interface Session {
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

  interface User {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    clientId?: string;
    isActive: boolean;
    isProfileComplete: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    clientId?: string;
    isActive: boolean;
    isProfileComplete: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            throw new Error('Invalid credentials');
          }

          if (!user.isActive) {
            throw new Error('Account is not active. Please contact support.');
          }

          const isPasswordValid = await user.comparePassword(credentials.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            employeeId: user.employeeId,
            clientId: user.clientId,
            isActive: user.isActive,
            isProfileComplete: user.isProfileComplete,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.employeeId = user.employeeId;
        token.clientId = user.clientId;
        token.isActive = user.isActive;
        token.isProfileComplete = user.isProfileComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.employeeId = token.employeeId;
        session.user.clientId = token.clientId;
        session.user.isActive = token.isActive;
        session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User ${user.email} signed in. New user: ${isNewUser}`);
    },
    async signOut({ session }) {
      console.log(`User ${session?.user?.email} signed out`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getUserByEmail(email: string): Promise<ApprovedUser | null> {
  try {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? user.toObject() : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<ApprovedUser | null> {
  try {
    await dbConnect();
    const user = await User.findById(id);
    return user ? user.toObject() : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, profileData: any): Promise<boolean> {
  try {
    await dbConnect();
    await User.findByIdAndUpdate(userId, {
      ...profileData,
      isProfileComplete: true,
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}