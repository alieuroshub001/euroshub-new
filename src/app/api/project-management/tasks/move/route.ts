import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task, Column, TaskActivity } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { ITaskMoveRequest, canUserPerformAction } from '@/types/project-management';

// POST move task between columns (drag & drop)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    if (!canUserPerformAction({
      userRole: token.role as any,
      userId: token.id
    }, 'canMoveTasksBetweenColumns')) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to move tasks'
      }, { status: 403 });
    }

    const moveData: ITaskMoveRequest = await request.json();
    
    if (!moveData.taskId || !moveData.sourceColumnId || !moveData.destinationColumnId || 
        moveData.destinationIndex === undefined) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task ID, source column, destination column, and destination index are required'
      }, { status: 400 });
    }

    // Verify task exists and user has permission to move it
    const task = await Task.findById(moveData.taskId);
    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Check if user can move this specific task
    const canMoveTask = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((id: any) => id.toString())
    }, 'canEditAllTasks') ||
    canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((id: any) => id.toString())
    }, 'canEditAssignedTasks') ||
    task.creatorId.toString() === token.id;

    if (!canMoveTask) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to move this task'
      }, { status: 403 });
    }

    // Verify columns exist and belong to the same board
    const sourceColumn = await Column.findById(moveData.sourceColumnId);
    const destinationColumn = await Column.findById(moveData.destinationColumnId);
    
    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Source or destination column not found'
      }, { status: 404 });
    }

    if (sourceColumn.boardId.toString() !== destinationColumn.boardId.toString()) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Cannot move tasks between different boards'
      }, { status: 400 });
    }

    // Move task manually since static method doesn't exist
    // Update task's column and position
    await Task.findByIdAndUpdate(moveData.taskId, {
      columnId: moveData.destinationColumnId,
      position: moveData.destinationIndex
    });

    // Update source column - remove task
    await Column.findByIdAndUpdate(moveData.sourceColumnId, {
      $pull: { taskIds: moveData.taskId }
    });

    // Update destination column - add task
    await Column.findByIdAndUpdate(moveData.destinationColumnId, {
      $addToSet: { taskIds: moveData.taskId }
    });

    // Log the move activity
    const sourceColumnTitle = sourceColumn.title;
    const destinationColumnTitle = destinationColumn.title;
    
    await TaskActivity.create({
      taskId: moveData.taskId,
      userId: token.id,
      userName: token.name || 'User',
      type: 'moved',
      description: `Moved from "${sourceColumnTitle}" to "${destinationColumnTitle}"`,
      oldValue: { columnId: moveData.sourceColumnId, columnTitle: sourceColumnTitle },
      newValue: { columnId: moveData.destinationColumnId, columnTitle: destinationColumnTitle },
      createdAt: new Date()
    });

    // Update task status based on column (optional - can be customized)
    const statusMapping: Record<string, string> = {
      'to do': 'todo',
      'todo': 'todo',
      'in progress': 'in-progress',
      'progress': 'in-progress',
      'review': 'review',
      'testing': 'review',
      'done': 'done',
      'complete': 'done',
      'completed': 'done'
    };

    const newStatus = statusMapping[destinationColumn.title.toLowerCase()];
    if (newStatus && newStatus !== task.status) {
      await Task.findByIdAndUpdate(moveData.taskId, { status: newStatus });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Task moved successfully',
      data: {
        taskId: moveData.taskId,
        from: {
          columnId: moveData.sourceColumnId,
          title: sourceColumnTitle
        },
        to: {
          columnId: moveData.destinationColumnId,
          title: destinationColumnTitle
        },
        newPosition: moveData.destinationIndex
      }
    });

  } catch (error) {
    console.error('Move task error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}