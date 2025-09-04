import nodemailer from 'nodemailer';
import { IApiResponse } from '@/types';

// Create reusable transporter (same as existing email.ts)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generic email sender for project management
async function sendProjectEmail(to: string, subject: string, html: string): Promise<IApiResponse> {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending project email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Task Assignment Notification
export async function sendTaskAssignmentEmail(params: {
  assigneeEmail: string;
  assigneeName: string;
  taskTitle: string;
  taskDescription?: string;
  projectName: string;
  boardName: string;
  assignedBy: string;
  dueDate?: Date;
  priority: string;
  taskUrl?: string;
}): Promise<IApiResponse> {
  const subject = `New Task Assigned: ${params.taskTitle}`;
  
  const priorityColors = {
    low: { color: '#059669', bgColor: '#f0fdf4' },
    medium: { color: '#d97706', bgColor: '#fffbeb' },
    high: { color: '#dc2626', bgColor: '#fef2f2' },
    critical: { color: '#b91c1c', bgColor: '#fef2f2' }
  };
  
  const priorityColor = priorityColors[params.priority as keyof typeof priorityColors] || priorityColors.medium;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">🎯 New Task Assigned</h2>
      <p style="font-size: 16px;">Hello ${params.assigneeName},</p>
      
      <p style="font-size: 16px;">You have been assigned a new task by <strong>${params.assignedBy}</strong>:</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
        <h3 style="margin: 0 0 10px 0; color: #2563eb;">${params.taskTitle}</h3>
        ${params.taskDescription ? `<p style="margin: 10px 0; color: #666; font-size: 14px;">${params.taskDescription}</p>` : ''}
        
        <div style="margin-top: 15px;">
          <p style="margin: 5px 0;"><strong>Project:</strong> ${params.projectName}</p>
          <p style="margin: 5px 0;"><strong>Board:</strong> ${params.boardName}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> 
            <span style="background: ${priorityColor.bgColor}; color: ${priorityColor.color}; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${params.priority.toUpperCase()}
            </span>
          </p>
          ${params.dueDate ? `<p style="margin: 5px 0;"><strong>Due Date:</strong> ${params.dueDate.toLocaleDateString()}</p>` : ''}
        </div>
      </div>
      
      ${params.taskUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.taskUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            View Task Details
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This is an automated notification from your project management system.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.assigneeEmail, subject, html);
}

// Task Due Date Reminder
export async function sendTaskDueReminderEmail(params: {
  assigneeEmail: string;
  assigneeName: string;
  taskTitle: string;
  projectName: string;
  dueDate: Date;
  hoursUntilDue: number;
  taskUrl?: string;
}): Promise<IApiResponse> {
  const isOverdue = params.hoursUntilDue < 0;
  const subject = isOverdue 
    ? `⚠️ Overdue Task: ${params.taskTitle}` 
    : `📅 Task Due Soon: ${params.taskTitle}`;
    
  const urgencyColor = isOverdue ? '#dc2626' : params.hoursUntilDue <= 24 ? '#d97706' : '#059669';
  const urgencyBg = isOverdue ? '#fef2f2' : params.hoursUntilDue <= 24 ? '#fffbeb' : '#f0fdf4';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">${isOverdue ? '⚠️' : '📅'} Task Due Date ${isOverdue ? 'Passed' : 'Reminder'}</h2>
      <p style="font-size: 16px;">Hello ${params.assigneeName},</p>
      
      <div style="background: ${urgencyBg}; padding: 20px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
        <h3 style="margin: 0 0 10px 0; color: ${urgencyColor};">${params.taskTitle}</h3>
        <p style="margin: 5px 0; color: ${urgencyColor};">
          <strong>Project:</strong> ${params.projectName}
        </p>
        <p style="margin: 5px 0; color: ${urgencyColor};">
          <strong>Due Date:</strong> ${params.dueDate.toLocaleString()}
        </p>
        <p style="margin: 5px 0; color: ${urgencyColor};">
          ${isOverdue 
            ? `This task is overdue by ${Math.abs(params.hoursUntilDue).toFixed(1)} hours.`
            : `This task is due in ${params.hoursUntilDue.toFixed(1)} hours.`
          }
        </p>
      </div>
      
      ${params.taskUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.taskUrl}" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            ${isOverdue ? 'Complete Task Now' : 'View Task'}
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Please update your task status or contact your project manager if you need assistance.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.assigneeEmail, subject, html);
}

