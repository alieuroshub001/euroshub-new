import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Board, Column } from '@/models/project-management';
import { IApiResponse } from '@/types';
import { IColumnCreateRequest, IColumnReorderRequest } from '@/types/project-management';

// GET columns for a board
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

    const board = await Board.findById(params.id);
    if (!board) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Board not found'
      }, { status: 404 });
    }

    const columns = await Column.find({ boardId: params.id })
      .populate({
        path: 'tasks',
        options: { sort: { position: 1 } },
        populate: [
          { path: 'assigneeIds', select: 'name email' },
          { path: 'creatorId', select: 'name email' }
        ]
      })
      .sort({ position: 1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      data: columns,
      message: 'Columns retrieved successfully'
    });

  } catch (error) {
    console.error('Get columns error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST create new column
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

    if (!isAdmin && !isCreator) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create columns'
      }, { status: 403 });
    }

    const columnData: IColumnCreateRequest = await request.json();
    
    if (!columnData.title) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column title is required'
      }, { status: 400 });
    }

    // Get next position
    const maxPosition = await Column.findOne({ boardId: params.id })
      .sort({ position: -1 })
      .select('position');
    
    const position = columnData.position ?? ((maxPosition?.position ?? -1) + 1);

    const newColumn = await Column.create({
      ...columnData,
      boardId: params.id,
      position
    });

    // Update board's column order
    board.columnOrder.push(newColumn._id.toString());
    await board.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Column created successfully',
      data: newColumn
    }, { status: 201 });

  } catch (error) {
    console.error('Create column error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT reorder columns
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

    if (!isAdmin && !isCreator) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to reorder columns'
      }, { status: 403 });
    }

    const { columnOrder }: IColumnReorderRequest = await request.json();
    
    if (!Array.isArray(columnOrder)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Column order array is required'
      }, { status: 400 });
    }

    // Reorder columns manually since static method doesn't exist
    for (let i = 0; i < columnOrder.length; i++) {
      await Column.findByIdAndUpdate(columnOrder[i], { position: i });
    }

    // Update board's column order
    board.columnOrder = columnOrder;
    await board.save();

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Columns reordered successfully'
    });

  } catch (error) {
    console.error('Reorder columns error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}