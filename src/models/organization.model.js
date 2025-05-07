const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho một thành viên trong mảng members
// (Giữ schema riêng cho subdocument vẫn tốt cho việc đọc code)
const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ID của User model
    ref: 'User', // Tên của User model
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'member'], // Chỉ chấp nhận giá trị 'owner' hoặc 'member'
    required: true,
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['rejected', 'joined', 'pending'],
    default: 'pending',
  },
  email: {
    type: String,
    required: false
  },
  avatarURL: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    required: false
  },

}, { _id: false }); // Không tạo _id riêng cho mỗi sub-document thành viên

// Định nghĩa schema chính cho Organization theo style tương tự user.model.js
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ID của User model (người tạo)
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    members: {
      type: [memberSchema], // Mảng chứa các đối tượng theo memberSchema
      // Lưu ý: Middleware pre('save') đã bị loại bỏ để giống user.model.js
      // Logic đảm bảo owner có trong members cần được xử lý ở service.
      // Validation đảm bảo không rỗng cũng có thể chuyển sang service hoặc để lại đây.
       validate: [
         (members) => members && members.length > 0, // Cần kiểm tra members tồn tại trước khi truy cập length
         'Organization must have at least one member',
       ],
       default: undefined, // Tránh tạo mảng rỗng tự động
    },
  },
  {
    timestamps: true, // Giữ lại timestamps vì nó rất phổ biến và hữu ích
    // Bỏ virtuals vì user.model.js không có và chúng ta đã bỏ virtual 'owner'
  }
);


// Export model theo style của user.model.js
module.exports = mongoose.model('Organization', organizationSchema); 