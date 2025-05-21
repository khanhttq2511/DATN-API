const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  totalSensor: {
    type: Number,
    required: false,
    default : 0
  },
  totalDevice: {
    type: Number,
    required: false,
    default : 0
  },
  type: {
    type: String,
    required: false,
  },
  userId: { 
    type: String,
    required: false
  },
  allowDevice: {
    type: Array,
    required: false,
    default: []
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  area: {
    type: String,
    required: false,
    enum: ['outside', 'inside']
  },
  isAuto: {
    type: Boolean,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: false,
  },
},{timestamps: true});
roomSchema.pre('save', async function(next) {
  if(this.type === 'bedroom') {
    this.allowDevice = ['fan'];
  }
  else if (this.type === 'kitchen') { 
    this.allowDevice = ['light', 'fan'];
  }
  else if (this.type === 'livingroom') {
    this.allowDevice = ['light'];
  }
  else if (this.type === 'movieroom') {
    this.allowDevice = ['light', 'fan'];
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema); 

