import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/project-management';
import { IApiResponse,  } from '@/types';
import { IProjectCreateRequest, IProjectFilters } from '@/types/project-management';
import { hasPermission } from '@/types/project-management';

// GET all projects with filtering and role-based access
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
    const filters: IProjectFilters = {
      status: searchParams.getAll('status') as any,
      priority: searchParams.getAll('priority') as any,
      ownerId: searchParams.get('ownerId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      search: searchParams.get('search') || undefined
    };

    // Build query based on user role and permissions
    let query: any = {};
    
    if (!hasPermission(token.role as any, 'canViewAllProjects')) {
      // User can only see projects where they're owner or member
      query = {
        $or: [
          { ownerId: token.id },
          { memberIds: token.id },
          { clientId: token.id }
        ]
      };
    }

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }
    if (filters.priority && filters.priority.length > 0) {
      query.priority = { $in: filters.priority };
    }
    if (filters.ownerId) {
      query.ownerId = filters.ownerId;
    }
    if (filters.clientId) {
      query.clientId = filters.clientId;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const projects = await Project.find(query)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email')
      .populate('clientId', 'name email')
      .sort({ updatedAt: -1 });

    return NextResponse.json<IApiResponse>({
      success: true,
      data: projects,
      message: 'Projects retrieved successfully'
    });

  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST create new project
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

    // Check if user can create projects
    if (!hasPermission(token.role as any, 'canCreateProject')) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to create projects'
      }, { status: 403 });
    }

    const projectData: IProjectCreateRequest = await request.json();

    // Validate required fields
    if (!projectData.name || !projectData.key) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project name and key are required'
      }, { status: 400 });
    }

    // Check if project key already exists
    const existingProject = await Project.findOne({ key: projectData.key.toUpperCase() });
    if (existingProject) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Project key already exists'
      }, { status: 400 });
    }

    // Create project with current user as owner
    const newProject = await Project.create({
      ...projectData,
      key: projectData.key.toUpperCase(),
      ownerId: token.id,
      memberIds: [token.id, ...(projectData.memberIds || [])].filter((id, index, arr) => 
        arr.indexOf(id) === index // Remove duplicates
      )
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate('ownerId', 'name email')
      .populate('memberIds', 'name email')
      .populate('clientId', 'name email');

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    }, { status: 201 });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}