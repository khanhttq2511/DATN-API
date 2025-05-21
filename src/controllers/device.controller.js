const deviceService = require('../services/device.service');

class DeviceController {
  async createDevice(req, res) {
    try {
      const device = await deviceService.createDevice(req.body, req.user);
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllDevicesByRoomId(req, res) {
    try {
      const { roomId } = req.query;
      const devices = await deviceService.getAllDevicesByRoomId(roomId);
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

  async toggleStatus(req, res) {
    try {
      const user = req.user;
      const roomType = req.body.roomType;
      const device = await deviceService.toggleStatus(req.body.id, req.body.status, roomType, user);
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateDeviceActive(req, res) {
    try {
      const device = await deviceService.updateDeviceActive(req.body.id, req.body.isActive);
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lấy tất cả thiết bị trong một tổ chức
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getDevicesByOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      
      // Lấy các tham số filter từ query string
      const filters = {
        status: req.query.status,
        type: req.query.type,
        roomId: req.query.roomId,
        isActive: req.query.isActive === 'true' ? true : 
                  req.query.isActive === 'false' ? false : undefined
      };
      
      // Lọc bỏ các giá trị undefined
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });
      
      const devices = await deviceService.getDevicesByOrganization(organizationId, filters);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new DeviceController(); 