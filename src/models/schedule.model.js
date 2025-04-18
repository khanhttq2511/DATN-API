const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },  
  userId: {
    type: String,
    required: true
  },
  organizationId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
}, {timestamps: true});

module.exports = mongoose.model('Schedule', scheduleSchema);