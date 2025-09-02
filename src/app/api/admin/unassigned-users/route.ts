import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { IApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'admin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    // Get users who need ID assignment (not admin and not already assigned)
    const unassignedUsers = await User.find(
      { 
        role: { $in: ['client', 'hr', 'employee'] },
        idAssigned: false
      }, 
      { password: 0 }
    ).sort({ createdAt: -1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Unassigned users retrieved successfully',
      data: unassignedUsers
    });

  } catch (error) {
    console.error('Get unassigned users error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}