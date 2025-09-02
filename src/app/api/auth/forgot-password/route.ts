// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { createOTPRecord } from '@/lib/auth';
import User from '@/models/User';
import { IApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found with this email address'
      }, { status: 404 });
    }

    // For admin users, send OTP to their special email
    const otpEmail = user.role === 'admin' ? process.env.ADMIN_OTP_EMAIL : email;
    
    // Generate and send OTP
    await createOTPRecord(otpEmail!, 'password-reset');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: user.role === 'admin' 
        ? `Password reset OTP sent to ${process.env.ADMIN_OTP_EMAIL}`
        : 'Password reset OTP sent to your email',
      data: {
        otpEmail: user.role === 'admin' ? process.env.ADMIN_OTP_EMAIL : email,
        userEmail: email
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}