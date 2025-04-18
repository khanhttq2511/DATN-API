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
    // enum: ['temperature', 'humidity', 'light', 'dht', 'relay', 'acs712'] // các loại sensor
  },
  value: { //giá trị cảm biến
    type: Object,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  // isConnected: {
  //   type: Boolean,
  //   default: false
  // },
},{timestamps: true});

module.exports = mongoose.model('Sensor', sensorSchema); 