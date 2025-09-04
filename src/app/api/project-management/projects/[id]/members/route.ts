import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/project-management';
import { User } from '@/models';
import { IApiResponse } from '@/types';
import { canUserPerformAction } from '@/types/project-management';

// GET project members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const project = await Project.findById(params.id)
      .populate('memberIds', 'name email role')
      .populate('ownerId', 'name email role');

    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check access
    const hasAccess = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString(),
      boardMemberIds: project.memberIds.map((m: any) => m._id.toString())
    }, 'canViewAssignedProjects');

    if (!hasAccess) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied'
      }, { status: 403 });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      data: {
        owner: project.ownerId,
        members: project.memberIds
      },
      message: 'Project members retrieved successfully'
    });

  } catch (error) {
    console.error('Get project members error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST add members to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { memberIds } = await request.json();

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Member IDs array is required'
      }, { status: 400 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check permissions
    const canManage = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString()
    }, 'canManageProjectMembers');

    if (!canManage) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to manage project members'
      }, { status: 403 });
    }

    // Verify all member IDs exist
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'One or more user IDs are invalid'
      }, { status: 400 });
    }

    // Add members (avoid duplicates)
    const existingMemberIds = project.memberIds.map((id: any) => id.toString());
    const newMemberIds = memberIds.filter((id: string) => !existingMemberIds.includes(id));
    
    project.memberIds.push(...newMemberIds);
    await project.save();

    const updatedProject = await Project.findById(params.id)
      .populate('memberIds', 'name email role');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Members added successfully',
      data: updatedProject?.memberIds
    });

  } catch (error) {
    console.error('Add project members error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE remove member from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberIdToRemove = searchParams.get('memberId');

    if (!memberIdToRemove) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Member ID is required'
      }, { status: 400 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check permissions
    const canManage = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString()
    }, 'canManageProjectMembers');

    // Owner cannot be removed
    if (memberIdToRemove === project.ownerId.toString()) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Cannot remove project owner'
      }, { status: 400 });
    }

    if (!canManage && memberIdToRemove !== token.id) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Remove member
    project.memberIds = project.memberIds.filter((id: any) => 
      id.toString() !== memberIdToRemove
    );
    await project.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove project member error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}