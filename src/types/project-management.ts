// Project Management Types - Kanban Board System

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'archived';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type BoardVisibility = 'private' | 'team' | 'public';

export interface ILabel {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface IComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  taskId: string;
  createdAt: Date;
  updatedAt?: Date;
  mentions?: string[];
}

export interface IAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface IChecklist {
  id: string;
  title: string;
  items: IChecklistItem[];
  taskId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  projectId: string;
  position: number;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds: string[];
  assignees?: IUser[];
  creatorId: string;
  creator?: IUser;
  labelIds: string[];
  labels?: ILabel[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage: number;
  comments?: IComment[];
  attachments?: IAttachment[];
  checklists?: IChecklist[];
  dependencies?: string[];
  blockers?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  archivedAt?: Date;
}

export interface IColumn {
  id: string;
  title: string;
  position: number;
  boardId: string;
  taskIds: string[];
  tasks?: ITask[];
  color?: string;
  wipLimit?: number;
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IBoard {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  columns: IColumn[];
  columnOrder: string[];
  visibility: BoardVisibility;
  background?: string;
  isArchived: boolean;
  labels: ILabel[];
  memberIds: string[];
  members?: IUser[];
  adminIds: string[];
  admins?: IUser[];
  creatorId: string;
  creator?: IUser;
  settings: IBoardSettings;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IBoardSettings {
  enableDueDates: boolean;
  enableTimeTracking: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
  enableChecklists: boolean;
  enableLabels: boolean;
  enableCustomFields: boolean;
  autoArchiveCompletedTasks: boolean;
  autoArchiveDays?: number;
  emailNotifications: boolean;
  slackIntegration?: {
    webhookUrl: string;
    channel: string;
    enabled: boolean;
  };
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  key: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  progress: number;
  ownerId: string;
  owner?: IUser;
  memberIds: string[];
  members?: IUser[];
  boardIds: string[];
  boards?: IBoard[];
  tags?: string[];
  isPublic: boolean;
  clientId?: string;
  client?: IUser;
  departmentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ITaskActivity {
  id: string;
  type: 'created' | 'updated' | 'moved' | 'assigned' | 'commented' | 'completed' | 'archived' | 'restored';
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IDragDropContext {
  dragging: boolean;
  draggedTask?: ITask;
  draggedFrom?: {
    columnId: string;
    index: number;
  };
  dragOverColumn?: string;
}

export interface ITaskFilter {
  assigneeIds?: string[];
  labelIds?: string[];
  priority?: TaskPriority[];
  status?: TaskStatus[];
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
  search?: string;
  hasAttachments?: boolean;
  hasComments?: boolean;
  isOverdue?: boolean;
  completionPercentage?: {
    min?: number;
    max?: number;
  };
}

export interface IBoardFilters {
  projectIds?: string[];
  visibility?: BoardVisibility[];
  memberIds?: string[];
  isArchived?: boolean;
  search?: string;
}

export interface IProjectFilters {
  status?: ProjectStatus[];
  priority?: TaskPriority[];
  ownerId?: string;
  clientId?: string;
  departmentId?: string;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface ITaskCreateRequest {
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  projectId: string;
  priority?: TaskPriority;
  assigneeIds?: string[];
  labelIds?: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ITaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeIds?: string[];
  labelIds?: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ITaskMoveRequest {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
  boardId: string;
}

export interface IColumnCreateRequest {
  title: string;
  boardId: string;
  position?: number;
  color?: string;
  wipLimit?: number;
}

export interface IColumnUpdateRequest {
  title?: string;
  color?: string;
  wipLimit?: number;
  isCollapsed?: boolean;
}

export interface IColumnReorderRequest {
  boardId: string;
  columnOrder: string[];
}

export interface IBoardCreateRequest {
  title: string;
  description?: string;
  projectId: string;
  visibility?: BoardVisibility;
  background?: string;
  memberIds?: string[];
  adminIds?: string[];
  templateId?: string;
}

export interface IBoardUpdateRequest {
  title?: string;
  description?: string;
  visibility?: BoardVisibility;
  background?: string;
  memberIds?: string[];
  adminIds?: string[];
  settings?: Partial<IBoardSettings>;
}

export interface IProjectCreateRequest {
  name: string;
  description?: string;
  key: string;
  priority?: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  memberIds?: string[];
  clientId?: string;
  departmentId?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface IProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  memberIds?: string[];
  clientId?: string;
  departmentId?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface INotification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'comment_mention' | 'project_update' | 'board_invitation';
  title: string;
  message: string;
  entityId: string;
  entityType: 'task' | 'project' | 'board' | 'comment';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface ITimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  hours: number;
  startTime: Date;
  endTime?: Date;
  isRunning: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ITemplate {
  id: string;
  name: string;
  description?: string;
  type: 'board' | 'project';
  template: IBoardCreateRequest | IProjectCreateRequest;
  isPublic: boolean;
  creatorId: string;
  usageCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Import IUser from main types file
import { IUser } from './index';

// Role-based permissions and capabilities
export type UserRole = 'admin' | 'hr' | 'employee' | 'client';

export interface IRolePermissions {
  // Project permissions
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canEditAllProjects: boolean;
  canEditOwnProjects: boolean;
  canViewAllProjects: boolean;
  canViewAssignedProjects: boolean;
  canArchiveProject: boolean;

  // Board permissions
  canCreateBoard: boolean;
  canDeleteBoard: boolean;
  canEditBoardSettings: boolean;
  canInviteBoardMembers: boolean;
  canRemoveBoardMembers: boolean;
  canArchiveBoard: boolean;

  // Task permissions
  canCreateTask: boolean;
  canDeleteTask: boolean;
  canEditAllTasks: boolean;
  canEditAssignedTasks: boolean;
  canAssignTasks: boolean;
  canMoveTasksBetweenColumns: boolean;
  canSetTaskPriority: boolean;
  canSetTaskDueDate: boolean;
  canAddTaskComments: boolean;
  canAddTaskAttachments: boolean;
  canViewTaskTimeTracking: boolean;
  canEditTaskTimeTracking: boolean;

  // Column permissions
  canCreateColumn: boolean;
  canDeleteColumn: boolean;
  canReorderColumns: boolean;
  canSetWipLimits: boolean;

  // User management permissions
  canViewAllUsers: boolean;
  canManageProjectMembers: boolean;
  canViewReports: boolean;
  canExportData: boolean;

  // Administrative permissions
  canManageTemplates: boolean;
  canManageIntegrations: boolean;
  canViewSystemActivity: boolean;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, IRolePermissions> = {
  admin: {
    // Project permissions - Admin has full access
    canCreateProject: true,
    canDeleteProject: true,
    canEditAllProjects: true,
    canEditOwnProjects: true,
    canViewAllProjects: true,
    canViewAssignedProjects: true,
    canArchiveProject: true,

    // Board permissions - Full access
    canCreateBoard: true,
    canDeleteBoard: true,
    canEditBoardSettings: true,
    canInviteBoardMembers: true,
    canRemoveBoardMembers: true,
    canArchiveBoard: true,

    // Task permissions - Full access
    canCreateTask: true,
    canDeleteTask: true,
    canEditAllTasks: true,
    canEditAssignedTasks: true,
    canAssignTasks: true,
    canMoveTasksBetweenColumns: true,
    canSetTaskPriority: true,
    canSetTaskDueDate: true,
    canAddTaskComments: true,
    canAddTaskAttachments: true,
    canViewTaskTimeTracking: true,
    canEditTaskTimeTracking: true,

    // Column permissions - Full access
    canCreateColumn: true,
    canDeleteColumn: true,
    canReorderColumns: true,
    canSetWipLimits: true,

    // User management permissions - Full access
    canViewAllUsers: true,
    canManageProjectMembers: true,
    canViewReports: true,
    canExportData: true,

    // Administrative permissions - Full access
    canManageTemplates: true,
    canManageIntegrations: true,
    canViewSystemActivity: true,
  },

  hr: {
    // Project permissions - Can manage projects for team oversight
    canCreateProject: true,
    canDeleteProject: false,
    canEditAllProjects: true,
    canEditOwnProjects: true,
    canViewAllProjects: true,
    canViewAssignedProjects: true,
    canArchiveProject: true,

    // Board permissions - Can manage boards
    canCreateBoard: true,
    canDeleteBoard: false,
    canEditBoardSettings: true,
    canInviteBoardMembers: true,
    canRemoveBoardMembers: true,
    canArchiveBoard: true,

    // Task permissions - Can manage tasks for oversight
    canCreateTask: true,
    canDeleteTask: false,
    canEditAllTasks: true,
    canEditAssignedTasks: true,
    canAssignTasks: true,
    canMoveTasksBetweenColumns: true,
    canSetTaskPriority: true,
    canSetTaskDueDate: true,
    canAddTaskComments: true,
    canAddTaskAttachments: true,
    canViewTaskTimeTracking: true,
    canEditTaskTimeTracking: false,

    // Column permissions - Limited access
    canCreateColumn: true,
    canDeleteColumn: false,
    canReorderColumns: true,
    canSetWipLimits: true,

    // User management permissions - Can manage team members
    canViewAllUsers: true,
    canManageProjectMembers: true,
    canViewReports: true,
    canExportData: true,

    // Administrative permissions - Limited access
    canManageTemplates: true,
    canManageIntegrations: false,
    canViewSystemActivity: true,
  },

  employee: {
    // Project permissions - Can work on assigned projects
    canCreateProject: false,
    canDeleteProject: false,
    canEditAllProjects: false,
    canEditOwnProjects: false,
    canViewAllProjects: false,
    canViewAssignedProjects: true,
    canArchiveProject: false,

    // Board permissions - Limited to assigned boards
    canCreateBoard: false,
    canDeleteBoard: false,
    canEditBoardSettings: false,
    canInviteBoardMembers: false,
    canRemoveBoardMembers: false,
    canArchiveBoard: false,

    // Task permissions - Can manage own tasks
    canCreateTask: true,
    canDeleteTask: false,
    canEditAllTasks: false,
    canEditAssignedTasks: true,
    canAssignTasks: false,
    canMoveTasksBetweenColumns: true,
    canSetTaskPriority: false,
    canSetTaskDueDate: false,
    canAddTaskComments: true,
    canAddTaskAttachments: true,
    canViewTaskTimeTracking: true,
    canEditTaskTimeTracking: true,

    // Column permissions - No access
    canCreateColumn: false,
    canDeleteColumn: false,
    canReorderColumns: false,
    canSetWipLimits: false,

    // User management permissions - Limited access
    canViewAllUsers: false,
    canManageProjectMembers: false,
    canViewReports: false,
    canExportData: false,

    // Administrative permissions - No access
    canManageTemplates: false,
    canManageIntegrations: false,
    canViewSystemActivity: false,
  },

  client: {
    // Project permissions - Can view own projects
    canCreateProject: false,
    canDeleteProject: false,
    canEditAllProjects: false,
    canEditOwnProjects: false,
    canViewAllProjects: false,
    canViewAssignedProjects: true,
    canArchiveProject: false,

    // Board permissions - View only
    canCreateBoard: false,
    canDeleteBoard: false,
    canEditBoardSettings: false,
    canInviteBoardMembers: false,
    canRemoveBoardMembers: false,
    canArchiveBoard: false,

    // Task permissions - Can comment and view
    canCreateTask: true,
    canDeleteTask: false,
    canEditAllTasks: false,
    canEditAssignedTasks: false,
    canAssignTasks: false,
    canMoveTasksBetweenColumns: false,
    canSetTaskPriority: false,
    canSetTaskDueDate: false,
    canAddTaskComments: true,
    canAddTaskAttachments: true,
    canViewTaskTimeTracking: false,
    canEditTaskTimeTracking: false,

    // Column permissions - No access
    canCreateColumn: false,
    canDeleteColumn: false,
    canReorderColumns: false,
    canSetWipLimits: false,

    // User management permissions - No access
    canViewAllUsers: false,
    canManageProjectMembers: false,
    canViewReports: false,
    canExportData: false,

    // Administrative permissions - No access
    canManageTemplates: false,
    canManageIntegrations: false,
    canViewSystemActivity: false,
  },
};

// Helper function to get permissions for a user role
export function getRolePermissions(role: UserRole): IRolePermissions {
  return ROLE_PERMISSIONS[role];
}

// Helper function to check if user has specific permission
export function hasPermission(userRole: UserRole, permission: keyof IRolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission];
}

// Context-aware permission checking
export interface IPermissionContext {
  userRole: UserRole;
  userId: string;
  projectOwnerId?: string;
  taskAssigneeIds?: string[];
  boardMemberIds?: string[];
  boardAdminIds?: string[];
}

export function canUserPerformAction(
  context: IPermissionContext,
  action: keyof IRolePermissions,
  entityOwnerId?: string
): boolean {
  const basePermission = hasPermission(context.userRole, action);
  
  // If user doesn't have base permission, deny
  if (!basePermission) return false;
  
  // Additional context-based checks
  switch (action) {
    case 'canEditOwnProjects':
      return context.projectOwnerId === context.userId;
    
    case 'canEditAssignedTasks':
      return context.taskAssigneeIds?.includes(context.userId) || false;
    
    case 'canViewAssignedProjects':
      return context.boardMemberIds?.includes(context.userId) || 
             context.projectOwnerId === context.userId;
    
    default:
      return basePermission;
  }
}