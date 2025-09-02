import mongoose, { Schema, Model, ValidatorProps } from 'mongoose';
import { IUserWithPassword } from '@/types';

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  fullname: { type: String, required: true },
  number: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid email!`
    }
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['admin', 'client', 'hr', 'employee'],
    default: 'admin'
  },
  employeeId: { 
    type: String,
    default: null
  },
  clientId: {
    type: String,
    default: null
  },
  otpEmail: { 
    type: String,
    default: function(this: any) { 
      return this.role === 'admin' ? process.env.ADMIN_OTP_EMAIL : undefined;
    }
  },
  idAssigned: { type: Boolean, default: false },
  idAssignedAt: { type: Date },
  accountStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'blocked'],
    default: function(this: any) {
      return this.role === 'admin' ? 'approved' : 'pending';
    }
  },
  statusUpdatedBy: { type: String },
  statusUpdatedAt: { type: Date },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Transform _id to id when converting to JSON
UserSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  
  // Validate euroshub email format for hr and employee roles
  if ((this.role === 'hr' || this.role === 'employee') && this.email) {
    if (!/\S+euroshub@gmail\.com$/.test(String(this.email))) {
      const error = new Error(`Email must be a euroshub email ending with euroshub@gmail.com for ${this.role} role`);
      return next(error);
    }
  }
  
  next();
});

const User: Model<IUserWithPassword> =
  mongoose.models.User || mongoose.model<IUserWithPassword>('User', UserSchema);

export default User;