import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task, TaskActivity } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { ITaskUpdateRequest, canUserPerformAction } from '@/types/project-management';
import { sendTaskStatusChangeEmail, sendTaskCompletionEmail } from '@/lib/project-email';

// GET specific task
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

    const task = await Task.findById(params.id)
      .populate('assigneeIds', 'name email')
      .populate('creatorId', 'name email')
      .populate('labelIds')
      .populate('boardId', 'title')
      .populate('projectId', 'name')
      .populate('comments')
      .populate('attachments')
      .populate('checklists');

    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Check access
    const canView = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((a: any) => a._id.toString())
    }, 'canEditAllTasks') || 
    canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((a: any) => a._id.toString())
    }, 'canEditAssignedTasks') ||
    task.creatorId._id.toString() === token.id;

    if (!canView) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied to this task'
      }, { status: 403 });
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });

  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update task
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

    const task = await Task.findById(params.id)
      .populate('assigneeIds', 'name email')
      .populate('boardId', 'title')
      .populate('projectId', 'name');

    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Check permissions
    const canEdit = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((a: any) => a._id.toString())
    }, 'canEditAllTasks') || 
    canUserPerformAction({
      userRole: token.role as any,
      userId: token.id,
      taskAssigneeIds: task.assigneeIds.map((a: any) => a._id.toString())
    }, 'canEditAssignedTasks') ||
    task.creatorId.toString() === token.id;

    if (!canEdit) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to edit this task'
      }, { status: 403 });
    }

    const updateData: ITaskUpdateRequest = await request.json();
    const oldStatus = task.status;
    
    // Remove fields that shouldn't be updated directly
    delete (updateData as any).creatorId;
    delete (updateData as any).createdAt;
    delete (updateData as any).boardId;
    delete (updateData as any).projectId;
    delete (updateData as any).columnId;

    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('assigneeIds', 'name email')
     .populate('creatorId', 'name email')
     .populate('labelIds')
     .populate('boardId', 'title')
     .populate('projectId', 'name');

    // Log activity for significant changes
    const changes = [];
    if (updateData.status && updateData.status !== oldStatus) {
      changes.push(`Status changed from "${oldStatus}" to "${updateData.status}"`);
      
      // Send status change notification
      for (const assignee of task.assigneeIds) {
        await sendTaskStatusChangeEmail({
          recipientEmail: (assignee as any).email,
          recipientName: (assignee as any).name,
          taskTitle: task.title,
          projectName: (task.projectId as any).name,
          oldStatus,
          newStatus: updateData.status,
          changedBy: token.name || 'User'
        });
      }

      // Send completion notification
      if (updateData.status === 'done') {
        for (const assignee of task.assigneeIds) {
          await sendTaskCompletionEmail({
            recipientEmail: (assignee as any).email,
            recipientName: (assignee as any).name,
            taskTitle: task.title,
            projectName: (task.projectId as any).name,
            completedBy: token.name || 'User',
            completedDate: new Date()
          });
        }
      }
    }

    if (updateData.assigneeIds) {
      changes.push('Assignees updated');
    }
    if (updateData.priority && updateData.priority !== task.priority) {
      changes.push(`Priority changed to ${updateData.priority}`);
    }

    if (changes.length > 0) {
      await TaskActivity.logActivity(
        params.id,
        token.id,
        token.name || 'User',
        'updated',
        changes.join(', '),
        { oldStatus },
        { newStatus: updateData.status }
      );
    }

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE task
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

    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Check permissions - only creators or admins can delete tasks
    const canDelete = canUserPerformAction({
      userRole: token.role as any,
      userId: token.id
    }, 'canDeleteTask') && (
      task.creatorId.toString() === token.id || 
      token.role === 'admin' || 
      token.role === 'hr'
    );

    if (!canDelete) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to delete this task'
      }, { status: 403 });
    }

    await Task.findByIdAndDelete(params.id);

    // Log activity
    await TaskActivity.logActivity(
      params.id,
      token.id,
      token.name || 'User',
      'archived',
      `Task "${task.title}" was deleted`
    );

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}