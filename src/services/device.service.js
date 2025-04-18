const Device = require('../models/device.model');
const { sendMessageToTopic } = require('../utils');
const HistoryService = require('./history.service');
const History = require('../models/history.model');

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
    return await Device.find({ roomId: roomId });
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
    return await Device.find({ roomId });
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
      // console.log("device", device);
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
    // console.log(formattoPub);
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
    // console.log("device", device);
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

  
}

module.exports = new DeviceService(); 