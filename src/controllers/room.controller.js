const roomService = require('../services/room.service');

class RoomController {
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body, req.user );
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllRooms(req, res) {
    try {
      const userId = req.user._id;
      const rooms = await roomService.getAllRooms(userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomById(req, res) {
    try {
      const room = await roomService.getRoomById(req.params.id);
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
      const room = await roomService.updateRoom(req.params.id, req.body);
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
      const room = await roomService.deleteRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomsByFloor(req, res) {
    try {
      const rooms = await roomService.getRoomsByFloor(req.params.floor);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomsByType(req, res) {
    try {
      const rooms = await roomService.getRoomsByType(req.params.type);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RoomController(); 