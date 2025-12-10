import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: Date;
  city: string;
  client: mongoose.Types.ObjectId;
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  city: {
    type: String, 
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  }
}, { timestamps: true });

export default mongoose.model<IJob>('Job', jobSchema);