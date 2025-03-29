const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatarURL: {
    type: String,
    default: '' // URL mặc định cho avatar
  },
  role: {
    type: String,
    enum: ['user', 'admin','superadmin'], // Chỉ cho phép 2 giá trị này
    default: 'user'
  },
  otp: {
    type: String,
    default: ''
  },
  otpExpires: {
    type: Date,
  }
},{timestamps: true});


module.exports = mongoose.model('User', userSchema); 