const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true // MongoDB sẽ tự động tạo
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatarURL: {
    type: String,
    default: 'default-avatar.png' // URL mặc định cho avatar
  },
  role: {
    type: String,
    enum: ['user', 'admin','superadmin'], // Chỉ cho phép 2 giá trị này
    default: 'user'
  }
},{timestamps: true});

// Thêm phương thức để lấy thông tin user an toàn (không bao gồm password)
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema); 