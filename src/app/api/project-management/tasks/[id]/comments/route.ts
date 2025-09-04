import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task, Comment, TaskActivity } from '@/models/project-management';
import { User } from '@/models';
import { IApiResponse } from '@/types';
import { sendCommentMentionEmail } from '@/lib/project-email';

// GET task comments
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

    const comments = await Comment.find({ taskId: params.id })
      .populate('authorId', 'name email')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      data: comments,
      message: 'Comments retrieved successfully'
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST add comment
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

    const { content, mentions } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Comment content is required'
      }, { status: 400 });
    }

    // Verify task exists
    const task = await Task.findById(params.id)
      .populate('projectId', 'name')
      .populate('boardId', 'title');
    
    if (!task) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    // Create comment
    const newComment = await Comment.create({
      content: content.trim(),
      authorId: token.id,
      authorName: token.name,
      authorAvatar: token.picture,
      taskId: params.id,
      mentions: mentions || []
    });

    // Log activity
    await TaskActivity.create({
      taskId: params.id,
      userId: token.id,
      userName: token.name || 'User',
      type: 'commented',
      description: `Added a comment: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
      createdAt: new Date()
    });

    // Send mention notifications
    if (mentions && mentions.length > 0) {
      const mentionedUsers = await User.find({ _id: { $in: mentions } });
      
      for (const user of mentionedUsers) {
        await sendCommentMentionEmail({
          mentionedEmail: user.email,
          mentionedName: user.name,
          taskTitle: task.title,
          projectName: (task.projectId as any).name,
          commenterName: token.name || 'User',
          commentContent: content
        });
      }
    }

    const populatedComment = await Comment.findById(newComment._id)
      .populate('authorId', 'name email')
      .populate('mentions', 'name email');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment
    }, { status: 201 });

  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}