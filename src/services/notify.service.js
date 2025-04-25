const Notify = require('../models/notify.model');
const Organization = require('../models/organization.model');

class NotifyService {
  async createNotify(notify) {
    return Notify.create(notify);
  }

  async getNotify(notify) {
    return Notify.find(notify).sort({ createdAt: -1 });
  }

  async updateNotify(notify) {
    return Notify.findByIdAndUpdate(notify._id, notify, { new: true });
  }

  async deleteNotify(notify) {
    return Notify.findByIdAndDelete(notify._id);
  }

  async getNotifyByDeviceId(deviceId) {
    return Notify.find({ deviceId }).sort({ createdAt: -1 });
  }

  async getNotifyByDeviceType(deviceType) {
    return Notify.find({ deviceType }).sort({ createdAt: -1 });
  }

  async getNotifyByDeviceIdAndDeviceType(deviceId, deviceType) {
    return Notify.find({ deviceId, deviceType }).sort({ createdAt: -1 });
  }
  
  // Đánh dấu tất cả thông báo là đã đọc cho một người dùng
  async markAllAsRead(userId) {
    return Notify.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }
  
  // Lấy số lượng thông báo chưa đọc cho một người dùng
  async getUnreadCount(userId) {
    return Notify.countDocuments({ userId, isRead: false });
  }
  
  // Lấy thông báo phân trang cho một người dùng
  async getUserNotificationsPaginated(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const notifications = await Notify.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Notify.countDocuments({ userId });
    
    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  // Tạo thông báo hệ thống cho nhiều người dùng
  async createSystemNotification(title, content, userIds, type = 'info') {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      content,
      isRead: false
    }));
    
    return Notify.insertMany(notifications);
  }
  
  // Xóa tất cả thông báo cho một người dùng
  async deleteAllUserNotifications(userId) {
    return Notify.deleteMany({ userId });
  }
  
  // Xóa các thông báo cũ hơn số ngày chỉ định
  async deleteOldNotifications(days = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    return Notify.deleteMany({ createdAt: { $lt: dateThreshold } });
  }

  // Tạo thông báo cho tất cả thành viên trong tổ chức khi cảm biến vượt ngưỡng
  async createSensorAlertNotification(organizationId, sensorData) {
    try {
      console.log("sensorData", sensorData)
      // Lấy thông tin tổ chức
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Không tìm thấy tổ chức');
      }

      // Xác định loại thông báo và nội dung dựa trên loại cảm biến và giá trị
      let title = '';
      let content = '';
      let type = 'warning';

      switch(sensorData.sensorType) {
        case 'temperature':
          if (sensorData.value >= 32) {
            title = 'Cảnh báo nhiệt độ cao';
            content = `Nhiệt độ đã đạt mức ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          } else if (sensorData.value <= 18) {
            title = 'Cảnh báo nhiệt độ thấp';
            content = `Nhiệt độ đã giảm xuống ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          }
          break;
        case 'humidity':
          if (sensorData.value > 75) {
            title = 'Cảnh báo độ ẩm cao';
            content = `Độ ẩm đã đạt mức ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          } else if (sensorData.value < 40) {
            title = 'Cảnh báo độ ẩm thấp';
            content = `Độ ẩm đã giảm xuống ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          }
          break;
        case 'ppm':
          if (sensorData.value > 800) {
            title = 'Cảnh báo khí gas nguy hiểm';
            content = `Nồng độ khí gas đã đạt mức nguy hiểm ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          } else if (sensorData.value > 600) {
            title = 'Cảnh báo khí gas cao';
            content = `Nồng độ khí gas đã vượt ngưỡng ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'warning';
          }
          break;
        case 'lightLevel':
          if (sensorData.value < 100) {
            title = 'Cảnh báo thiếu ánh sáng';
            content = `Cường độ ánh sáng quá thấp ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'info';
          } else if (sensorData.value > 1000) {
            title = 'Cảnh báo ánh sáng quá mạnh';
            content = `Cường độ ánh sáng quá cao ${sensorData.value}${sensorData.unit} tại ${sensorData.roomName}`;
            type = 'info';
          }
          break;
        default:
          title = 'Cảnh báo từ cảm biến';
          content = `Cảm biến đã phát hiện giá trị bất thường: ${sensorData.value}${sensorData.unit}`;
      }

      // Nếu không có nội dung thông báo (không vượt ngưỡng), không tạo thông báo
      if (!title || !content) {
        return null;
      }

      // Tạo danh sách thông báo cho tất cả thành viên trong tổ chức
      const notifications = organization.members.map(member => ({
        userId: member.userId,
        type,
        title,
        content,
        sensorType: sensorData.sensorType,
        sensorId: sensorData.sensorId,
        sensorName: sensorData.sensorName,
        sensorValue: sensorData.value.toString(),
        roomId: sensorData.roomId,
        roomType: sensorData.roomType,
        isRead: false
      }));

      // Thêm người gửi là tên tổ chức
      if (notifications.length > 0) {
        for (let notify of notifications) {
          notify.content = `[${organization.name}] ${notify.content}`;
        }
      }
      
      // Lưu các thông báo vào cơ sở dữ liệu
      return await Notify.insertMany(notifications);
    } catch (error) {
      console.error('Lỗi khi tạo thông báo cho các thành viên tổ chức:', error);
      throw error;
    }
  }
}

module.exports = new NotifyService();