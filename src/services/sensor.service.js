const Sensor = require('../models/sensor.model');

class SensorService {
  async createSensor(sensorData) {
    if(sensorData.type === 'temperature'){
      sensorData.unit = '°C';
    }else if(sensorData.type === 'humidity'){
      sensorData.unit = '%';
    }else if(sensorData.type === 'light'){
      sensorData.unit = 'lux';
    }
    const sensor = new Sensor(sensorData);
    return await sensor.save();
  }

  async getAllSensors() {
    return await Sensor.find().populate('deviceId');
  }

  async getSensorById(id) {
    return await Sensor.findById(id).populate('deviceId');
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
}

module.exports = new SensorService(); 