import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { PendingUser as IPendingUser } from '../types/auth';

export interface PendingUserDocument extends Omit<IPendingUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateOTP(): string;
  isOTPExpired(): boolean;
}

const PendingUserSchema = new Schema<PendingUserDocument>({
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
    enum: ['hr', 'client', 'employee']
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
  otpCode: {
    type: String,
    required: true
  },
  otpExpiry: {
    type: Date,
    required: true
  },
  isOtpVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

PendingUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

PendingUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

PendingUserSchema.methods.generateOTP = function(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

PendingUserSchema.methods.isOTPExpired = function(): boolean {
  return new Date() > this.otpExpiry;
};

export default mongoose.model<PendingUserDocument>('PendingUser', PendingUserSchema);