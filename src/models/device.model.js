const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  userId: {
    type: String,
    required: false // để tạo device cho admin
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  }
},{timestamps: true});

module.exports = mongoose.model('Device', deviceSchema); 