import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import PendingUser from '../../../../models/PendingUser';
import { validateSignupRequest } from '../../../../utils/validation';
import { generateOTP, getOTPExpiry } from '../../../../utils/auth';
import { sendEmail } from '../../../../lib/email';
import { SignupRequest, EmailNotification } from '../../../../types/auth';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../../utils/constants';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body: SignupRequest = await req.json();
    
    // Validate the request
    const validation = validateSignupRequest(body);
    if (validation.errors.length > 0) {
      return NextResponse.json(
        { success: false, message: validation.errors[0], errors: validation.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user already exists in PendingUser or User
    const existingPendingUser = await PendingUser.findOne({ 
      email: body.email.toLowerCase() 
    });

    if (existingPendingUser) {
      if (existingPendingUser.isOtpVerified && existingPendingUser.status === 'pending') {
        return NextResponse.json(
          { success: false, message: 'Registration already submitted. Waiting for admin approval.' },
          { status: HTTP_STATUS.CONFLICT }
        );
      }
      
      // If OTP not verified, allow re-registration
      await PendingUser.findByIdAndDelete(existingPendingUser._id);
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create pending user
    const pendingUser = new PendingUser({
      email: body.email.toLowerCase(),
      password: body.password,
      role: body.role,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      otpCode,
      otpExpiry,
      isOtpVerified: false,
      status: 'pending',
    });

    await pendingUser.save();

    // Send OTP email
    const emailNotification: EmailNotification = {
      to: body.email,
      subject: 'EurosHub - Email Verification Code',
      template: 'otp',
      data: {
        firstName: body.firstName,
        otpCode,
      },
    };

    const emailSent = await sendEmail(emailNotification);
    
    if (!emailSent) {
      // If email failed, delete the pending user
      await PendingUser.findByIdAndDelete(pendingUser._id);
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.EMAIL_SEND_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
        tempUserId: pendingUser._id,
      },
      { status: HTTP_STATUS.CREATED }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.DATABASE_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}