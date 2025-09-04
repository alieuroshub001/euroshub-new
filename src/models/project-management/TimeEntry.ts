import mongoose, { Schema, Model } from 'mongoose';
import { ITimeEntry } from '@/types/project-management';

const TimeEntrySchema: Schema = new Schema({
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
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0.1, 'Minimum time entry is 0.1 hours'],
    max: [24, 'Maximum time entry is 24 hours']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    validate: {
      validator: function(this: ITimeEntry, v: Date) {
        return !v || v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
TimeEntrySchema.index({ taskId: 1 });
TimeEntrySchema.index({ userId: 1 });
TimeEntrySchema.index({ startTime: 1 });
TimeEntrySchema.index({ isRunning: 1 });

// Transform _id to id when converting to JSON
TimeEntrySchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
TimeEntrySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  
  // Calculate hours if endTime is provided and hours not manually set
  if (this.endTime && this.startTime && !this.isModified('hours')) {
    const endTime = this.endTime as Date;
    const startTime = this.startTime as Date;
    const diffInMs = endTime.getTime() - startTime.getTime();
    this.hours = Math.round((diffInMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  }
  
  // If time entry is stopped, ensure isRunning is false
  if (this.endTime) {
    this.isRunning = false;
  }
  
  next();
});

// Static method to stop running timer
TimeEntrySchema.statics.stopRunningTimer = async function(userId: string, taskId?: string) {
  const query: any = { userId, isRunning: true };
  if (taskId) query.taskId = taskId;
  
  const runningEntry = await this.findOne(query);
  if (runningEntry) {
    runningEntry.endTime = new Date();
    runningEntry.isRunning = false;
    await runningEntry.save();
    return runningEntry;
  }
  return null;
};

const TimeEntry: Model<ITimeEntry> =
  mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;