// Task Status Change Notification
export async function sendTaskStatusChangeEmail(params: {
  recipientEmail: string;
  recipientName: string;
  taskTitle: string;
  projectName: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  taskUrl?: string;
}): Promise<IApiResponse> {
  const subject = `Task Status Updated: ${params.taskTitle}`;
  
  const statusColors = {
    todo: { color: '#6b7280', bgColor: '#f9fafb' },
    'in-progress': { color: '#d97706', bgColor: '#fffbeb' },
    review: { color: '#8b5cf6', bgColor: '#f3f4f6' },
    done: { color: '#059669', bgColor: '#f0fdf4' },
    archived: { color: '#6b7280', bgColor: '#f9fafb' }
  };
  
  const statusColor = statusColors[params.newStatus as keyof typeof statusColors] || statusColors.todo;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">📋 Task Status Updated</h2>
      <p style="font-size: 16px;">Hello ${params.recipientName},</p>
      
      <p style="font-size: 16px;">The status of a task has been updated by <strong>${params.changedBy}</strong>:</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">${params.taskTitle}</h3>
        <p style="margin: 5px 0;"><strong>Project:</strong> ${params.projectName}</p>
        
        <div style="display: flex; align-items: center; margin: 15px 0;">
          <span style="background: #e5e7eb; color: #6b7280; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">
            ${params.oldStatus.replace('-', ' ')}
          </span>
          <span style="margin: 0 10px; color: #666;">→</span>
          <span style="background: ${statusColor.bgColor}; color: ${statusColor.color}; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
            ${params.newStatus.replace('-', ' ')}
          </span>
        </div>
      </div>
      
      ${params.taskUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.taskUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            View Task Details
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This is an automated notification from your project management system.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.recipientEmail, subject, html);
}

