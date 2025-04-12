const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  deviceId: {
    type: String,
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
  action: {
    type: String,
    required: true
  },
  roomId: {
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
  roomType: {
    type: String,
    required: true
  },
  organizationId: {
    type: String,
    required: true
  },
},{timestamps: true});

const History = mongoose.model('History', historySchema);

module.exports = History;