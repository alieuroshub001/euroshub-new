import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task, Column, Board, TaskActivity } from '@/models/project-management';
import { IApiResponse } from '@/types';
import {  ITaskFilter } from '@/types/project-management';

import { ITaskCreateRequest, hasPermission } from '@/types/project-management';
import { sendTaskAssignmentEmail } from '@/lib/project-email';

// GET tasks with filtering
export async function GET(request: NextRequest) {
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
    const filters: ITaskFilter = {
      assigneeIds: searchParams.getAll('assignee'),
      labelIds: searchParams.getAll('label'),
      priority: searchParams.getAll('priority') as any,
      status: searchParams.getAll('status') as any,
      search: searchParams.get('search') || undefined,
      boardId: searchParams.get('boardId') || undefined,
      projectId: searchParams.get('projectId') || undefined
    };

    let query: any = {};

    // Apply filters
    if (filters.boardId) query.boardId = filters.boardId;
    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      query.assigneeIds = { $in: filters.assigneeIds };
    }
    if (filters.labelIds && filters.labelIds.length > 0) {
      query.labelIds = { $in: filters.labelIds };
    }
    if (filters.priority && filters.priority.length > 0) {
      query.priority = { $in: filters.priority };
    }
    if (filters.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Role-based filtering
    if (!hasPermission(token.role as any, 'canEditAllTasks')) {
      query.$or = [
        { assigneeIds: token.id },
        { creatorId: token.id }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assigneeIds', 'name email')
      .populate('creatorId', 'name email')
      .populate('labelIds')
      .populate('boardId', 'title')
      .populate('projectId', 'name')
      .populate('comments')
      .populate('attachments')
      .sort({ updatedAt: -1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully'
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST create new task
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

    if (!hasPermission(token.role as any, 'canCreateTask')) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create tasks'
      }, { status: 403 });
    }

    const taskData: ITaskCreateRequest = await request.json();

    if (!taskData.title || !taskData.columnId || !taskData.boardId || !taskData.projectId) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Title, column ID, board ID, and project ID are required'
      }, { status: 400 });
    }

    // Verify column exists and get position
    const column = await Column.findById(taskData.columnId);
    if (!column) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column not found'
      }, { status: 404 });
    }

    // Get next position in column
    const maxPosition = await Task.findOne({ columnId: taskData.columnId })
      .sort({ position: -1 })
      .select('position');
    
    const position = (maxPosition?.position ?? -1) + 1;

    // Create task
    const newTask = await Task.create({
      ...taskData,
      creatorId: token.id,
      position,
      assigneeIds: taskData.assigneeIds || []
    });

    // Add task to column
    await column.addTask(newTask._id.toString());

    // Log activity
    await TaskActivity.logActivity(
      newTask._id.toString(),
      token.id,
      token.name || 'User',
      'created',
      `Created task "${taskData.title}"`
    );

    // Send email notifications to assignees
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      const assignees = await Task.findById(newTask._id).populate('assigneeIds', 'email name');
      const board = await Board.findById(taskData.boardId).populate('projectId', 'name');
      
      if (assignees && board) {
        for (const assignee of assignees.assigneeIds) {
          await sendTaskAssignmentEmail({
            assigneeEmail: (assignee as any).email,
            assigneeName: (assignee as any).name,
            taskTitle: taskData.title,
            taskDescription: taskData.description,
            projectName: (board.projectId as any).name,
            boardName: board.title,
            assignedBy: token.name || 'User',
            dueDate: taskData.dueDate,
            priority: taskData.priority || 'medium'
          });
        }
      }
    }

    const populatedTask = await Task.findById(newTask._id)
      .populate('assigneeIds', 'name email')
      .populate('creatorId', 'name email')
      .populate('labelIds')
      .populate('boardId', 'title')
      .populate('projectId', 'name');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    }, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}