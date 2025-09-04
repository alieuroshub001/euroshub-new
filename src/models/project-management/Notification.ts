import mongoose, { Schema, Model } from 'mongoose';
import { INotification } from '@/types/project-management';

const NotificationSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_due', 'task_completed', 'comment_mention', 'project_update', 'board_invitation'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  entityType: {
    type: String,
    enum: ['task', 'project', 'board', 'comment'],
    required: [true, 'Entity type is required']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
});

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ entityId: 1, entityType: 1 });

// Transform _id to id when converting to JSON
NotificationSchema.set('toJSON', {
  transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
NotificationSchema.pre('save', function (next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  } else if (!this.isRead) {
    this.readAt = undefined;
  }
  next();
});

// Static method to create notification
NotificationSchema.statics.createNotification = async function(
  userId: string,
  type: string,
  title: string,
  message: string,
  entityId: string,
  entityType: string
) {
  return await this.create({
    userId,
    type,
    title,
    message,
    entityId,
    entityType
  });
};

// Static method to mark as read
NotificationSchema.statics.markAsRead = async function(notificationIds: string[], userId: string) {
  return await this.updateMany(
    { _id: { $in: notificationIds }, userId },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to mark all as read for user
NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;