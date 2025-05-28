const Schedule = require('../models/schedule.model');
const AutoModeSchedule = require('../models/autoModeSchedule.model')
const DeviceService = require('./device.service');
const Room = require('../models/room.model');
const { sendMessageToTopic } = require('../utils');
const { agenda } = require('../schedule.cron');
const { agendaAutoMode } = require('../schedule.cron');
const { DateTime } = require("luxon");
class ScheduleService {
  // --- Manual (One-Time) Schedule Methods --- 
  async createSchedule(scheduleData) {
    try {
      const device = await DeviceService.getDeviceById(scheduleData.deviceId);
      if (!device) throw new Error('Thiết bị không tồn tại');

      const schedule = new Schedule({
        ...scheduleData, // userId should be part of scheduleData from controller
      });

      await agenda.schedule(schedule.scheduledTime, 'executeSchedule', schedule);
      return await schedule.save();
    } catch (error) {
      console.error("Error in createSchedule (manual):", error);
      throw new Error(`Lỗi tạo lịch hẹn giờ thủ công: ${error.message}`);
    }
  }

  async getSchedulesByDeviceId(deviceId) { // For manual schedules
    return await Schedule.find({ deviceId });
  }

  async getScheduleById(id) { // For a manual schedule
    return await Schedule.findById(id);
  }

  async updateSchedule(id, scheduleData) { // For a manual schedule
    try {
      const existingSchedule = await Schedule.findById(id);
      if (!existingSchedule) throw new Error('Không tìm thấy lịch hẹn giờ thủ công');

      await agenda.cancel({ 'data.scheduleId': id });
      const updatedSchedule = await Schedule.findByIdAndUpdate(id, scheduleData, { new: true });
      await agenda.schedule(updatedSchedule.scheduledTime, 'executeSchedule', { scheduleId: updatedSchedule._id.toString() });
      
      return updatedSchedule;
    } catch (error) {
      console.error("Error in updateSchedule (manual):", error);
      throw new Error(`Lỗi cập nhật lịch hẹn giờ thủ công: ${error.message}`);
    }
  }

  async deleteSchedule(id) { // For a manual schedule
    try {
      const schedule = await Schedule.findByIdAndDelete(id);
      if (!schedule) throw new Error('Không tìm thấy lịch hẹn giờ thủ công để xóa');
      
      await agenda.cancel({ 'data.scheduleId': id });
      return schedule;
    } catch (error) {
      console.error("Error in deleteSchedule (manual):", error);
      throw new Error(`Lỗi xóa lịch hẹn giờ thủ công: ${error.message}`);
    }
  }

