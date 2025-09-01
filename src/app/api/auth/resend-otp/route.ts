import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import PendingUser from '../../../../models/PendingUser';
import { generateOTP, getOTPExpiry } from '../../../../utils/auth';
import { sendEmail } from '../../../../lib/email';
import { EmailNotification } from '../../../../types/auth';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../../utils/constants';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ 
      email: email.toLowerCase() 
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

    // Check rate limiting (optional - prevent spam)
    const timeSinceLastOtp = new Date().getTime() - new Date(pendingUser.updatedAt).getTime();
    const minWaitTime = 60 * 1000; // 1 minute

    if (timeSinceLastOtp < minWaitTime) {
      const remainingTime = Math.ceil((minWaitTime - timeSinceLastOtp) / 1000);
      return NextResponse.json(
        { success: false, message: `Please wait ${remainingTime} seconds before requesting another OTP` },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS }
      );
    }

    // Generate new OTP
    const newOtpCode = generateOTP();
    const newOtpExpiry = getOTPExpiry();

    // Update pending user with new OTP
    pendingUser.otpCode = newOtpCode;
    pendingUser.otpExpiry = newOtpExpiry;
    await pendingUser.save();

    // Send new OTP email
    const emailNotification: EmailNotification = {
      to: email,
      subject: 'EurosHub - New Verification Code',
      template: 'otp',
      data: {
        firstName: pendingUser.firstName,
        otpCode: newOtpCode,
      },
    };

    const emailSent = await sendEmail(emailNotification);
    
    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.EMAIL_SEND_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.OTP_SENT,
      },
      { status: HTTP_STATUS.OK }
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.DATABASE_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}