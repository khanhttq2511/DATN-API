const Device = require('../models/device.model');
const { sendMessageToTopic } = require('../utils');
const HistoryService = require('./history.service');
const History = require('../models/history.model');
const Schedule = require('../models/schedule.model');
const Room = require('../models/room.model');

class DeviceService {
  async createDevice(deviceData, userData) {
    deviceData.userId = userData._id;
    deviceData.roomId = deviceData.roomId;
    // kiểm tra xem user có phải là admin không
    if(userData.role === 'admin') {
      deviceData.isAdmin = true;
  }
    const device = new Device(deviceData);
    return await device.save();
  }

  async getAllDevicesByRoomId(roomId) {
    const result = await Device.find({ roomId: roomId });
    return result;
  }

  async getDeviceById(id) {
    return await Device.findById(id).populate('roomId');
  }

  async updateDevice(id, deviceData) {
    return await Device.findByIdAndUpdate(
      id,
      { ...deviceData, lastActive: Date.now() },
      { new: true }
    );
  }

  async deleteDevice(id) {
    try {
      // Xóa tất cả lịch sử thiết bị trước
      await History.deleteMany({ deviceId: id });
      
      // Xóa tất cả lịch hẹn giờ của thiết bị
      await Schedule.deleteMany({ deviceId: id });
      
      // Sau đó xóa thiết bị
      return await Device.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting device: ${error.message}`);
    }
  }

  async getDevicesByRoom(roomId) {
    // Kiểm tra phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      // Có thể trả về mảng rỗng hoặc throw exception tùy vào logic nghiệp vụ
      return [];
    }
    const result = await Device.find({ roomId });
    return result;
  }

  async updateDeviceStatus(id, status, roomType) {
    const device = await Device.findById(id);
    await HistoryService.createHistory({
      deviceId: id,
      deviceName: device.name,
      deviceType: device.type,
      action: status,
      organizationId: device.organizationId,
      userId: device.userId,
      roomId: device.roomId,
      roomType: roomType,
    });
    return await Device.findByIdAndUpdate(
      id,
      { status, lastActive: Date.now() },
      { new: true }
    );
  }

  async getDevicesByType(listType) {
    return await Device.find({ type: { $in: listType }, isAdmin: true });
  } 
  // kiểm tra trạng thái của device
  async checkDeviceStatus(id) {
    const device = await Device.findById(id);
    if (!device) {
      throw new Error('Device not found');
    }
    return device.status;
  }
  // toggle status của device
  async toggleStatus(id, status, roomType, user) {
    try {
      const device = await Device.findById(id);
      if (!device) {
        throw new Error('Device not found');
    }
    if (device.status === 'active') {
      device.status = 'inactive';
    } else {
      device.status = 'active';
    }
    await HistoryService.createHistory({
      deviceId: id,
      deviceName: device.name,
      deviceType: device.type,
      action: status,
      organizationId: device.organizationId,
      userId: user._id,
      roomId: device.roomId,
      roomType: roomType,
    });

    let formattoPub = {
      roomId: device.roomId,
      type: device.type,
      status: device.status === 'active' ,
      roomType: roomType
    }
    //format send topic 
    const topic = `devices-down`;
    sendMessageToTopic(topic, formattoPub);

    return await device.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateDeviceStatusAfterConnected(roomId, type, status,roomType) {
    const device = await Device.findOne({ roomId: roomId, type: type });
    if (!device) {
      throw new Error('Device not found');
    }
    device.status = status;
    await HistoryService.createHistory({
      deviceId: device._id,
      deviceName: device.name,
      deviceType: device.type,
      action: status,
      organizationId: device.organizationId,
      userId: device.userId,
      roomId: device.roomId,
      roomType: roomType,
    });
    return await device.save();
  }

  async updateDeviceActive(roomId, isActive, orgId) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    
    if (!orgId) {
      throw new Error('Organization ID is required');
    }
    
    // Cập nhật tất cả thiết bị trong phòng đã chọn và thuộc tổ chức đó
    const result = await Device.updateMany(
      { 
        roomId: roomId,
        organizationId: orgId 
      },
      { $set: { isActive: isActive } }
    );
    const response = await Device.find({ roomId: roomId, organizationId: orgId });
    return result;
  }

  /**
   * Lấy tất cả thiết bị trong một tổ chức
   * @param {string} organizationId - ID của tổ chức
   * @param {Object} filters - Các bộ lọc (trạng thái, loại thiết bị, etc.)
   * @returns {Promise<Array>} - Danh sách thiết bị trong tổ chức
   */
  async getDevicesByOrganization(organizationId, filters = {}) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      // Xây dựng điều kiện tìm kiếm
      const query = { organizationId };

      // Thêm điều kiện lọc theo trạng thái nếu có
      if (filters.status) {
        query.status = filters.status;
      }

      // Thêm điều kiện lọc theo loại thiết bị nếu có
      if (filters.type) {
        query.type = filters.type;
      }

      // Thêm điều kiện lọc theo phòng nếu có
      if (filters.roomId) {
        query.roomId = filters.roomId;
      }

      // Thêm điều kiện lọc theo trạng thái kích hoạt nếu có
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Lấy danh sách thiết bị
      const devices = await Device.find(query);
      return devices;
    } catch (error) {
      throw new Error(`Error getting devices by organization: ${error.message}`);
    }
  }

  async cleanupOrphanedDevices() {
    const allDevices = await Device.find();
    for (const device of allDevices) {
      const room = await Room.findById(device.roomId);
      if (!room) {
        await Device.findByIdAndDelete(device._id);
      }
    }
  }
}

module.exports = new DeviceService(); 