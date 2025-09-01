import nodemailer from 'nodemailer';
import { EmailNotification } from '../types/auth';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailTemplates = {
  otp: {
    subject: 'EurosHub - Email Verification Code',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${data.firstName},</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">
          ${data.otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>EurosHub Team</p>
      </div>
    `,
  },
  approval: {
    subject: 'EurosHub - Account Approved',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Account Approved</h2>
        <p>Hello ${data.firstName},</p>
        <p>Congratulations! Your EurosHub account has been approved.</p>
        ${data.employeeId ? `<p><strong>Employee ID:</strong> ${data.employeeId}</p>` : ''}
        ${data.clientId ? `<p><strong>Client ID:</strong> ${data.clientId}</p>` : ''}
        <p>You can now log in to your account and complete your profile.</p>
        <p>Best regards,<br>EurosHub Team</p>
      </div>
    `,
  },
  rejection: {
    subject: 'EurosHub - Account Application Update',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Application Update</h2>
        <p>Hello ${data.firstName},</p>
        <p>We regret to inform you that your EurosHub account application has been declined.</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>EurosHub Team</p>
      </div>
    `,
  },
  credentials: {
    subject: 'EurosHub - Your Login Credentials',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Login Credentials</h2>
        <p>Hello ${data.firstName},</p>
        <p>Your EurosHub account credentials:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${data.employeeId ? `<p><strong>Employee ID:</strong> ${data.employeeId}</p>` : ''}
          ${data.clientId ? `<p><strong>Client ID:</strong> ${data.clientId}</p>` : ''}
          <p><strong>Email:</strong> Your registered email</p>
        </div>
        <p>Please keep this information secure and do not share it with anyone.</p>
        <p>Best regards,<br>EurosHub Team</p>
      </div>
    `,
  },
};

export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  try {
    const template = emailTemplates[notification.template];
    if (!template) {
      throw new Error(`Email template '${notification.template}' not found`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to: notification.to,
      subject: notification.subject || template.subject,
      html: template.html(notification.data),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${notification.to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration is invalid:', error);
    return false;
  }
}