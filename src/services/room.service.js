const Room = require('../models/room.model');

class RoomService {
  async createRoom(roomData) {
    const room = new Room(roomData);
    return await room.save(); 
  }

  async getAllRooms(organizationId) {
    return await Room.find({ organizationId: organizationId });
  }

  async getRoomById(organizationId, id) {
    return await Room.findOne({ organizationId: organizationId, _id: id });
  }

  async updateRoom(id, roomData) {
    return await Room.findByIdAndUpdate(id, roomData, { new: true });
  }

  async deleteRoom(id) {
    return await Room.findByIdAndDelete(id);
  }

  async getRoomsByFloor(floor) {
    return await Room.find({ floor });
  }

  async getRoomsByType(type) {
    return await Room.find({ type });
  }

  async updateRoomStatus(id, status) {
    return await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
  async getRoomDetails(roomId) {
    return await Room.findOne({ _id: roomId });
  }
}

module.exports = new RoomService(); 