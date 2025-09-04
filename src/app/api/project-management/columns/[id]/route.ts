import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Column, Board } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { IColumnUpdateRequest } from '@/types/project-management';

// GET specific column
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

    const column = await Column.findById(params.id)
      .populate({
        path: 'tasks',
        options: { sort: { position: 1 } },
        populate: [
          { path: 'assigneeIds', select: 'name email' },
          { path: 'creatorId', select: 'name email' },
          { path: 'labelIds' }
        ]
      });

    if (!column) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column not found'
      }, { status: 404 });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      data: column,
      message: 'Column retrieved successfully'
    });

  } catch (error) {
    console.error('Get column error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update column
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

    const column = await Column.findById(params.id);
    if (!column) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column not found'
      }, { status: 404 });
    }

    // Check board permissions
    const board = await Board.findById(column.boardId);
    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    const isAdmin = board.adminIds.includes(token.id);
    const isCreator = board.creatorId.toString() === token.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to edit this column'
      }, { status: 403 });
    }

    const updateData: IColumnUpdateRequest = await request.json();
    
    const updatedColumn = await Column.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Column updated successfully',
      data: updatedColumn
    });

  } catch (error) {
    console.error('Update column error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE column
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

    const column = await Column.findById(params.id);
    if (!column) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column not found'
      }, { status: 404 });
    }

    // Check board permissions
    const board = await Board.findById(column.boardId);
    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    const isAdmin = board.adminIds.includes(token.id);
    const isCreator = board.creatorId.toString() === token.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to delete this column'
      }, { status: 403 });
    }

    // Check if column has tasks
    if (column.taskIds.length > 0) {
      const { searchParams } = new URL(request.url);
      const moveTasksTo = searchParams.get('moveTasksTo');
      
      if (!moveTasksTo) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Column contains tasks. Specify moveTasksTo parameter to move tasks to another column before deletion.'
        }, { status: 400 });
      }

      // Move tasks to another column
      const targetColumn = await Column.findById(moveTasksTo);
      if (!targetColumn || targetColumn.boardId.toString() !== column.boardId.toString()) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Target column not found or not in the same board'
        }, { status: 400 });
      }

      // Update tasks to new column
      await Column.updateMany(
        { _id: { $in: column.taskIds } },
        { columnId: moveTasksTo }
      );

      // Add tasks to target column
      targetColumn.taskIds.push(...column.taskIds);
      await targetColumn.save();
    }

    await Column.findByIdAndDelete(params.id);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Column deleted successfully'
    });

  } catch (error) {
    console.error('Delete column error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}