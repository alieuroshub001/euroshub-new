import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '@/types/project-management';

const ProjectSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: { 
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  key: { 
    type: String, 
    required: [true, 'Project key is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{2,10}$/.test(v);
      },
      message: 'Project key must be 2-10 uppercase letters'
    }
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: { type: Date },
  endDate: { 
    type: Date,
    validate: {
      validator: function(this: IProject, v: Date) {
        return !this.startDate || !v || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: { 
    type: Number,
    min: [0, 'Budget must be positive']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  memberIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  boardIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  departmentId: {
    type: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ key: 1 }, { unique: true });
ProjectSchema.index({ name: 'text', description: 'text' });

// Transform _id to id when converting to JSON
ProjectSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Virtual for populated fields
ProjectSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

ProjectSchema.virtual('members', {
  ref: 'User',
  localField: 'memberIds',
  foreignField: '_id'
});

ProjectSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

ProjectSchema.virtual('boards', {
  ref: 'Board',
  localField: 'boardIds',
  foreignField: '_id'
});

// Pre-save middleware
ProjectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-remove middleware to clean up related data
ProjectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove related boards
    await mongoose.model('Board').deleteMany({ projectId: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;