const notifyService = require('../services/notify.service.js');
const User = require('../models/user.model.js');

class NotifyController {
    // Tạo thông báo mới
    async createNotify(req, res) {
        try {
            const notify = await notifyService.createNotify(req.body);
            res.status(201).json({
                success: true,
                data: notify
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy tất cả thông báo cho một người dùng
    async getUserNotifications(req, res) {
        try {
            console.log("Request headers:", req.headers);
            console.log("Request user:", req.user);
            
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not authenticated or missing user ID'
                });
            }
            
            const userId = req.user._id;
            console.log("Finding notifications for userId:", userId);
            
            const notifications = await notifyService.getNotify({ userId });
            console.log("Found notifications count:", notifications.length);
            
            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (error) {
            console.error("Error in getUserNotifications:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy một thông báo bằng ID
    async getNotifyById(req, res) {
        try {
            const notifyId = req.params.id;
            const notify = await notifyService.getNotify({ _id: notifyId });
            
            if (!notify || notify.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }
            
            res.status(200).json({
                success: true,
                data: notify[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Cập nhật thông báo (đánh dấu đã đọc, v.v.)
    async updateNotify(req, res) {
        try {
            const notifyId = req.params.id;
            const updateData = { ...req.body, _id: notifyId };
            
            const notify = await notifyService.updateNotify(updateData);
            
            if (!notify) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }
            
            res.status(200).json({
                success: true,
                data: notify
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Đánh dấu thông báo đã đọc
    async markAsRead(req, res) {
        try {
            // Kiểm tra xác thực người dùng
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not authenticated or missing user ID'
                });
            }
            
            const notifyId = req.params.id;
            const userId = req.user._id;
            
            // Kiểm tra và lấy thông báo
            const existingNotify = await notifyService.getNotify({ 
                _id: notifyId,
                userId: userId  // Đảm bảo chỉ đánh dấu thông báo của người dùng hiện tại
            });
            
            if (!existingNotify || existingNotify.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo hoặc bạn không có quyền đánh dấu thông báo này'
                });
            }
            
            // Đánh dấu là đã đọc
            const updateData = { _id: notifyId, isRead: true };
            const notify = await notifyService.updateNotify(updateData);
            
            res.status(200).json({
                success: true,
                data: notify
            });
        } catch (error) {
            console.error("Error in markAsRead:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Xóa thông báo
    async deleteNotify(req, res) {
        try {
            // Kiểm tra xác thực người dùng
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not authenticated or missing user ID'
                });
            }
            
            const notifyId = req.params.id;
            const userId = req.user._id;
            
            // Kiểm tra và lấy thông báo để đảm bảo người dùng chỉ xóa thông báo của họ
            const existingNotify = await notifyService.getNotify({ 
                _id: notifyId,
                userId: userId
            });
            
            if (!existingNotify || existingNotify.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo hoặc bạn không có quyền xóa thông báo này'
                });
            }
            
            // Xóa thông báo
            const deleteData = { _id: notifyId };
            const notify = await notifyService.deleteNotify(deleteData);
            
            res.status(200).json({
                success: true,
                message: 'Đã xóa thông báo thành công'
            });
        } catch (error) {
            console.error("Error in deleteNotify:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Lấy thông báo theo ID thiết bị
    async getNotifyByDeviceId(req, res) {
        try {
            const deviceId = req.params.deviceId;
            const notifications = await notifyService.getNotifyByDeviceId(deviceId);
            
            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy thông báo theo loại thiết bị
    async getNotifyByDeviceType(req, res) {
        try {
            const deviceType = req.params.deviceType;
            const notifications = await notifyService.getNotifyByDeviceType(deviceType);
            
            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Đánh dấu tất cả thông báo là đã đọc cho một người dùng
    async markAllAsRead(req, res) {
        try {
            console.log("Request user:", req.user);
            
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not authenticated or missing user ID'
                });
            }
            
            const userId = req.user._id;
            console.log("Marking all notifications as read for userId:", userId);
            
            const result = await notifyService.markAllAsRead(userId);
            
            res.status(200).json({
                success: true,
                message: `Đã đánh dấu ${result.modifiedCount} thông báo đã đọc`,
                data: { modifiedCount: result.modifiedCount }
            });
        } catch (error) {
            console.error("Error in markAllAsRead:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy số lượng thông báo chưa đọc
    async getUnreadCount(req, res) {
        try {
            const userId = req.user._id;
            const count = await notifyService.getUnreadCount(userId);
            
            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Tạo thông báo cảnh báo từ cảm biến cho tất cả thành viên trong tổ chức
    async createSensorAlert(req, res) {
        try {
            const { organizationId, sensorType, sensorId, sensorName, value, unit, roomId, roomName, roomType } = req.body;
            
            if (!organizationId || !sensorType || !sensorId || !value || !roomId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: organizationId, sensorType, sensorId, value, roomId'
                });
            }
            
            // Kiểm tra và cung cấp giá trị mặc định cho roomName và roomType nếu thiếu
            const validRoomName = roomName || `Phòng ${roomId}`;
            const validRoomType = roomType || 'other';
            
            // Ghi log nếu phải sử dụng giá trị mặc định
            if (!roomName || !roomType) {
                console.warn('Cảnh báo: Sử dụng giá trị mặc định cho thông tin phòng:', {
                    roomId,
                    originalRoomName: roomName,
                    originalRoomType: roomType,
                    validRoomName,
                    validRoomType
                });
            }
            
            const sensorData = {
                sensorType,
                sensorId,
                sensorName,
                value,
                unit,
                roomId,
                roomName: validRoomName,
                roomType: validRoomType
            };
            
            const notifications = await notifyService.createSensorAlertNotification(organizationId, sensorData);
            
            // Nếu không có thông báo nào được tạo (giá trị không vượt ngưỡng)
            if (!notifications || notifications.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Không cần tạo thông báo, giá trị cảm biến trong ngưỡng cho phép',
                    data: []
                });
            }
            
            res.status(201).json({
                success: true,
                message: `Đã tạo ${notifications.length} thông báo cho các thành viên tổ chức`,
                data: notifications
            });
        } catch (error) {
            console.error('Lỗi khi tạo thông báo từ cảm biến:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi tạo thông báo từ cảm biến'
            });
        }
    }
}

module.exports = new NotifyController();