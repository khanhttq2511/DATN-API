const Device = require('../models/device.model');

class DeviceService {
  async createDevice(deviceData, userData) {
    deviceData.userId = userData._id;
    // kiểm tra xem user có phải là admin không
    if(userData.role === 'admin') {
      deviceData.isAdmin = true;
  }
    const device = new Device(deviceData);
    return await device.save();
  }

  async getAllDevices() {
    return await Device.find().populate('roomId');
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
}

module.exports = new DeviceService(); 