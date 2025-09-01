import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import PendingUser from '../../../../models/PendingUser';
import { isValidOTP } from '../../../../utils/validation';
import { OTPVerificationRequest } from '../../../../types/auth';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../../utils/constants';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body: OTPVerificationRequest = await req.json();
    
    // Validate input
    if (!body.email || !body.otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!isValidOTP(body.otp)) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.INVALID_OTP },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ 
      email: body.email.toLowerCase() 
    });

    if (!pendingUser) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if OTP is already verified
    if (pendingUser.isOtpVerified) {
      return NextResponse.json(
        { success: false, message: 'OTP already verified. Waiting for admin approval.' },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Check if OTP has expired
    if (pendingUser.isOTPExpired()) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.OTP_EXPIRED },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify OTP
    if (pendingUser.otpCode !== body.otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Mark OTP as verified
    pendingUser.isOtpVerified = true;
    await pendingUser.save();

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.OTP_VERIFIED,
        data: {
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          role: pendingUser.role,
          status: pendingUser.status,
        },
      },
      { status: HTTP_STATUS.OK }
    );

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.DATABASE_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}