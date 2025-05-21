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
  status: { // This is the target status for the device when the schedule executes
    type: String,
    enum: ['active', 'inactive'], // 'active' usually means ON, 'inactive' means OFF
    required: true
  },
  scheduledTime: { // The exact date and time this one-time schedule should execute
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);