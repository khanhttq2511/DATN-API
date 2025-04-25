const express = require('express');
const router = express.Router();
const notifyController = require('../controllers/notify.controller');
const { protect } = require('../middleware');

// Route kiểm tra xác thực
router.get('/test-auth', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      email: req.user.email
    }
  });
});

// Tạo thông báo mới
router.post('/', protect, notifyController.createNotify);

// Lấy tất cả thông báo cho người dùng hiện tại
router.get('/me', protect, notifyController.getUserNotifications);

// Lấy thông báo theo ID
router.get('/:id', protect, notifyController.getNotifyById);

// Cập nhật thông báo
router.put('/:id', protect, notifyController.updateNotify);

// Đánh dấu thông báo đã đọc
router.patch('/:id/read', protect, notifyController.markAsRead);

// Xóa thông báo
router.delete('/:id', protect, notifyController.deleteNotify);

// Lấy thông báo theo ID thiết bị
router.get('/device/:deviceId', protect, notifyController.getNotifyByDeviceId);

// Lấy thông báo theo loại thiết bị
router.get('/type/:deviceType', protect, notifyController.getNotifyByDeviceType);

// Đánh dấu tất cả thông báo là đã đọc cho người dùng hiện tại
router.patch('/read/all', protect, notifyController.markAllAsRead);

// Lấy số lượng thông báo chưa đọc
router.get('/unread/count', protect, notifyController.getUnreadCount);

// Tạo thông báo cảnh báo từ cảm biến
router.post('/sensor-alert', protect, notifyController.createSensorAlert);

module.exports = router;
