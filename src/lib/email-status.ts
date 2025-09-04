import { sendEmail } from './email';
import { IApiResponse } from '@/types';

/**
 * Sends status update notification email to user
 */
export async function sendStatusUpdateEmail({
  email,
  fullname,
  status,
  role
}: {
  email: string;
  fullname: string;
  status: 'approved' | 'declined' | 'blocked' | 'active' | 'inactive';
  role: string;
}): Promise<IApiResponse> {
  const subject = `Account Status Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`;

  const getStatusMessage = () => {
    switch (status) {
      case 'approved':
        return {
          color: '#059669',
          bgColor: '#f0fdf4',
          message: 'Your account has been approved by the admin.',
          action: 'You can now login to your account with full access.'
        };
      case 'declined':
        return {
          color: '#dc2626',
          bgColor: '#fef2f2',
          message: 'Your account registration has been declined.',
          action: 'Please contact the admin for more information.'
        };
      case 'blocked':
        return {
          color: '#b91c1c',
          bgColor: '#fef2f2',
          message: 'Your account has been blocked by the admin.',
          action: 'Please contact the admin to resolve this issue.'
        };
      case 'active':
        return {
          color: '#059669',
          bgColor: '#f0fdf4',
          message: 'Your account has been activated.',
          action: 'You can now use your account normally.'
        };
      case 'inactive':
        return {
          color: '#d97706',
          bgColor: '#fffbeb',
          message: 'Your account has been deactivated.',
          action: 'Please contact the admin if you need to reactivate your account.'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#f9fafb',
          message: 'Your account status has been updated.',
          action: 'Please contact the admin for more information.'
        };
    }
  };

  const statusInfo = getStatusMessage();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">Account Status Update</h2>
      <p style="font-size: 16px;">Dear ${fullname},</p>
      
      <div style="background: ${statusInfo.bgColor}; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
        <h3 style="margin: 0 0 10px 0; color: ${statusInfo.color};">Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</h3>
        <p style="margin: 5px 0; color: ${statusInfo.color};">${statusInfo.message}</p>
        <p style="margin: 5px 0; color: ${statusInfo.color};">${statusInfo.action}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #333;">Account Details:</h4>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      </div>
      
      ${status === 'approved' ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Login to Your Account
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        If you have any questions, please contact the admin.
      </p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}