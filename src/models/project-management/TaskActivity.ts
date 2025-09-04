import mongoose, { Schema, Model } from 'mongoose';
import { ITaskActivity } from '@/types/project-management';

const TaskActivitySchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['created', 'updated', 'moved', 'assigned', 'commented', 'completed', 'archived', 'restored'],
    required: [true, 'Activity type is required']
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  userAvatar: { type: String },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
TaskActivitySchema.index({ taskId: 1, createdAt: -1 });
TaskActivitySchema.index({ userId: 1 });
TaskActivitySchema.index({ type: 1 });

// Transform _id to id when converting to JSON
TaskActivitySchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to log activity
TaskActivitySchema.statics.logActivity = async function(
  taskId: string,
  userId: string,
  userName: string,
  type: string,
  description: string,
  oldValue?: any,
  newValue?: any,
  metadata?: any
) {
  return await this.create({
    taskId,
    userId,
    userName,
    type,
    description,
    oldValue,
    newValue,
    metadata
  });
};

const TaskActivity: Model<ITaskActivity> =
  mongoose.models.TaskActivity || mongoose.model<ITaskActivity>('TaskActivity', TaskActivitySchema);

export default TaskActivity;