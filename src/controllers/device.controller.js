const deviceService = require('../services/device.service');

class DeviceController {
  async createDevice(req, res) {
    try {
      console.log(req.user);
      const device = await deviceService.createDevice(req.body, req.user);
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllDevices(req, res) {
    try {
      const devices = await deviceService.getAllDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDeviceById(req, res) {
    try {
      const device = await deviceService.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateDevice(req, res) {
    try {
      const device = await deviceService.updateDevice(req.params.id, req.body);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteDevice(req, res) {
    try {
      const device = await deviceService.deleteDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.json({ message: 'Device deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDevicesByRoom(req, res) {
    try {
      const devices = await deviceService.getDevicesByRoom(req.params.roomId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDevicesByType(req, res) {
    try {
      const devices = await deviceService.getDevicesByType(req.body.listType);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DeviceController(); 