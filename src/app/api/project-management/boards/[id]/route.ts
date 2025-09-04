import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Board } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { IBoardUpdateRequest, hasPermission } from '@/types/project-management';

// GET specific board
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

    const board = await Board.findById(params.id)
      .populate('creatorId', 'name email')
      .populate('memberIds', 'name email role')
      .populate('adminIds', 'name email role')
      .populate('projectId', 'name key')
      .populate({
        path: 'columns',
        options: { sort: { position: 1 } },
        populate: {
          path: 'tasks',
          options: { sort: { position: 1 } },
          populate: [
            { path: 'assigneeIds', select: 'name email' },
            { path: 'creatorId', select: 'name email' },
            { path: 'labelIds' }
          ]
        }
      })
      .populate('labels');

    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    // Check access - helper function to safely extract ID
    const extractId = (obj: any): string => {
      if (typeof obj === 'string') return obj;
      if (obj && typeof obj === 'object') {
        if (obj._id) return obj._id.toString();
        if (obj.toString && typeof obj.toString === 'function') return obj.toString();
      }
      return '';
    };

    const isMember = board.memberIds.some((m: any) => extractId(m) === token.id);
    const isAdmin = board.adminIds.some((a: any) => extractId(a) === token.id);
    const isCreator = extractId(board.creatorId) === token.id;
    const hasGlobalAccess = hasPermission(token.role as any, 'canViewAllProjects');

    if (!isMember && !isAdmin && !isCreator && !hasGlobalAccess && board.visibility === 'private') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied to this board'
      }, { status: 403 });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      data: board,
      message: 'Board retrieved successfully'
    });

  } catch (error) {
    console.error('Get board error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update board
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

    const board = await Board.findById(params.id);
    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    // Check permissions
    const isAdmin = board.adminIds.includes(token.id);
    const isCreator = board.creatorId.toString() === token.id;
    const hasGlobalPermission = hasPermission(token.role as any, 'canEditBoardSettings');

    if (!isAdmin && !isCreator && !hasGlobalPermission) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to edit this board'
      }, { status: 403 });
    }

    const updateData: IBoardUpdateRequest = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete (updateData as any).creatorId;
    delete (updateData as any).createdAt;
    delete (updateData as any).projectId;

    const updatedBoard = await Board.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('creatorId', 'name email')
     .populate('memberIds', 'name email role')
     .populate('adminIds', 'name email role')
     .populate('projectId', 'name key');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Board updated successfully',
      data: updatedBoard
    });

  } catch (error) {
    console.error('Update board error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE board (archive)
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

    const board = await Board.findById(params.id);
    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    // Check permissions
    const canDelete = hasPermission(token.role as any, 'canDeleteBoard') && (
      token.role === 'admin' || 
      board.creatorId.toString() === token.id ||
      board.adminIds.includes(token.id)
    );

    if (!canDelete) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to delete this board'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanently delete board and all related data
      await Board.findByIdAndDelete(params.id);
    } else {
      // Archive board
      await Board.findByIdAndUpdate(params.id, { 
        isArchived: true,
        updatedAt: new Date() 
      });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      message: permanent ? 'Board deleted permanently' : 'Board archived successfully'
    });

  } catch (error) {
    console.error('Delete board error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}