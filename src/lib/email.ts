// lib/email.ts
import nodemailer from 'nodemailer';
import { IApiResponse } from '@/types';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Add this to your email.ts file
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<IApiResponse> {
  const subject = 'Email Verification';
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p style="font-size: 16px;">Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}
/**
 * Sends an email using the configured transporter
 */

export async function sendEmail(options: EmailOptions): Promise<IApiResponse> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      ...options,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sends OTP email for verification or password reset
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  type: 'verification' | 'password-reset'
): Promise<IApiResponse> {
  const subject =
    type === 'verification'
      ? 'Email Verification OTP'
      : 'Password Reset OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="font-size: 16px;">Your OTP code is:</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 2px;">
        <strong>${otp}</strong>
      </div>
      <p style="font-size: 14px; color: #666;">
        This OTP is valid for 15 minutes. Please do not share it with anyone.
      </p>
      ${
        type === 'password-reset'
          ? '<p style="font-size: 14px; color: #666;">If you didn\'t request this password reset, please ignore this email.</p>'
          : ''
      }
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Sends ID assignment notification email to user
 */
export async function sendIdAssignmentEmail({
  email,
  fullname,
  assignedId,
  idType,
  role
}: {
  email: string;
  fullname: string;
  assignedId: string;
  idType: 'employee' | 'client';
  role: string;
}): Promise<IApiResponse> {
  const subject = `Your ${idType === 'employee' ? 'Employee' : 'Client'} ID Assignment`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">ID Assignment Notification</h2>
      <p style="font-size: 16px;">Dear ${fullname},</p>
      <p style="font-size: 16px;">Your ${idType === 'employee' ? 'Employee' : 'Client'} ID has been assigned by the admin.</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Your Details:</h3>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p style="margin: 5px 0;"><strong>${idType === 'employee' ? 'Employee' : 'Client'} ID:</strong> ${assignedId}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      </div>
      
      <p style="font-size: 16px;">You can now login to your account with full access.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Login to Your Account
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        If you have any questions, please contact the admin.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Sends new user signup notification email to admin users
 */
export async function sendNewSignupNotificationToAdmin({
  userFullname,
  userEmail,
  userRole,
  userNumber,
  signupDate
}: {
  userFullname: string;
  userEmail: string;
  userRole: string;
  userNumber: string;
  signupDate: Date;
}): Promise<IApiResponse> {
  try {
    const subject = `New User Signup - ${userRole.toUpperCase()} | ${userFullname}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New User Signup Alert</h2>
        <p style="font-size: 16px;">A new user has signed up and is waiting for your approval.</p>
        
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin: 0 0 15px 0; color: #333;">User Details:</h3>
          <p style="margin: 8px 0;"><strong>Full Name:</strong> ${userFullname}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${userNumber}</p>
          <p style="margin: 8px 0;"><strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          <p style="margin: 8px 0;"><strong>Signup Date:</strong> ${signupDate.toLocaleString()}</p>
          <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Approval</span></p>
        </div>
        
        <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Action Required:</strong> Please review and approve/decline this user in the admin dashboard.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/users" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Review User Signup
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; border-top: 1px solid #e5e5e5; padding-top: 15px; margin-top: 30px;">
          This is an automated notification from Euroshub CRM System. Please do not reply to this email.
        </p>
      </div>
    `;

    // Import User model and connect to database
    const connectToDatabase = (await import('@/lib/db')).default;
    await connectToDatabase();
    const User = (await import('@/models/User')).default;
    const adminUsers = await User.find({ role: 'admin' }).select('email');

    // Send email to all admin users
    const emailPromises = adminUsers.map(admin => 
      sendEmail({
        to: admin.email,
        subject,
        html,
      })
    );

    // If no admin users found, send to default admin email
    if (adminUsers.length === 0 && process.env.ADMIN_OTP_EMAIL) {
      emailPromises.push(sendEmail({
        to: process.env.ADMIN_OTP_EMAIL!,
        subject,
        html,
      }));
    }

    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Notification sent to ${adminUsers.length || 1} admin(s)`
    };
  } catch (error) {
    console.error('Admin notification email error:', error);
    return {
      success: false,
      message: 'Failed to send admin notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}