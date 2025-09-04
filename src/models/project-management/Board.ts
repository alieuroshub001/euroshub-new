import mongoose, { Schema, Model } from 'mongoose';
import { IBoard } from '@/types/project-management';

const BoardSettingsSchema: Schema = new Schema({
  enableDueDates: { type: Boolean, default: true },
  enableTimeTracking: { type: Boolean, default: true },
  enableComments: { type: Boolean, default: true },
  enableAttachments: { type: Boolean, default: true },
  enableChecklists: { type: Boolean, default: true },
  enableLabels: { type: Boolean, default: true },
  enableCustomFields: { type: Boolean, default: false },
  autoArchiveCompletedTasks: { type: Boolean, default: false },
  autoArchiveDays: { 
    type: Number,
    min: 1,
    max: 365,
    default: 30
  },
  emailNotifications: { type: Boolean, default: true },
  slackIntegration: {
    webhookUrl: { type: String },
    channel: { type: String },
    enabled: { type: Boolean, default: false }
  }
}, { _id: false });

const LabelSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [50, 'Label name cannot exceed 50 characters']
  },
  color: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  }
}, {
  timestamps: true
});

const BoardSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [100, 'Board title cannot exceed 100 characters']
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  columnOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column'
  }],
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'team'
  },
  background: {
    type: String,
    default: '#ffffff'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  memberIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Board creator is required']
  },
  settings: {
    type: BoardSettingsSchema,
    default: () => ({})
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
BoardSchema.index({ projectId: 1 });
BoardSchema.index({ creatorId: 1 });
BoardSchema.index({ memberIds: 1 });
BoardSchema.index({ isArchived: 1 });
BoardSchema.index({ title: 'text', description: 'text' });

// Transform _id to id when converting to JSON
BoardSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Virtual for populated fields
BoardSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true
});

BoardSchema.virtual('members', {
  ref: 'User',
  localField: 'memberIds',
  foreignField: '_id'
});

BoardSchema.virtual('admins', {
  ref: 'User',
  localField: 'adminIds',
  foreignField: '_id'
});

BoardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'boardId'
});

BoardSchema.virtual('labels', {
  ref: 'Label',
  localField: '_id',
  foreignField: 'boardId'
});

// Pre-save middleware
BoardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  
  // Ensure creator is in adminIds
  const adminIds = this.adminIds as mongoose.Types.ObjectId[];
  const memberIds = this.memberIds as mongoose.Types.ObjectId[];
  const creatorId = this.creatorId as mongoose.Types.ObjectId;
  
  if (!adminIds.some(id => id.equals(creatorId))) {
    adminIds.push(creatorId);
  }
  
  // Ensure admins are in memberIds
  adminIds.forEach((adminId: mongoose.Types.ObjectId) => {
    if (!memberIds.some(id => id.equals(adminId))) {
      memberIds.push(adminId);
    }
  });
  
  next();
});

// Pre-remove middleware to clean up related data
BoardSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove related columns and their tasks
    const columns = await mongoose.model('Column').find({ boardId: this._id });
    for (const column of columns) {
      await mongoose.model('Task').deleteMany({ columnId: column._id });
    }
    await mongoose.model('Column').deleteMany({ boardId: this._id });
    
    // Remove labels
    await mongoose.model('Label').deleteMany({ boardId: this._id });
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Board: Model<IBoard> =
  mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);

// Create Label model
const Label: Model<any> =
  mongoose.models.Label || mongoose.model('Label', LabelSchema);

export default Board;
export { Label };