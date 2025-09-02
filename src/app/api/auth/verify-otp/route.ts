import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { verifyOTP, hashPassword } from '@/lib/auth';
import User from '@/models/User';
import { IApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, otp, type, newPassword, userEmail } = await request.json();

    // Verify OTP first for both flows
    const isValid = await verifyOTP(email, otp, type);
    if (!isValid) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Invalid or expired OTP'
      }, { status: 400 });
    }

    if (type === 'verification') {
      // For admin users, email is the OTP email, but we need to find user by their actual email
      const findByEmail = userEmail || email;
      
      // Handle email verification
      const user = await User.findOneAndUpdate(
        { email: findByEmail },
        { emailVerified: true },
        { new: true }
      );
      
      if (!user) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      const message = user.role === 'admin' 
        ? 'Email verified successfully. You can now login.'
        : 'Email verified successfully. You can login once admin assigns your ID.';
      
      return NextResponse.json<IApiResponse>({
        success: true,
        message,
        data: { 
          requiresIdAssignment: user.role !== 'admin' && !user.idAssigned 
        }
      });
    } 
    else if (type === 'password-reset' && newPassword) {
      // For admin users, email is the OTP email, but we need to find user by their actual email
      const findByEmail = userEmail || email;
      
      // Handle password reset
      const hashedPassword = await hashPassword(newPassword);
      const user = await User.findOneAndUpdate(
        { email: findByEmail },
        { password: hashedPassword }
      );
      
      if (!user) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });
    }
    else {
      // For password reset flow when just verifying OTP without password yet
      return NextResponse.json<IApiResponse>({
        success: true,
        message: 'OTP verified successfully. Please set your new password.'
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}