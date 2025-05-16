const Sensor = require('../models/sensor.model');
const threshold = require('../config/threshold');
const notificationService = require('./notify.service');
const roomService = require('./room.service');

class SensorService {
  async createSensor(sensorData) {
    const room = await roomService.getRoomById(sensorData.organizationId, sensorData.roomId);
    sensorData.roomName = room.name;
    if(sensorData.type === 'dht'){
      
      const temperature = sensorData.value.temperature;
      const humidity = sensorData.value.humidity;
      if(temperature > threshold.temperature.min){
        sensorData.unit = '°C';
        notificationService.createSensorAlertNotification(sensorData.organizationId, sensorData);
      }
      if(humidity > threshold.humidity.min){
        sensorData.unit = '%';
        notificationService.createSensorAlertNotification(sensorData.organizationId, sensorData);
      }
    }else if(sensorData.type === 'gas'){
      const ppm = sensorData.value.ppm;
      sensorData.unit = 'ppm';
      if(ppm > threshold.ppm.min){
        notificationService.createSensorAlertNotification(sensorData.organizationId, sensorData);
      }
    }else if(sensorData.type === 'light'){
      const light = sensorData.value.light;
      sensorData.unit = 'lux';
      if(light < threshold.light.min ){
        notificationService.createSensorAlertNotification(sensorData.organizationId, sensorData);
      }
    }
    sensorData.isActive = true;
    const sensor = new Sensor(sensorData);
    return await sensor.save();
  }

  async getAllSensors(roomId, organizationId) {
    return await Sensor.find({ roomId, organizationId }).sort({ createdAt: -1 });
  }

  async getSensorById(roomId, organizationId) {
    return await Sensor.find({ roomId, organizationId });
  }

  async updateSensor(id, sensorData) {
    return await Sensor.findByIdAndUpdate(
      id, 
      { ...sensorData, lastUpdated: Date.now() },
      { new: true }
    );
  }

  async deleteSensor(id) {
    return await Sensor.findByIdAndDelete(id);
  }

  async getSensorsByDevice(deviceId) {
    return await Sensor.find({ deviceId });
  }

  async updateSensorValue(id, value) {
    return await Sensor.findByIdAndUpdate(
      id,
      { value, lastUpdated: Date.now() },
      { new: true }
    );
  }

  async updateSensorActive(roomId, isActive, orgId) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    
    if (!orgId) {
      throw new Error('Organization ID is required');
    }
    
    // Cập nhật tất cả thiết bị trong phòng đã chọn và thuộc tổ chức đó
    const result = await Sensor.updateMany(
      { 
        roomId: roomId,
        organizationId: orgId 
      },
      { $set: { isActive: isActive } }
    );
    return result;
  }

  async getSensorsByDay(startDate, endDate, roomId, organizationId) {
    // Tạo đối tượng Date từ chuỗi ngày hoặc sử dụng ngày hiện tại
    const targetDate = startDate ? new Date(startDate) : new Date();
    
    // Đặt thời gian về đầu ngày (00:00:00)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Đặt thời gian về cuối ngày (23:59:59)
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Xây dựng query
    const query = {
      roomId,
      organizationId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    
    return await Sensor.find(query).sort({ createdAt: 1 });
  }

  async getSensorsByWeek(startDate, endDate, roomId, organizationId) {
    // Tạo đối tượng Date từ chuỗi ngày hoặc sử dụng ngày hiện tại
    const targetDate = startDate ? new Date(startDate) : new Date();
    
    // Tìm ngày đầu tuần (Thứ Hai)
    const startOfWeek = new Date(targetDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi chủ nhật
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Tìm ngày cuối tuần (Chủ Nhật)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Xây dựng query
    const query = {
      roomId,
      organizationId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    
    return await Sensor.find(query).sort({ createdAt: 1 });
  }

  async getSensorsByMonth(startDate, endDate, roomId, organizationId) {
    
    // Xây dựng query
    const query = {
      roomId,
      organizationId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    return await Sensor.find(query).sort({ createdAt: 1 });
  }
}

module.exports = new SensorService(); 