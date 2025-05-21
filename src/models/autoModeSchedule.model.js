const mongoose = require('mongoose');

const autoModeScheduleSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  userId: { // User who set or last modified this auto schedule
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
  // Auto mode specific configuration
  startTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  daysOfWeek: {
    type: [String], // ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    required: true
  },
  deviceStatus: { // The status the device should be set to during the active period
    type: Boolean, // true = on (active), false = off (inactive)
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AutoModeSchedule', autoModeScheduleSchema); 