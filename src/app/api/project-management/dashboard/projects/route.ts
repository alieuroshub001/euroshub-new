import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project, Task, Board } from '@/models/project-management';
import { IApiResponse } from '@/types';

// GET dashboard data for projects
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

    // Get user's projects (where they're owner or member)
    const userProjects = await Project.find({
      $or: [
        { ownerId: token.id },
        { memberIds: token.id }
      ]
    }).populate('ownerId', 'name email');

    // Get user's assigned tasks
    const userTasks = await Task.find({ 
      assigneeIds: token.id,
      status: { $ne: 'done' }
    })
    .populate('projectId', 'name')
    .populate('boardId', 'title')
    .sort({ dueDate: 1 })
    .limit(10);

    // Calculate project statistics
    const projectStats = await Promise.all(
      userProjects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id });
        const completedTasks = await Task.countDocuments({ 
          projectId: project._id, 
          status: 'done' 
        });
        const overdueTasks = await Task.countDocuments({
          projectId: project._id,
          dueDate: { $lt: new Date() },
          status: { $ne: 'done' }
        });
        const myTasks = await Task.countDocuments({
          projectId: project._id,
          assigneeIds: token.id
        });

        return {
          project: {
            id: project._id,
            name: project.name,
            key: project.key,
            status: project.status,
            progress: project.progress
          },
          stats: {
            totalTasks,
            completedTasks,
            overdueTasks,
            myTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          }
        };
      })
    );

    // Get recent activities
    const recentBoards = await Board.find({
      $or: [
        { creatorId: token.id },
        { memberIds: token.id }
      ]
    })
    .populate('projectId', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);

    // Overall user statistics
    const overallStats = {
      totalProjects: userProjects.length,
      totalTasks: await Task.countDocuments({ assigneeIds: token.id }),
      completedTasks: await Task.countDocuments({ 
        assigneeIds: token.id, 
        status: 'done' 
      }),
      overdueTasks: await Task.countDocuments({
        assigneeIds: token.id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
      })
    };

    return NextResponse.json<IApiResponse>({
      success: true,
      data: {
        projects: projectStats,
        upcomingTasks: userTasks,
        recentBoards,
        overallStats
      },
      message: 'Dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}