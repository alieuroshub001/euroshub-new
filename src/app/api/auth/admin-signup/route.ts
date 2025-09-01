import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { validateSignupRequest } from '../../../../utils/validation';
import { AdminSignupRequest, EmailNotification } from '../../../../types/auth';
import { sendEmail } from '../../../../lib/email';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../../utils/constants';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body: AdminSignupRequest = await req.json();
    
    // Validate the request
    const validation = validateSignupRequest(body);
    if (validation.errors.length > 0) {
      return NextResponse.json(
        { success: false, message: validation.errors[0], errors: validation.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Additional validation for admin role
    if (body.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'This endpoint is only for admin registration' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin already exists. Only one admin is allowed.' },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: body.email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.EMAIL_EXISTS },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Create admin user directly (no OTP verification needed)
    const adminUser = new User({
      email: body.email.toLowerCase(),
      password: body.password,
      role: 'admin',
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      isActive: true, // Admin is active by default
      isProfileComplete: false,
      approvedAt: new Date(),
      approvedBy: null, // Self-approved
    });

    await adminUser.save();

    // Send welcome email
    const emailNotification: EmailNotification = {
      to: body.email,
      subject: 'EurosHub - Admin Account Created',
      template: 'approval',
      data: {
        firstName: body.firstName,
      },
    };

    await sendEmail(emailNotification);

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully. You can now sign in.',
        user: {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          isActive: adminUser.isActive,
          isProfileComplete: adminUser.isProfileComplete,
        },
      },
      { status: HTTP_STATUS.CREATED }
    );

  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.DATABASE_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}