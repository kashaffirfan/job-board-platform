import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
  city: string;
  skills: string[];
  bio: string;
  portfolio: string;
  experience: string;
  profilePicture: string;
  companyName: string;
  companyDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    required: true, 
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true, 
  },
  city: {
    type: String,
    required: true, 
  },
  skills: {
    type: [String], 
    default: [],
  },
  bio: {
    type: String,
    default: "" 
  },
  portfolio: { 
    type: String, 
    default: "" 
  },
  experience: {
    type: String, 
    default: '',
  },
  profilePicture: {
    type: String, 
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  companyDescription: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);