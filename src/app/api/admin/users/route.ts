// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { IApiResponse } from '@/types';
import { hashPassword } from '@/lib/auth';

// GET all users (for superadmin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'superadmin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const users = await User.find({}, { password: 0 });

    return NextResponse.json<IApiResponse>({
        success: true,
        data: users,
        message: ''
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST create new admin user (for superadmin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'superadmin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User already exists'
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: true // Superadmin can directly verify
    });

    // Remove password from response
    const userResponse = newUser.toObject() as Omit<typeof newUser, 'password'> & { password?: string };
    delete userResponse.password;

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'User created successfully',
      data: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}