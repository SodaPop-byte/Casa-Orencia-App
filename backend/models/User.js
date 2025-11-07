const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
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
  birthday: {
    type: Date,
    required: false 
  },
  role: {
    type: String,
    enum: ['reseller', 'admin'],
    default: 'reseller'
  }
}, { 
    timestamps: true,
    // CRITICAL FIX: Ensure the ID is always treated as a simple string 
    toJSON: { virtuals: true, getters: true } 
});

module.exports = mongoose.model('User', UserSchema);