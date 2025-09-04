import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { IProjectUpdateRequest, canUserPerformAction } from '@/types/project-management';

// GET specific project
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
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email')
      .populate('clientId', 'name email')
      .populate({
        path: 'boards',
        populate: {
          path: 'columns',
          populate: {
            path: 'tasks'
          }
        }
      });

    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString(),
      boardMemberIds: project.memberIds.map((m: any) => m._id.toString())
    }, 'canViewAssignedProjects');

    if (!hasAccess) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied to this project'
      }, { status: 403 });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      data: project,
      message: 'Project retrieved successfully'
    });

  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update project
export async function PUT(
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

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check permissions
    const canEdit = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString()
    }, 'canEditAllProjects') || canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString()
    }, 'canEditOwnProjects');

    if (!canEdit) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to edit this project'
      }, { status: 403 });
    }

    const updateData: IProjectUpdateRequest = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete (updateData as any).ownerId;
    delete (updateData as any).createdAt;

    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email')
     .populate('memberIds', 'name email')
     .populate('clientId', 'name email');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE project
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

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Only admins or project owners can delete projects
    const canDelete = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      projectOwnerId: project.ownerId.toString()
    }, 'canDeleteProject') && (
      token.role === 'admin' || project.ownerId.toString() === token.id
    );

    if (!canDelete) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to delete this project'
      }, { status: 403 });
    }

    await Project.findByIdAndDelete(params.id);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}