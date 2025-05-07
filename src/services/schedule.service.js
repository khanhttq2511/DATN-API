const Schedule = require('../models/schedule.model');
const DeviceService = require('./device.service');
const { sendMessageToTopic } = require('../utils');
const { agenda } = require('../schedule.cron');


class ScheduleService {
    async createSchedule(scheduleData) {
        try {
          // Kiểm tra thiết bị tồn tại
          const device = await DeviceService.getDeviceById(scheduleData.deviceId);

          if (!device) {
            throw new Error('Thiết bị không tồn tại');
          }
          
          // Kiểm tra người dùng có quyền trên tổ chức này không
          if (device.organizationId !== scheduleData.organizationId) {
            throw new Error('Bạn không có quyền truy cập thiết bị này');
          }

          const schedule = new Schedule({
            ...scheduleData,
            userId: scheduleData.userId,
          });
          
          agenda.schedule(schedule.scheduledTime, 'executeSchedule', { scheduleId: schedule._id, executeAt: schedule.scheduledTime});
          return await schedule.save();

        } catch (error) {
          throw new Error(`Lỗi tạo lịch hẹn giờ: ${error.message}`);
        }
      }

  async getSchedulesByDeviceId(deviceId) {
    return await Schedule.find({ deviceId });
  }

  async getScheduleById(id) {
    return await Schedule.findById(id);
  }

  async updateSchedule(id, scheduleData) {
    return await Schedule.findByIdAndUpdate(
      id,
      scheduleData,
      { new: true }
    );
  }

  async deleteSchedule(id) {
    return await Schedule.findByIdAndDelete(id);
  }

  async executeSchedule({scheduleId}) {
    try {
      const schedule = await Schedule.findById(scheduleId);
      const device = await DeviceService.getDeviceById(schedule.deviceId);
      
      if (!device) {
        throw new Error('Không tìm thấy thiết bị');
      }

      // Cập nhật trạng thái thiết bị
      await DeviceService.updateDeviceStatus(schedule.deviceId, schedule.status, schedule.roomType);
      // Gửi thông báo để cập nhật thiết bị
      let formattoPub = {
        roomId: schedule.roomId,
        type: device.type,
        status: schedule.status === 'active',
        roomType: schedule.roomType
      };
      
      const topic = 'devices-down';
      sendMessageToTopic(topic, formattoPub);

      return device;
    } catch (error) {
      throw new Error(`Lỗi thực thi lịch hẹn giờ: ${error.message}`);
    }
  }

  async getActiveSchedules() {
    try {
      const now = new Date();
      return await Schedule.find({
        isActive: true,
        scheduledTime: { $lte: now }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy lịch hẹn giờ đang hoạt động: ${error.message}`);
    }
  }
}

module.exports = new ScheduleService();