const mongoose = require('mongoose');

const addmemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    required: false
  },
  avatarURL: {
    type: String,
    default: ''
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  }
});

module.exports = mongoose.model('Addmember', addmemberSchema);