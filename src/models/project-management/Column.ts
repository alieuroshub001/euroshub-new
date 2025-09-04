import mongoose, { Schema, Model } from 'mongoose';
import { IColumn } from '@/types/project-management';

const ColumnSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Column title is required'],
    trim: true,
    maxlength: [50, 'Column title cannot exceed 50 characters']
  },
  position: {
    type: Number,
    required: [true, 'Column position is required'],
    min: 0
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Board ID is required']
  },
  taskIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  color: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  wipLimit: {
    type: Number,
    min: [1, 'WIP limit must be at least 1'],
    max: [100, 'WIP limit cannot exceed 100']
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique position within a board
ColumnSchema.index({ boardId: 1, position: 1 }, { unique: true });
ColumnSchema.index({ boardId: 1 });

// Transform _id to id when converting to JSON
ColumnSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Virtual for populated tasks
ColumnSchema.virtual('tasks', {
  ref: 'Task',
  localField: 'taskIds',
  foreignField: '_id'
});

// Pre-save middleware
ColumnSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method to reorder columns
ColumnSchema.statics.reorderColumns = async function(boardId: string, newOrder: string[]) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Update positions based on new order
    for (let i = 0; i < newOrder.length; i++) {
      await this.findByIdAndUpdate(
        newOrder[i],
        { position: i },
        { session }
      );
    }
    
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Pre-remove middleware to clean up tasks
ColumnSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove all tasks in this column
    await mongoose.model('Task').deleteMany({ columnId: this._id });
    
    // Update board's columnOrder
    await mongoose.model('Board').updateOne(
      { _id: this.boardId },
      { $pull: { columnOrder: this._id } }
    );
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to add task to column
ColumnSchema.methods.addTask = function(taskId: string, position?: number) {
  if (position !== undefined && position >= 0 && position <= this.taskIds.length) {
    this.taskIds.splice(position, 0, new mongoose.Types.ObjectId(taskId));
  } else {
    this.taskIds.push(new mongoose.Types.ObjectId(taskId));
  }
  return this.save();
};

// Method to remove task from column
ColumnSchema.methods.removeTask = function(taskId: string) {
  this.taskIds = this.taskIds.filter((id: mongoose.Types.ObjectId) => 
    !id.equals(new mongoose.Types.ObjectId(taskId))
  );
  return this.save();
};

// Method to move task within column
ColumnSchema.methods.moveTask = function(taskId: string, newPosition: number) {
  const taskObjectId = new mongoose.Types.ObjectId(taskId);
  const currentIndex = this.taskIds.findIndex((id: mongoose.Types.ObjectId) => 
    id.equals(taskObjectId)
  );
  
  if (currentIndex === -1) return this;
  
  // Remove task from current position
  this.taskIds.splice(currentIndex, 1);
  
  // Insert at new position
  const insertIndex = Math.min(newPosition, this.taskIds.length);
  this.taskIds.splice(insertIndex, 0, taskObjectId);
  
  return this.save();
};

const Column: Model<IColumn> =
  mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema);

export default Column;