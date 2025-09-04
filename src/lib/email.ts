import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export async function sendIdAssignmentEmail(params: {
  email: string;
  fullname: string;
  assignedId: string;
  idType: string;
  role: string;
}) {
  try {
    const transporter = createTransporter();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Account Approved & ID Assigned</h2>
        <p style="font-size: 16px;">Dear ${params.fullname},</p>
        
        <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">Congratulations! Your account has been approved.</h3>
          <p style="margin: 5px 0; color: #059669;">Your ${params.idType} ID has been assigned: <strong>${params.assignedId}</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Account Details:</h4>
          <p style="margin: 5px 0;"><strong>Role:</strong> ${params.role.charAt(0).toUpperCase() + params.role.slice(1)}</p>
          <p style="margin: 5px 0;"><strong>${params.idType.charAt(0).toUpperCase() + params.idType.slice(1)} ID:</strong> ${params.assignedId}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${params.email}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Login to Your Account
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Welcome to Euroshub! If you have any questions, please contact the admin.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: params.email,
      subject: `Account Approved - ${params.idType.toUpperCase()} ID: ${params.assignedId}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending ID assignment email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendOTPEmail(email: string, otp: string, type: 'verification' | 'password-reset') {
  try {
    const transporter = createTransporter();
    
    const subject = type === 'verification' ? 'Email Verification OTP' : 'Password Reset OTP';
    const purpose = type === 'verification' ? 'verify your email address' : 'reset your password';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">${subject}</h2>
        <p style="font-size: 16px;">Hello,</p>
        
        <p style="font-size: 16px;">You have requested to ${purpose}. Please use the following OTP:</p>
        
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
          <h2 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Best regards,<br>
          Euroshub Team
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p style="font-size: 16px;">Hello,</p>
        
        <p style="font-size: 16px;">Thank you for signing up! Please click the button below to verify your email address:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Verify Email
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
          ${verificationUrl}
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Euroshub',
      html,
    });

    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendEmail(to: string, subject: string, html?: string) {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: html || `<p>${subject}</p>`,
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendNewSignupNotification(email: string, name: string) {
  try {
    const transporter = createTransporter();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Welcome to Euroshub!</h2>
        <p style="font-size: 16px;">Dear ${name},</p>
        
        <p style="font-size: 16px;">Thank you for signing up! Your account has been created successfully and is pending admin approval.</p>
        
        <div style="background: #fffbeb; padding: 20px; margin: 20px 0; border-left: 4px solid #d97706;">
          <p style="margin: 5px 0; color: #d97706;">Your account is currently under review. You will receive an email notification once the admin approves your account.</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Welcome to the Euroshub family!<br>
          The Euroshub Team
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Euroshub - Account Created',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending signup notification:', error);
    return { success: false };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const transporter = createTransporter();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px;">Hello,</p>
        
        <p style="font-size: 16px;">You have requested to reset your password. An OTP will be sent to you shortly.</p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - Euroshub',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false };
  }
}

export async function sendNewSignupNotificationToAdmin(params: {
  userEmail: string;
  userFullname: string;
  userRole: string;
  userNumber?: string;
  signupDate?: Date;
}) {
  try {
    const transporter = createTransporter();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">New User Registration</h2>
        <p style="font-size: 16px;">Hello Admin,</p>
        
        <p style="font-size: 16px;">A new user has registered and is pending approval:</p>
        
        <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">User Details:</h4>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${params.userFullname}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${params.userEmail}</p>
          <p style="margin: 5px 0;"><strong>Role:</strong> ${params.userRole.charAt(0).toUpperCase() + params.userRole.slice(1)}</p>
          ${params.userNumber ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${params.userNumber}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${params.signupDate ? new Date(params.signupDate).toLocaleString() : 'Just now'}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/users" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Review User Registration
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Please log in to the admin panel to approve or decline this registration.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_OTP_EMAIL,
      subject: `New User Registration - ${params.userFullname}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false };
  }
}

export async function sendStatusUpdateEmail(params: {
  email: string;
  fullname: string;
  status: string;
  role: string;
}) {
  console.log(`Sending status update email to ${params.email}: ${params.status}`);
  return { success: true };
}
