import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { IApiResponse, IIdAssignmentRequest, IIdAssignmentResponse } from '@/types';
import { sendIdAssignmentEmail } from '@/lib/email';

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

    const { userId, employeeId, clientId }: IIdAssignmentRequest = await request.json();

    if (!userId || (!employeeId && !clientId)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User ID and either employee ID or client ID are required'
      }, { status: 400 });
    }

    if (employeeId && clientId) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Cannot assign both employee ID and client ID'
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    if (user.idAssigned) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'ID already assigned to this user'
      }, { status: 400 });
    }

    // Validate role matches ID type
    if (employeeId && user.role !== 'hr' && user.role !== 'employee') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Employee ID can only be assigned to HR or Employee roles'
      }, { status: 400 });
    }

    if (clientId && user.role !== 'client') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Client ID can only be assigned to Client role'
      }, { status: 400 });
    }

    // Check if ID already exists
    const existingUser = employeeId 
      ? await User.findOne({ employeeId })
      : await User.findOne({ clientId });

    if (existingUser) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: `${employeeId ? 'Employee' : 'Client'} ID already exists`
      }, { status: 400 });
    }

    // Update user with assigned ID
    const updateData = {
      ...(employeeId && { employeeId }),
      ...(clientId && { clientId }),
      idAssigned: true,
      idAssignedAt: new Date()
    };

    await User.findByIdAndUpdate(userId, updateData);

    // Send email notification
    try {
      await sendIdAssignmentEmail({
        email: user.email,
        fullname: user.fullname,
        assignedId: employeeId || clientId!,
        idType: employeeId ? 'employee' : 'client',
        role: user.role
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const response: IIdAssignmentResponse = {
      userId,
      assignedId: employeeId || clientId!,
      idType: employeeId ? 'employee' : 'client',
      emailSent: true
    };

    return NextResponse.json<IApiResponse<IIdAssignmentResponse>>({
      success: true,
      message: 'ID assigned successfully',
      data: response
    });

  } catch (error) {
    console.error('ID assignment error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}