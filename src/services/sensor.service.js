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

  async getAllSensors(roomId, organizationId) {
    return await Sensor.find({ roomId, organizationId });
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
  
  // async updateSensorStatus(roomId, orgId, data) {
  //   if(!data || !roomId || !orgId) return;
  //   console.log("data update", data);
  //   console.log("roomId", roomId);
  //   if(data.humi !== "error" || data.humi !== undefined){
  //     const sensor = await Sensor.findOneAndUpdate({ roomId: roomId, type: "dht", organizationId: orgId }, { isConnected: true, 'value.humidity': data.humi }, { new: true });
  //     if (!sensor) {
  //       const newSensor = new Sensor({ roomId: roomId, type: "dht", organizationId: orgId, isConnected: true, 'value.humidity': data.humi });
  //       await newSensor.save();
  //       console.log("sensor", newSensor);
  //     }
  //   }
  //   if(data.ppm !== "error" || data.ppm !== undefined){
  //     const sensor = await Sensor.findOneAndUpdate({ roomId: roomId, type: "gas", organizationId: orgId }, { isConnected: true, 'value.ppm': data.ppm }, { new: true });
  //     if (!sensor) {
  //       const newSensor = new Sensor({ roomId: roomId, type: "gas", organizationId: orgId, isConnected: true, 'value.ppm': data.ppm });
  //       await newSensor.save();
  //       console.log("sensor", newSensor);
  //     }
  //   }
  //   if(data.temp !== "error" || data.temp !== undefined){
  //     const sensor = await Sensor.findOneAndUpdate({ roomId: roomId, type: "dht", organizationId: orgId }, { isConnected: true, 'value.temperature': data.temp }, { new: true });
  //     if (!sensor) {
  //       const newSensor = new Sensor({ roomId: roomId, type: "dht", organizationId: orgId, isConnected: true, 'value.temperature': data.temp });
  //       await newSensor.save();
  //       console.log("sensor", newSensor);
  //     }
  //   }
  //   if(data.light !== "error" || data.light !== undefined){
  //     const sensor = await Sensor.findOneAndUpdate({ roomId: roomId, type: "light", organizationId: orgId }, { isConnected: true, 'value.light': data.light }, { new: true });
  //     if (!sensor) {
  //       const newSensor = new Sensor({ roomId: roomId, type: "light", organizationId: orgId, isConnected: true, 'value.light': data.light });
  //       await newSensor.save();
  //       console.log("sensor", newSensor);
  //     }
  //   }
  // }
}

module.exports = new SensorService(); 