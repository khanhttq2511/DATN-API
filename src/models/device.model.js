const { toolresults } = require('googleapis/build/src/apis/toolresults');
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    required: true
  },
  userId: {
    type: String,
    required: false // để tạo device cho admin
  },
  isActive: {
    type: Boolean,
    required: false,
    default: false
  },
  lastActive: { 
    type: Date,
    default: Date.now
  },
  organizationId: {
    type: String,
    required: true
  },
},{timestamps: true});

module.exports = mongoose.model('Device', deviceSchema); 