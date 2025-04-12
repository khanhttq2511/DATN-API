const sensorService = require('../services/sensor.service');

class SensorController {
  async createSensor(req, res) {
    try {
      const sensor = await sensorService.createSensor(req.body);
      res.status(201).json(sensor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllSensors(req, res) {
    try {
      const roomId = req.query.roomId;
      const organizationId = req.query.organizationId;
      const sensors = await sensorService.getAllSensors(roomId, organizationId);
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSensorById(req, res) {
    try {
      const roomId = req.query.roomId;
      const organizationId = req.query.organizationId;
      const sensor = await sensorService.getSensorById(roomId, organizationId);
      if (!sensor) {  
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.json(sensor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateSensor(req, res) {
    try {
      const sensor = await sensorService.updateSensor(req.params.id, req.body);
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.json(sensor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteSensor(req, res) {
    try {
      const sensor = await sensorService.deleteSensor(req.params.id);
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.json({ message: 'Sensor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSensorsByDevice(req, res) {
    try {
      const sensors = await sensorService.getSensorsByDevice(req.params.deviceId);
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SensorController(); 