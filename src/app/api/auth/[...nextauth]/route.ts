import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import User from '@/models/User';
import { ISessionUser } from '@/types';

interface ExtendedUser {
  id: string;
  name: string;
  fullname: string;
  number: string;
  email: string;
  role: 'admin' | 'client' | 'hr' | 'employee';
  employeeId?: string;
  clientId?: string;
  idAssigned: boolean;
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
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
          idAssigned: user.idAssigned
        } as ExtendedUser;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.name = extendedUser.name;
        token.fullname = extendedUser.fullname;
        token.number = extendedUser.number;
        token.email = extendedUser.email;
        token.role = extendedUser.role;
        token.employeeId = extendedUser.employeeId;
        token.clientId = extendedUser.clientId;
        token.idAssigned = extendedUser.idAssigned;
      }
      return token;
    },
    async session({ session, token }) {
      const sessionUser: ISessionUser = {
        id: token.id as string,
        name: token.name as string,
        fullname: token.fullname as string,
        number: token.number as string,
        email: token.email as string,
        role: token.role as 'admin' | 'client' | 'hr' | 'employee',
        employeeId: token.employeeId as string,
        clientId: token.clientId as string,
        idAssigned: token.idAssigned as boolean,
        accountStatus: 'pending'
      };

      session.user = sessionUser;
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
    error: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };