import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { IApiResponse } from '@/types';

// GET all users with filters (for admin only)
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'client' | 'hr' | 'employee' | null;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'declined' | 'blocked' | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: Record<string, unknown> = { role: { $ne: 'admin' } }; // Exclude admin users
    
    if (role) query.role = role;
    if (status) query.accountStatus = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query, { password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // Transform users to ensure id field is available
    const transformedUsers = users.map(user => ({
      ...user,
      id: user._id?.toString(),
      _id: user._id?.toString()
    }));

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: transformedUsers,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: users.length,
          totalCount: total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}