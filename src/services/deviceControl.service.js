const Device = require('../models/device.model');
const Room = require('../models/room.model');
const Sensor = require('../models/sensor.model');
const threshold = require('../config/threshold');
const { sendMessageToTopic } = require('../utils');

class DeviceControlService {
  async controlDevicesBySensorData(sensorData) {
    try {
      console.log('Received sensor data:', sensorData);
      
      // Get room information
      const room = await Room.findOne({ 
        _id: sensorData.roomId,
        organizationId: sensorData.organizationId 
      });

      if (!room) {
        throw new Error('Room not found');
      }

      console.log('Room status:', {
        isActive: room.isActive,
        isAuto: room.isAuto,
      });

      // Check if room is active and in auto mode
      if (!room.isActive || !room.isAuto) {
        console.log('Room is not active or not in auto mode');
        return null;
      }

      // Get all devices in the room
      const devices = await Device.find({ 
        roomId: sensorData.roomId,
        organizationId: sensorData.organizationId 
      });

      console.log('Found devices:', devices);

      if (!devices || devices.length === 0) {
        console.log('No devices found in room');
        return null;
      }

      let controlActions = [];

      // Control devices based on sensor type and thresholds
      switch (sensorData.type) {
        case 'dht':
          const { temperature, humidity } = sensorData.value;
          console.log('DHT values:', { temperature, humidity });
          
          // Control fan based on temperature
          const fanDevice = devices.find(d => d.type === 'fan');
          console.log('Fan device:', fanDevice);
          
          if (fanDevice) {
            console.log('Temperature threshold check:', {
              current: temperature,
              threshold: threshold.temperature.min
            });
            
            if (temperature > threshold.temperature.min) {
              console.log('Activating fan due to high temperature');
              controlActions.push({
                deviceId: fanDevice._id,
                status: 'active',
                type: 'fan'
              });
            } else {
              console.log('Deactivating fan due to normal temperature');
              controlActions.push({
                deviceId: fanDevice._id,
                status: 'inactive',
                type: 'fan'
              });
            }
          }

        case 'light':
          const lightValue = sensorData.value.light;
          const lightDevice = devices.find(d => d.type === 'light');
          
          if (lightDevice) {
            if (lightValue < threshold.light.min) {
              controlActions.push({
                deviceId: lightDevice._id,
                status: 'active',
                type: 'light'
              });
            } else {
              controlActions.push({
                deviceId: lightDevice._id,
                status: 'inactive',
                type: 'light'
              });
            }
          }
          break;

        // case 'gas':
        //   const ppmValue = sensorData.value.ppm;
        //   const ventilationDevice = devices.find(d => d.type === 'ventilation');
          
        //   if (ventilationDevice) {
        //     if (ppmValue > threshold.ppm.min) {
        //       controlActions.push({
        //         deviceId: ventilationDevice._id,
        //         status: 'active',
        //         type: 'ventilation'
        //       });
        //     } else {
        //       controlActions.push({
        //         deviceId: ventilationDevice._id,
        //         status: 'inactive',
        //         type: 'ventilation'
        //       });
        //     }
        //   }
        //   break;
      }

      console.log('Control actions to execute:', controlActions);

      // Execute control actions
      for (const action of controlActions) {
        const device = await Device.findById(action.deviceId);
        if (device && device.status !== action.status) {
          console.log('Updating device status:', {
            deviceId: action.deviceId,
            oldStatus: device.status,
            newStatus: action.status
          });

          // Update device status
          device.status = action.status;
          await device.save();

          // Send MQTT message to control device
          const formattoPub = {
            roomId: sensorData.roomId,
            type: action.type,
            status: action.status === 'active',
            roomType: room.type
          };
          console.log('Sending MQTT message:', formattoPub);
          // const topic = 'devices-down';
          // sendMessageToTopic(topic, formattoPub);
        }
      }

      return controlActions;
    } catch (error) {
      console.error('Error controlling devices:', error);
      throw error;
    }
  }
}

module.exports = new DeviceControlService(); 