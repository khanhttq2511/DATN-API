const Room = require('../models/room.model');

class RoomService {
  async createRoom(roomData, userData) {
    roomData.userId = userData._id;
    const room = new Room(roomData);
    return await room.save(); 
  }

  async getAllRooms(userId, organizationId) {
    return await Room.find({ userId: userId, organizationId: organizationId });
  }

  async getRoomById(userId, id) {
    return await Room.findOne({ userId: userId, _id: id });
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
  async getRoomDetails(roomId, organizationId) {
    return await Room.findOne({ _id: roomId, organizationId: organizationId });
  }
}

module.exports = new RoomService(); 