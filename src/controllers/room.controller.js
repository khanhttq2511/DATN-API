const roomService = require('../services/room.service');
const sensorService = require('../services/sensor.service');
const deviceService = require('../services/device.service');


class RoomController {
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body, req.params.organizationId);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllRooms(req, res) {
    try {
      // const userId = req.user._id;
      const organizationId = req.query.organizationId;
      const rooms = await roomService.getAllRooms(organizationId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomById(req, res) {
    try {
      const organizationId = req.query.organizationId;
      const roomId = req.params.id;
      console.log("roomId", roomId);
      console.log("organizationId", organizationId);
      const room = await roomService.getRoomById(organizationId, roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateRoom(req, res) {
    try {
      // const userId = req.user._id;
      const organizationId = req.params.organizationId;
      const room = await roomService.updateRoom(req.params.id, req.body, organizationId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteRoom(req, res) {
    try {
      const organizationId = req.params.organizationId || req.query.organizationId;
      const roomId = req.params.id;
      
      if (!roomId) {
        return res.status(400).json({ 
          success: false,
          message: 'Room ID is required' 
        });
      }
      
      // Đếm số lượng sensor và device trước khi xóa để thông báo
      const sensors = await sensorService.getSensorById(roomId, organizationId);
      const devices = await deviceService.getDevicesByRoom(roomId);
      
      const sensorCount = sensors ? sensors.length : 0;
      const deviceCount = devices ? devices.length : 0;
      
      // Thực hiện xóa phòng (sẽ xóa cả sensor và device)
      const room = await roomService.deleteRoom(roomId, organizationId);
      
      if (!room) {
        return res.status(404).json({ 
          success: false,
          message: 'Room not found' 
        });
      }
      
      res.json({ 
        success: true,
        message: `Room deleted successfully with ${sensorCount} sensors and ${deviceCount} devices`,
        deletedRoom: room.name,
        deletedSensors: sensorCount,
        deletedDevices: deviceCount
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async getRoomDetails(req, res) {
    try {
      const { roomId } = req.query;

      if (!roomId) {
        return res.status(400).json({ message: 'roomId is required.' });
      }

      const roomDetails = await roomService.getRoomDetails(roomId);

      if (!roomDetails) {
        return res.status(404).json({ message: 'Room not found.' });
      }

      res.status(200).json(roomDetails);
    } catch (error) {
      console.error("Error fetching room details:", error);
      res.status(500).json({ message: 'Error fetching room details.' });
    }
  }

  async changeAutomode(req, res) {
    const { isAuto, orgId, roomId } = req.body;
    const result = await roomService.changeAutomode(isAuto, orgId, roomId);
    res.status(200).json(result);
  }

  // lấy danh sách phòng đang ở automode
  async getRoomsByAutomode(req, res) {
    const { orgId } = req.query;
    
    if (!orgId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const rooms = await roomService.getRoomsByAutomode(orgId);
    res.status(200).json(rooms);
  }

  async updateRoomActive(req, res) {
    const { roomId, isActive } = req.body;
    const result = await roomService.updateRoomActive(roomId, isActive);
    res.status(200).json(result);
  }

  async updateAllowedDevices(req, res) {
    try {
      const { roomId, organizationId, allowDevice } = req.body;
      const room = await roomService.updateRoomAllowedDevices(roomId, organizationId, allowDevice);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async forceUpdateAllowedDevices(req, res) {
    try {
      const { roomId, organizationId } = req.body;
      const room = await roomService.forceUpdateRoomAllowedDevices(roomId, organizationId);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new RoomController(); 