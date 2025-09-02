import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { IApiResponse, IUserStatusUpdateRequest } from '@/types';
import { sendIdAssignmentEmail } from '@/lib/email';
import { sendStatusUpdateEmail } from '@/lib/email-status';

// POST update user status (approve/decline/block)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'admin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const { userId, status, employeeId, clientId }: IUserStatusUpdateRequest = await request.json();

    if (!userId || !status) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User ID and status are required'
      }, { status: 400 });
    }

    if (!['approved', 'declined', 'blocked'].includes(status)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Invalid status. Must be approved, declined, or blocked'
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Cannot modify admin user status'
      }, { status: 400 });
    }

    // Validate ID assignment for approved users
    if (status === 'approved') {
      if ((user.role === 'hr' || user.role === 'employee') && !employeeId) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Employee ID is required for HR and Employee roles'
        }, { status: 400 });
      }

      if (user.role === 'client' && !clientId) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Client ID is required for Client role'
        }, { status: 400 });
      }

      // Check if ID already exists
      if (employeeId) {
        const existingUser = await User.findOne({ employeeId, _id: { $ne: userId } });
        if (existingUser) {
          return NextResponse.json<IApiResponse>({
            success: false,
            message: 'Employee ID already exists'
          }, { status: 400 });
        }
      }

      if (clientId) {
        const existingUser = await User.findOne({ clientId, _id: { $ne: userId } });
        if (existingUser) {
          return NextResponse.json<IApiResponse>({
            success: false,
            message: 'Client ID already exists'
          }, { status: 400 });
        }
      }
    }

    // Update user status
    const updateData: Record<string, unknown> = {
      accountStatus: status,
      statusUpdatedBy: token.id,
      statusUpdatedAt: new Date()
    };

    if (status === 'approved') {
      updateData.idAssigned = true;
      updateData.idAssignedAt = new Date();
      
      if (employeeId) updateData.employeeId = employeeId;
      if (clientId) updateData.clientId = clientId;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // Send email notification
    try {
      if (status === 'approved' && (employeeId || clientId)) {
        await sendIdAssignmentEmail({
          email: user.email,
          fullname: user.fullname,
          assignedId: employeeId || clientId!,
          idType: employeeId ? 'employee' : 'client',
          role: user.role
        });
      } else {
        await sendStatusUpdateEmail({
          email: user.email,
          fullname: user.fullname,
          status,
          role: user.role
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      message: `User ${status} successfully`,
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('User status update error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}