// Comment Mention Notification
export async function sendCommentMentionEmail(params: {
  mentionedEmail: string;
  mentionedName: string;
  taskTitle: string;
  projectName: string;
  commenterName: string;
  commentContent: string;
  taskUrl?: string;
}): Promise<IApiResponse> {
  const subject = `You were mentioned in: ${params.taskTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">💬 You Were Mentioned</h2>
      <p style="font-size: 16px;">Hello ${params.mentionedName},</p>
      
      <p style="font-size: 16px;"><strong>${params.commenterName}</strong> mentioned you in a comment:</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${params.taskTitle}</h3>
        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Project:</strong> ${params.projectName}</p>
        
        <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 3px solid #8b5cf6;">
          <p style="margin: 0; font-style: italic; color: #333;">"${params.commentContent}"</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">- ${params.commenterName}</p>
        </div>
      </div>
      
      ${params.taskUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.taskUrl}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            View Comment & Reply
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This is an automated notification from your project management system.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.mentionedEmail, subject, html);
}

// Project/Board Invitation
export async function sendBoardInvitationEmail(params: {
  inviteeEmail: string;
  inviteeName: string;
  boardName: string;
  projectName: string;
  invitedBy: string;
  role: 'member' | 'admin';
  boardUrl?: string;
}): Promise<IApiResponse> {
  const subject = `Invitation: Join ${params.boardName} board`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">🎯 Board Invitation</h2>
      <p style="font-size: 16px;">Hello ${params.inviteeName},</p>
      
      <p style="font-size: 16px;"><strong>${params.invitedBy}</strong> has invited you to join a project board:</p>
      
      <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #059669;">📋 ${params.boardName}</h3>
        <p style="margin: 5px 0; color: #059669;"><strong>Project:</strong> ${params.projectName}</p>
        <p style="margin: 5px 0; color: #059669;"><strong>Your Role:</strong> ${params.role.charAt(0).toUpperCase() + params.role.slice(1)}</p>
        <p style="margin: 10px 0 5px 0; color: #059669;">You can now collaborate on tasks, track progress, and communicate with your team.</p>
      </div>
      
      ${params.boardUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.boardUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Accept Invitation & View Board
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Welcome to the team! Start collaborating and stay productive.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.inviteeEmail, subject, html);
}

// Weekly Project Summary
export async function sendWeeklyProjectSummaryEmail(params: {
  recipientEmail: string;
  recipientName: string;
  projectName: string;
  weekRange: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    newTasks: number;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    user: string;
    date: Date;
  }>;
  projectUrl?: string;
}): Promise<IApiResponse> {
  const subject = `📊 Weekly Summary: ${params.projectName} (${params.weekRange})`;
  
  const completionRate = params.stats.totalTasks > 0 
    ? Math.round((params.stats.completedTasks / params.stats.totalTasks) * 100)
    : 0;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">📊 Weekly Project Summary</h2>
      <p style="font-size: 16px;">Hello ${params.recipientName},</p>
      
      <p style="font-size: 16px;">Here's your weekly summary for <strong>${params.projectName}</strong> (${params.weekRange}):</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">📈 Project Statistics</h3>
        
        <div style="display: grid; gap: 15px;">
          <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px;">
            <span>Total Tasks</span>
            <strong style="color: #2563eb;">${params.stats.totalTasks}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px;">
            <span>Completed</span>
            <strong style="color: #059669;">${params.stats.completedTasks}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px;">
            <span>Overdue</span>
            <strong style="color: #dc2626;">${params.stats.overdueTasks}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px;">
            <span>New This Week</span>
            <strong style="color: #8b5cf6;">${params.stats.newTasks}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px; border: 2px solid #2563eb;">
            <span><strong>Completion Rate</strong></span>
            <strong style="color: #2563eb;">${completionRate}%</strong>
          </div>
        </div>
      </div>
      
      ${params.recentActivities.length > 0 ? `
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">🔄 Recent Activities</h3>
          ${params.recentActivities.slice(0, 5).map(activity => `
            <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #333;">${activity.description}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">by ${activity.user} • ${activity.date.toLocaleDateString()}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${params.projectUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            View Full Project Details
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Keep up the great work! This automated summary helps you stay on top of your project progress.
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.recipientEmail, subject, html);
}

// Task Completion Notification
export async function sendTaskCompletionEmail(params: {
  recipientEmail: string;
  recipientName: string;
  taskTitle: string;
  projectName: string;
  completedBy: string;
  completedDate: Date;
  taskUrl?: string;
}): Promise<IApiResponse> {
  const subject = `✅ Task Completed: ${params.taskTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">✅ Task Completed</h2>
      <p style="font-size: 16px;">Hello ${params.recipientName},</p>
      
      <p style="font-size: 16px;">Great news! A task has been completed:</p>
      
      <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #059669;">🎉 ${params.taskTitle}</h3>
        <p style="margin: 5px 0; color: #059669;"><strong>Project:</strong> ${params.projectName}</p>
        <p style="margin: 5px 0; color: #059669;"><strong>Completed by:</strong> ${params.completedBy}</p>
        <p style="margin: 5px 0; color: #059669;"><strong>Completed on:</strong> ${params.completedDate.toLocaleString()}</p>
      </div>
      
      ${params.taskUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.taskUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            View Completed Task
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Congratulations to the team on this accomplishment!
      </p>
    </div>
  `;
  
  return await sendProjectEmail(params.recipientEmail, subject, html);
}