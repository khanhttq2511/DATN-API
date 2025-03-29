const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  name: { //tên đầy đủ của cảm biến
    type: String,
    required: true,
    trim: true
  },
  type: { //loại cảm biến
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'light', 'motion'] // các loại sensor
  },
  value: { //giá trị cảm biến
    type: Object,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  
},{timestamps: true});

module.exports = mongoose.model('Sensor', sensorSchema); 