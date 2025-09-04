import mongoose, { Schema, Model } from 'mongoose';
import { ITask } from '@/types/project-management';

const ChecklistItemSchema: Schema = new Schema({
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [200, 'Checklist item cannot exceed 200 characters']
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { _id: true });

const ChecklistSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Checklist title cannot exceed 100 characters']
  },
  items: [ChecklistItemSchema],
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CommentSchema: Schema = new Schema({
  content: { 
    type: String, 
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  authorName: { 
    type: String, 
    required: true 
  },
  authorAvatar: { type: String },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AttachmentSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  url: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  size: { 
    type: Number, 
    required: true,
    min: 0
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: { type: Date, default: Date.now }
});

const TaskSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: { 
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  columnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: [true, 'Column ID is required']
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Board ID is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  position: {
    type: Number,
    required: [true, 'Task position is required'],
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done', 'archived'],
    default: 'todo'
  },
  assigneeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required']
  },
  labelIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  dueDate: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v >= new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  startDate: { 
    type: Date,
    validate: {
      validator: function(this: ITask, v: Date) {
        return !this.dueDate || !v || v <= this.dueDate;
      },
      message: 'Start date must be before due date'
    }
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours must be positive'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours must be positive'],
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  blockers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archivedAt: { type: Date }
});

// Compound index to ensure unique position within a column
TaskSchema.index({ columnId: 1, position: 1 }, { unique: true });
TaskSchema.index({ boardId: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assigneeIds: 1 });
TaskSchema.index({ creatorId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

// Transform _id to id when converting to JSON
TaskSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Virtual for populated fields
TaskSchema.virtual('assignees', {
  ref: 'User',
  localField: 'assigneeIds',
  foreignField: '_id'
});

TaskSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true
});

TaskSchema.virtual('labels', {
  ref: 'Label',
  localField: 'labelIds',
  foreignField: '_id'
});

TaskSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'taskId'
});

TaskSchema.virtual('attachments', {
  ref: 'Attachment',
  localField: '_id',
  foreignField: 'taskId'
});

TaskSchema.virtual('checklists', {
  ref: 'Checklist',
  localField: '_id',
  foreignField: 'taskId'
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== 'done';
});

// Pre-save middleware
TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  
  // Auto-update completion percentage based on status
  if (this.status === 'done' && (this.completionPercentage as number) < 100) {
    this.completionPercentage = 100;
  }
  
  // Set archivedAt when status is archived
  if (this.status === 'archived' && !this.archivedAt) {
    this.archivedAt = new Date();
  } else if (this.status !== 'archived') {
    this.archivedAt = undefined;
  }
  
  next();
});

// Static method to move task between columns
TaskSchema.statics.moveTask = async function(
  taskId: string, 
  sourceColumnId: string, 
  destinationColumnId: string, 
  newPosition: number
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const task = await this.findById(taskId).session(session);
    if (!task) throw new Error('Task not found');
    
    // Update task's column
    task.columnId = destinationColumnId;
    task.position = newPosition;
    await task.save({ session });
    
    // Update column task arrays
    await mongoose.model('Column').findByIdAndUpdate(
      sourceColumnId,
      { $pull: { taskIds: taskId } },
      { session }
    );
    
    await mongoose.model('Column').findByIdAndUpdate(
      destinationColumnId,
      { $addToSet: { taskIds: taskId } },
      { session }
    );
    
    await session.commitTransaction();
    return task;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Pre-remove middleware
TaskSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove from column's taskIds
    await mongoose.model('Column').updateOne(
      { _id: this.columnId },
      { $pull: { taskIds: this._id } }
    );
    
    // Remove related data
    await mongoose.model('Comment').deleteMany({ taskId: this._id });
    await mongoose.model('Attachment').deleteMany({ taskId: this._id });
    await mongoose.model('Checklist').deleteMany({ taskId: this._id });
    await mongoose.model('TimeEntry').deleteMany({ taskId: this._id });
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

// Create supporting models
const Comment: Model<any> =
  mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

const Attachment: Model<any> =
  mongoose.models.Attachment || mongoose.model('Attachment', AttachmentSchema);

const Checklist: Model<any> =
  mongoose.models.Checklist || mongoose.model('Checklist', ChecklistSchema);

export default Task;
export { Comment, Attachment, Checklist };