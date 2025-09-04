import mongoose, { Schema, Model } from 'mongoose';
import { ITemplate } from '@/types/project-management';

const TemplateSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['board', 'project'],
    required: [true, 'Template type is required']
  },
  template: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Template data is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
TemplateSchema.index({ type: 1 });
TemplateSchema.index({ isPublic: 1 });
TemplateSchema.index({ creatorId: 1 });
TemplateSchema.index({ usageCount: -1 });
TemplateSchema.index({ name: 'text', description: 'text' });

// Transform _id to id when converting to JSON
TemplateSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
TemplateSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to increment usage count
TemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to get popular templates
TemplateSchema.statics.getPopularTemplates = async function(type?: string, limit: number = 10) {
  const query: any = { isPublic: true };
  if (type) query.type = type;
  
  return await this.find(query)
    .sort({ usageCount: -1 })
    .limit(limit)
    .populate('creatorId', 'name email');
};

const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;