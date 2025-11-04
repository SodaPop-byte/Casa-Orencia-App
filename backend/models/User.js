const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- NEW ---
  name: {
    type: String,
    required: true
  },
  // --- END NEW ---
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // --- NEW ---
  birthday: {
    type: Date,
    required: false // Make it optional
  },
  // --- END NEW ---
  role: {
    type: String,
    enum: ['reseller', 'admin'],
    default: 'reseller'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);