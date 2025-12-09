const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    default: '',
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

module.exports = mongoose.model('User', userSchema);