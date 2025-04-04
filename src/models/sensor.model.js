const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  name: { //tên đầy đủ của cảm biến
    type: String,
    required: false,
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
    default: '',
    // đơn vị của cảm biến được xác định theo type của cảm biến
    enum: ['°C', '%', 'lux', '']
    // nếu type là temperature thì đơn vị là °C
    // nếu type là humidity thì đơn vị là %
    // nếu type là light thì đơn vị là lux
    // nếu type là motion thì đơn vị là ''
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
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
},{timestamps: true});

module.exports = mongoose.model('Sensor', sensorSchema); 