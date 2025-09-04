// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { createOTPRecord, hashPassword } from '@/lib/auth';
import User from '@/models/User';
import { IApiResponse } from '@/types';
import { sendNewSignupNotificationToAdmin, sendNewSignupNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, fullname, number, email, password, role } = await request.json();

    // Validate input
    if (!name || !fullname || !number || !email || !password || !role) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'client', 'hr', 'employee'].includes(role)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Invalid role'
      }, { status: 400 });
    }

    // Validate email format for hr and employee roles
    if ((role === 'hr' || role === 'employee') && !/\S+euroshub@gmail\.com$/.test(email)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'HR and Employee must use euroshub email format (e.g., name.euroshub@gmail.com)'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User already exists'
      }, { status: 400 });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      fullname,
      number,
      email,
      password: hashedPassword,
      role,
      emailVerified: false,
      idAssigned: false
    });

    // Determine OTP email - for admin use ADMIN_OTP_EMAIL, for others use their email
    const otpEmail = role === 'admin' ? process.env.ADMIN_OTP_EMAIL : email;
    
    // Generate and send OTP
    await createOTPRecord(otpEmail!, 'verification');

    // Send welcome email to user (except admin)
    if (role !== 'admin') {
      try {
        await sendNewSignupNotification(email, fullname);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail signup if welcome email fails
      }
    }

    // Send notification to admin for non-admin user signups
    if (role !== 'admin') {
      try {
        await sendNewSignupNotificationToAdmin({
          userFullname: fullname,
          userEmail: email,
          userRole: role,
          userNumber: number,
          signupDate: new Date()
        });
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't fail signup if admin email fails
      }
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      message: role === 'admin' 
        ? `Admin user created. Please check ${process.env.ADMIN_OTP_EMAIL} for verification OTP.`
        : 'User created. Please check your email for verification OTP. Admin will assign your ID shortly.',
      data: { 
        userId: newUser._id,
        requiresIdAssignment: role !== 'admin',
        adminOtpEmail: role === 'admin' ? process.env.ADMIN_OTP_EMAIL : undefined
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}