import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Board, Project, Column } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { IBoardCreateRequest, hasPermission } from '@/types/project-management';

// GET boards with filtering
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
    const projectId = searchParams.get('projectId');
    const isArchived = searchParams.get('archived') === 'true';

    let query: any = {};
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    query.isArchived = isArchived;

    // Role-based filtering
    if (!hasPermission(token.role as any, 'canViewAllProjects')) {
      query.$or = [
        { creatorId: token.id },
        { memberIds: token.id },
        { adminIds: token.id }
      ];
    }

    const boards = await Board.find(query)
      .populate('creatorId', 'name email')
      .populate('memberIds', 'name email role')
      .populate('adminIds', 'name email role')
      .populate('projectId', 'name key')
      .populate({
        path: 'columns',
        options: { sort: { position: 1 } },
        populate: {
          path: 'tasks',
          options: { sort: { position: 1 } }
        }
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      data: boards,
      message: 'Boards retrieved successfully'
    });

  } catch (error) {
    console.error('Get boards error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST create new board
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

    if (!hasPermission(token.role as any, 'canCreateBoard')) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create boards'
      }, { status: 403 });
    }

    const boardData: IBoardCreateRequest = await request.json();

    if (!boardData.title || !boardData.projectId) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board title and project ID are required'
      }, { status: 400 });
    }

    // Verify project exists and user has access
    const project = await Project.findById(boardData.projectId);
    if (!project) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // Check if user is project member or has admin rights
    const isProjectMember = project.memberIds.includes(token.id) || 
                           project.ownerId.toString() === token.id ||
                           hasPermission(token.role as any, 'canCreateBoard');

    if (!isProjectMember) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Access denied to this project'
      }, { status: 403 });
    }

    // Create board
    const newBoard = await Board.create({
      ...boardData,
      creatorId: token.id,
      memberIds: [token.id, ...(boardData.memberIds || [])].filter((id, index, arr) => 
        arr.indexOf(id) === index
      ),
      adminIds: [token.id, ...(boardData.adminIds || [])].filter((id, index, arr) => 
        arr.indexOf(id) === index
      )
    });

    // Create default columns
    const defaultColumns = [
      { title: 'To Do', position: 0, boardId: newBoard._id },
      { title: 'In Progress', position: 1, boardId: newBoard._id },
      { title: 'Review', position: 2, boardId: newBoard._id },
      { title: 'Done', position: 3, boardId: newBoard._id }
    ];

    const columns = await Column.insertMany(defaultColumns);
    
    // Update board with column IDs
    newBoard.columnOrder = columns.map(col => col._id.toString());
    await newBoard.save();

    // Update project with board ID
    project.boardIds.push(newBoard._id.toString());
    await project.save();

    const populatedBoard = await Board.findById(newBoard._id)
      .populate('creatorId', 'name email')
      .populate('memberIds', 'name email role')
      .populate('adminIds', 'name email role')
      .populate('projectId', 'name key')
      .populate('columns');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Board created successfully',
      data: populatedBoard
    }, { status: 201 });

  } catch (error) {
    console.error('Create board error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}