import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ApprovedUser as IApprovedUser } from '../types/auth';

export interface UserDocument extends Omit<IApprovedUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  profileData?: {
    dateOfBirth?: Date;
    address?: string;
    department?: string;
    position?: string;
    startDate?: Date;
    emergencyContact?: string;
    skills?: string[];
    bio?: string;
  };
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'hr', 'client', 'employee']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  employeeId: {
    type: String,
    sparse: true,
    unique: true
  },
  clientId: {
    type: String,
    sparse: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  profileData: {
    dateOfBirth: { type: Date },
    address: { type: String },
    department: { type: String },
    position: { type: String },
    startDate: { type: Date },
    emergencyContact: { type: String },
    skills: [{ type: String }],
    bio: { type: String }
  }
}, {
  timestamps: true
});

UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ employeeId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { employeeId: { $exists: true, $ne: null } }
});

UserSchema.index({ clientId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { clientId: { $exists: true, $ne: null } }
});

export default mongoose.model<UserDocument>('User', UserSchema);