  async executeSchedule({ scheduleId }) { // For manual schedules triggered by Agenda
    try {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) throw new Error(`Không tìm thấy lịch hẹn giờ (thủ công) với ID: ${scheduleId}`);

      const device = await DeviceService.getDeviceById(schedule.deviceId);
      if (!device) throw new Error('Không tìm thấy thiết bị cho lịch hẹn giờ (thủ công)');

      const room = await Room.findOne({ _id: schedule.roomId, organizationId: schedule.organizationId });
      if (!room) throw new Error('Không tìm thấy phòng cho lịch hẹn giờ (thủ công)');

      if (room.isAuto) {
        console.log(`[Manual Schedule Execution] Room ${room.name} is in auto mode, not executing manual schedule ${scheduleId}`);
        // No device status change, but the job is considered handled.
      } else {
        await DeviceService.updateDeviceStatus(schedule.deviceId, schedule.status, schedule.roomType);
        console.log(`[Manual Schedule Execution] Manual schedule ${scheduleId} for device ${schedule.deviceName} executed, set status to ${schedule.status}`);
        
        let formattoPub = {
          roomId: schedule.roomId,
          type: device.type,
          status: schedule.status === 'active',
          roomType: schedule.roomType
        };
        sendMessageToTopic('devices-down', formattoPub); // Uncomment if MQTT is set up
        global.io.emit('executeSchedule', `Manual schedule for device ${schedule.deviceName} executed.`); // Uncomment if socket is set up
      }
      return device; // Return device or a success indicator
    } catch (error) {
      console.error(`[Manual Schedule Execution] Lỗi thực thi lịch hẹn giờ (thủ công) ${scheduleId || 'unknown'}: ${error.message}`, error);
    }
  }

  // --- Auto Mode Schedule Methods ---
  async createOrUpdateAutoModeSchedule(scheduleData) {
    function createCronExpression(timeHHMM, daysOfWeek) {
      const [hour, minute] = timeHHMM.split(':').map(Number);
    
      const dayMap = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
      };
    
      const dayNumbers = daysOfWeek.map(day => dayMap[day]);
      const dayPart = dayNumbers.join(',');
    
      return `${minute} ${hour} * * ${dayPart}`;  // Ex: "0 18 * * 1,3,5"
    }

    try {
      const device = await DeviceService.getDeviceById(scheduleData.deviceId);
      if (!device) throw new Error('Thiết bị không tồn tại');
    
      const autoModeData = {
        deviceId: scheduleData.deviceId,
        deviceName: scheduleData.deviceName,
        deviceType: scheduleData.deviceType,
        userId: scheduleData.userId,
        organizationId: scheduleData.organizationId,
        roomId: scheduleData.roomId,
        roomType: scheduleData.roomType,
        startTime: scheduleData.autoModeConfig.startTime,
        endTime: scheduleData.autoModeConfig.endTime,
        daysOfWeek: scheduleData.autoModeConfig.daysOfWeek,
        deviceStatus: scheduleData.autoModeConfig.deviceStatus
      };
    
      const autoSchedule = new AutoModeSchedule(autoModeData);
      await autoSchedule.save();
      console.log("[Service] Saved AutoSchedule:", autoSchedule);
  
      // --- Lên lịch cho START TIME ---
      const startCronExpression = createCronExpression(
        autoSchedule.startTime,
        autoSchedule.daysOfWeek
      );
      const startJobName = `autoModeStart_${autoSchedule._id.toString()}`;
      
      await agendaAutoMode.cancel({ name: startJobName }); // Hủy job start cũ
      
      await agendaAutoMode.define(startJobName, { priority: 'high' }, async (job) => {
        console.log(`[Job Handler] START Job [${job.attrs.name}] triggered. Executing for scheduleId: ${autoSchedule._id.toString()}`);
        await this.executeAutoModeAction({ 
          scheduleId: autoSchedule._id.toString(), 
          isStartAction: true 
        });
      });
      await agendaAutoMode.every(startCronExpression, startJobName);
      console.log(`[Service] Scheduled START job: ${startJobName} with cron: ${startCronExpression}`);

      // --- Lên lịch cho END TIME ---
      const endCronExpression = createCronExpression(
        autoSchedule.endTime,
        autoSchedule.daysOfWeek 
      );
      const endJobName = `autoModeEnd_${autoSchedule._id.toString()}`;

      await agendaAutoMode.cancel({ name: endJobName }); // Hủy job end cũ

      await agendaAutoMode.define(endJobName, { priority: 'high' }, async (job) => {
        console.log(`[Job Handler] END Job [${job.attrs.name}] triggered. Executing for scheduleId: ${autoSchedule._id.toString()}`);
        await this.executeAutoModeAction({ 
          scheduleId: autoSchedule._id.toString(), 
          isStartAction: false
        });
      });
      await agendaAutoMode.every(endCronExpression, endJobName);
      console.log(`[Service] Scheduled END job: ${endJobName} with cron: ${endCronExpression}`);
      
      return autoSchedule;
    } catch (error) {
      console.error("[Service] Error in createOrUpdateAutoModeSchedule:", error);
      throw new Error(`Lỗi tạo/cập nhật lịch tự động: ${error.message}`);
    }
  }

  async getAutoModeScheduleByDeviceId(deviceId) {
    return await AutoModeSchedule.findOne({ deviceId });
  }
  
  // --- PHƯƠNG THỨC MỚI ĐỂ LẤY TẤT CẢ LỊCH AUTO CHO DEVICE ---
  async getAllAutoModeSchedulesByDeviceId(deviceId) {
    try {
      console.log(`[Service] Fetching all auto-mode schedules for device ID: ${deviceId}`);
      const schedules = await AutoModeSchedule.find({ deviceId: deviceId });
      console.log(`[Service] Found ${schedules.length} auto-mode schedules for device ID: ${deviceId}`);
      return schedules;
    } catch (error) {
      console.error(`[Service] Error fetching auto-mode schedules for device ID ${deviceId}:`, error.message);
    }
  }

  async deleteAutoModeSchedule(scheduleId) { // Chỉ nhận scheduleId
    try {
      console.log(`[Service] Attempting to delete auto-mode schedule with ID: ${scheduleId}`);
      
      // Tìm và xóa lịch dựa trên _id
      const deletedSchedule = await AutoModeSchedule.findOneAndDelete({ _id: scheduleId });

      if (!deletedSchedule) {
        console.warn(`[Service] Auto-mode schedule with ID: ${scheduleId} not found for deletion.`);
        throw new Error('Không tìm thấy lịch tự động để xóa với ID này.');
      }
      console.log("[Service] Successfully deleted schedule from DB:", deletedSchedule);

      // Hủy job tương ứng trong Agenda
      const jobName = `autoModeExecute_${deletedSchedule._id.toString()}`;
      console.log(`[Service] Attempting to cancel Agenda job: ${jobName}`);
      try {
        const numRemoved = await agendaAutoMode.cancel({ name: jobName });
        console.log(`[Service] Cancelled ${numRemoved} Agenda job(s) named ${jobName}.`);
      } catch (agendaError) {
        // Ghi log lỗi từ Agenda nhưng không làm gián đoạn việc xóa lịch đã thành công
        console.error(`[Service] Error cancelling Agenda job ${jobName}:`, agendaError);
        // Bạn có thể quyết định có ném lỗi này ra ngoài hay không,
        // hoặc có cơ chế retry/cleanup cho các job mồ côi.
      }
      
      return deletedSchedule;
    } catch (error) {
      console.error(`[Service] Error in deleteAutoModeSchedule for ID ${scheduleId}:`, error.message);
      // Ném lại lỗi để controller có thể xử lý
    }
  }

  async checkAndExecuteAutoMode({ scheduleId, forceDeviceStatus = null }) {
    try {
      const schedule = await AutoModeSchedule.findById(scheduleId);
      console.log("scheduleId hehehhee ", scheduleId);
      if (!schedule) {
        console.warn(`[Auto Mode Check] Không tìm thấy schedule với ID: ${scheduleId}`);
        return { message: 'Schedule không tồn tại' };
      }
  
      const serverTimeRaw = new Date();
      const timeForCheck = new Date(serverTimeRaw.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  
      const currentHour = timeForCheck.getUTCHours();
      const currentMinute = timeForCheck.getUTCMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
      const localDay = timeForCheck.getUTCDay();
      const daysMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
      const currentDayString = daysMap[localDay];
  
      const {
        deviceId, deviceName, roomId, organizationId,
        startTime, endTime, daysOfWeek, deviceStatus, roomType, deviceType
      } = schedule;
  
      const isDayMatch = daysOfWeek.includes(currentDayString);
      const isInTime = this.isTimeInRange(currentTimeString, startTime, endTime);
      console.log("isDayMatch", isDayMatch);
      console.log("isInTime", isInTime);
  
      if (!isDayMatch || !isInTime) {
        console.log(`[Auto Mode] Not in scheduled day or time. Skipping.`);
        return;
      }
  
      const room = await Room.findOne({ _id: roomId, organizationId });
      if (!room || !room.isAuto) {
        console.log(`[Auto Mode] Room not found or not in Auto mode. Skipping.`);
        return;
      }
  
      const statusToUse = forceDeviceStatus !== null ? forceDeviceStatus : deviceStatus;
      const targetDeviceStatusString = statusToUse ? 'active' : 'inactive';
  
      await DeviceService.updateDeviceStatus(deviceId, targetDeviceStatusString, roomType);
  
      const formattoPub = {
        roomId,
        type: deviceType,
        status: statusToUse,
        roomType
      };
  
      sendMessageToTopic('devices-down', formattoPub);
      global.io.emit('executeAutoModeSchedule', `Auto-mode executed successfully`);
      return { message: 'Auto-mode executed successfully' };
  
    } catch (error) {
      console.error('[Auto Mode Check] Error:', error);
      return { message: `Lỗi thực thi chế độ tự động: ${error.message}` };
    }
  }
  
  
  isTimeInRange(currentTime, startTime, endTime) {
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // qua đêm (ví dụ: 22:00 đến 06:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
  

  async deleteAllSchedulesForDevice(deviceId) {
    try {
        const manualDeleted = await Schedule.deleteMany({ deviceId });
        const autoDeleted = await AutoModeSchedule.deleteMany({ deviceId });
        console.log(`Đã xóa ${manualDeleted.deletedCount} lịch thủ công và ${autoDeleted.deletedCount} lịch tự động cho thiết bị ${deviceId}`);
        return { manualDeleted: manualDeleted.deletedCount, autoDeleted: autoDeleted.deletedCount };
    } catch (error) {
        console.error(`Lỗi xóa tất cả lịch cho thiết bị ${deviceId}:`, error);
        throw new Error(`Lỗi xóa lịch cho thiết bị: ${error.message}`);
    }
  }

  async executeAutoModeAction({ scheduleId, isStartAction }) {
    try {
      const schedule = await AutoModeSchedule.findById(scheduleId);
      console.log(`[Action] Processing scheduleId: ${scheduleId}, isStartAction: ${isStartAction}`);

      if (!schedule) {
        console.warn(`[Action] Schedule with ID: ${scheduleId} not found.`);
        return { message: 'Schedule không tồn tại, job có thể đã bị hủy.' };
      }
  
      const {
        deviceId, roomId, organizationId, deviceStatus, roomType
      } = schedule;
      
      const room = await Room.findOne({ _id: roomId, organizationId });
      if (!room) {
        console.log(`[Action] Room ID ${roomId} for schedule ${scheduleId} not found. Skipping.`);
        return;
      }

      // Chỉ thực thi nếu phòng đang ở chế độ Auto TẠI THỜI ĐIỂM JOB CHẠY
      if (!room.isAuto) {
        console.log(`[Action] Room ${room.name} (ID: ${roomId}) for schedule ${scheduleId} is NOT in auto mode at execution time. Skipping.`);
        return;
      }
  
      let targetDeviceStatusString;
      if (isStartAction) {
        // Nếu là hành động bắt đầu, sử dụng deviceStatus từ lịch
        targetDeviceStatusString = schedule.deviceStatus ? 'active' : 'inactive';
        console.log(`[Action] START action for ${deviceId}. Setting to: ${targetDeviceStatusString}`);
      } else {
        // Nếu là hành động kết thúc:
        // - Nếu deviceStatus là true (ON trong khoảng thời gian) -> tắt thiết bị (inactive)
        // - Nếu deviceStatus là false (OFF trong khoảng thời gian) -> giữ nguyên OFF (inactive)
        targetDeviceStatusString = 'inactive'; // Luôn là inactive khi kết thúc
        console.log(`[Action] END action for ${deviceId}. Setting to: ${targetDeviceStatusString} (end of time period)`);
      }
  
      await DeviceService.updateDeviceStatus(deviceId, targetDeviceStatusString, roomType);
      console.log(`[Action] Device ${deviceId} status updated to ${targetDeviceStatusString}.`);
  
      // Gửi MQTT và Socket.IO
      let formattoPub = {
        roomId: schedule.roomId,
        type: schedule.deviceType,
        status: targetDeviceStatusString === 'active',
        roomType: schedule.roomType
      };
      sendMessageToTopic('devices-down', formattoPub);
      global.io.emit('executeAutoModeAction', {
         message: `Auto-mode action executed for device ${deviceId}`,
         deviceId,
         status: targetDeviceStatusString,
         isStartAction: isStartAction
      });
      
      return { 
        message: `Auto-mode action for ${isStartAction ? 'start' : 'end'} executed successfully for schedule ${scheduleId}.`,
        deviceStatus: targetDeviceStatusString
      };
  
    } catch (error) {
      console.error(`[Action] Error executing auto mode action for scheduleId ${scheduleId} (isStart: ${isStartAction}):`, error);
      return { message: `Lỗi thực thi hành động chế độ tự động: ${error.message}` }; 
    }
  }
}

module.exports = new ScheduleService();