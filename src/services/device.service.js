const Device = require('../models/device.model');
const { sendMessageToTopic } = require('../utils');
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
    return await Device.findByIdAndDelete(id);
  }

  async getDevicesByRoom(roomId) {
    return await Device.find({ roomId });
  }

  async updateDeviceStatus(id, status) {
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
  async toggleStatus(id, status) {
    const device = await Device.findById(id);
    console.log(device);
    if (!device) {
      throw new Error('Device not found');
    }
    if (device.status === 'active') {
      device.status = 'inactive';
    } else {
      device.status = 'active';
    }
    console.log(id);
    console.log(status);
    sendMessageToTopic(id, status);
    return await device.save();
  }
}

module.exports = new DeviceService(); 