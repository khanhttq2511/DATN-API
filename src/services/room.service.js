const Room = require('../models/room.model');
const Device = require('../models/device.model');
const Sensor = require('../models/sensor.model');
const { sendMessageToTopic } = require('../utils');

class RoomService {
  async createRoom(roomData) {
    const room = new Room(roomData);
    return await room.save(); 
  }

  async getAllRooms(organizationId) {
    return await Room.find({ organizationId: organizationId });
  }

  async getRoomById(organizationId, id) {
    const room = await Room.findOne({ organizationId: organizationId, _id: id });
    return room;
  }

  async updateRoom(id, roomData) {
    return await Room.findByIdAndUpdate(id, roomData, { new: true });
  }

  /**
   * Xóa phòng và tất cả cảm biến, thiết bị liên quan
   * @param {string} id - ID của phòng cần xóa
   * @param {string} organizationId - ID của tổ chức (nếu cần thiết)
   * @returns {Promise<Object>} Thông tin về phòng đã xóa
   */
  async deleteRoom(id, organizationId = null) {
    try {
      // Tạo điều kiện tìm kiếm phòng
      const query = { _id: id };
      if (organizationId) {
        query.organizationId = organizationId;
      }
      
      // Tìm thông tin phòng trước khi xóa
      const room = await Room.findOne(query);
      
      if (!room) {
        return null;
      }
      
      // Xóa tất cả cảm biến thuộc phòng
      await Sensor.deleteMany({ roomId: id });
      
      // Xóa tất cả thiết bị thuộc phòng
      await Device.deleteMany({ roomId: id });
      
      // Xóa phòng
      return await Room.findOneAndDelete(query);
    } catch (error) {
      throw new Error(`Error deleting room: ${error.message}`);
    }
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

  async changeAutomode(isAuto, orgId, roomId) {
    try {
      const room = await Room.findOne({ _id: roomId, organizationId: orgId });
      if (!room) {
        throw new Error('Room not found');
      }

      // Only proceed if the status is actually changing
      if (room.isAuto === isAuto) {
        return room; // Return existing room if no change
      }

      // Update automode status
      room.isAuto = isAuto;

      // If switching from off to on, turn off all devices
      if (isAuto) {
        // Get all devices in the room
        const devices = await Device.find({ 
          roomId: roomId,
          organizationId: orgId 
        });

        // Turn off all devices
        for (const device of devices) {
          if (device.status === 'active') {
            device.status = 'inactive';
            await device.save();

            // Send MQTT message to turn off device
            const formattoPub = {
              roomId: roomId,
              type: device.type,
              status: false,
              roomType: room.type
            };
            const topic = 'devices-down';
            sendMessageToTopic(topic, formattoPub);
          }
        }
      }

      // Prepare and send MQTT message for automode change
      let formattoPub = {
        roomId: roomId,
        isAuto: isAuto,
        orgId: orgId,
      }
      const topic = 'esp32/automode-change-down';
      sendMessageToTopic(topic, formattoPub);

      // Save and return updated room
      return await room.save();
    } catch (error) {
      throw new Error(`Error changing automode: ${error.message}`);
    }
  }

  async getRoomsByAutomode(orgId){
    const rooms = await Room.find({ organizationId: orgId, isAuto: true });
    return rooms;
  }

  async updateRoomActive(roomId, isActive, orgId) {
    const room = await Room.findOne({ _id: roomId, organizationId: orgId });
    if (!room) {
      throw new Error('Room not found');
    }
    room.isActive = isActive;
    return await room.save();
  }

  async updateRoomAllowedDevices(roomId, organizationId, allowDevice) {
    try {
      const room = await Room.findOne({ _id: roomId, organizationId });
      if (!room) {
        throw new Error('Room not found');
      }

      room.allowDevice = allowDevice;
      await room.save();

      return room;
    } catch (error) {
      throw new Error(`Error updating room allowed devices: ${error.message}`);
    }
  }

  async forceUpdateRoomAllowedDevices(roomId, organizationId) {
    try {
      const room = await Room.findOne({ _id: roomId, organizationId });
      if (!room) {
        throw new Error('Room not found');
      }

      // Force update allowDevice based on room type
      if(room.type === 'bedroom') {
        room.allowDevice = ['fan'];
      }
      else if (room.type === 'kitchen') { 
        room.allowDevice = ['light', 'fan'];
      }
      else if (room.type === 'livingroom') {
        room.allowDevice = ['light'];
      }
      else if (room.type === 'movieroom') {
        room.allowDevice = ['light', 'fan'];
      }

      await room.save();
      console.log('Updated room allowed devices:', room);
      return room;
    } catch (error) {
      throw new Error(`Error updating room allowed devices: ${error.message}`);
    }
  }
}

module.exports = new RoomService(); 