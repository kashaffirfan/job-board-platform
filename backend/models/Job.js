const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
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
    required: true, // e.g., 'Development', 'Design'
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
    type: String, // Supports "Local-Only" aspect [cite: 1]
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links job to the Client who posted it
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);