const roomService = require('../services/room.service');


class RoomController {
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body, req.user);
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
      const userId = req.user._id;
      const room = await roomService.getRoomById(req.params.id, userId);
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
      const userId = req.user._id;
      const room = await roomService.updateRoom(req.params.id, req.body, userId);
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
      const userId = req.user._id;
      const room = await roomService.deleteRoom(req.params.id, userId);
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
      const userId = req.user._id;
      const rooms = await roomService.getRoomsByFloor(req.params.floor, userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomsByType(req, res) {
    try {
      const userId = req.user._id;
      const rooms = await roomService.getRoomsByType(req.params.type, userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
}

module.exports = new RoomController(); 