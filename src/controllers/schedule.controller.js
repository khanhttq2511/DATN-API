const scheduleService = require('../services/schedule.service');

class ScheduleController {
  // --- Manual (One-Time) Schedule Endpoints ---
  async createSchedule(req, res) { // For one-time schedules
    try {
      const { deviceId, deviceName, deviceType, status, scheduledTime, organizationId, roomId, roomType } = req.body;
      const schedule = await scheduleService.createSchedule({
        deviceId, deviceName, deviceType, status, scheduledTime,
        organizationId: organizationId || req.user.organizationId, // Use user's org if not provided
        roomId, roomType,
        userId: req.user.id
      });
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSchedulesByDeviceId(req, res) { // Gets manual schedules
    try {
      const { deviceId } = req.params;
      const schedules = await scheduleService.getSchedulesByDeviceId(deviceId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getScheduleById(req, res) { // Gets a manual schedule
    try {
      const schedule = await scheduleService.getScheduleById(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ (thủ công)' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateSchedule(req, res) { // Updates a manual schedule
    try {
      const { deviceId, deviceName, deviceType, status, scheduledTime, organizationId, roomId, roomType } = req.body;
      const schedule = await scheduleService.updateSchedule(req.params.id, {
        deviceId, deviceName, deviceType, status, scheduledTime,
        organizationId: organizationId || req.user.organizationId,
        roomId, roomType,
        userId: req.user.id // To track who updated
      });
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ (thủ công) để cập nhật' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteSchedule(req, res) { // Deletes a manual schedule
    try {
      const schedule = await scheduleService.deleteSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ (thủ công) để xóa' });
      }
      res.json({ message: 'Xóa lịch hẹn giờ (thủ công) thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  // --- Auto Mode Schedule Endpoints ---
  async createOrUpdateAutoModeSchedule(req, res) {
    try {
      // Expects: deviceId, deviceName, deviceType, roomId, roomType, 
      // and an autoModeConfig object: { startTime, endTime, daysOfWeek, deviceStatus }
      const { deviceId, deviceName, deviceType, roomId, roomType, autoModeConfig, organizationId } = req.body;

      if (!autoModeConfig || typeof autoModeConfig !== 'object') {
        return res.status(400).json({ message: 'autoModeConfig is required and must be an object.' });
      }
      if (!deviceId || !deviceName || !deviceType || !roomId || !roomType || !autoModeConfig.startTime || !autoModeConfig.endTime || !autoModeConfig.daysOfWeek || typeof autoModeConfig.deviceStatus !== 'boolean') {
          return res.status(400).json({ message: 'Missing required fields for auto mode schedule.' });
      }

      const scheduleData = {
        deviceId,
        deviceName,
        deviceType,
        roomId,
        roomType,
        autoModeConfig, // Pass the whole object
        organizationId: organizationId || req.user.organizationId,
        userId: req.user.id,
      };
      
      const schedule = await scheduleService.createOrUpdateAutoModeSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error in createOrUpdateAutoModeSchedule controller:", error);
      res.status(400).json({ message: error.message });
    }
  }
  
  async getAllAutoModeSchedulesByDeviceId(req, res) {
    try {
      const { deviceId } = req.params;
      const schedules = await scheduleService.getAllAutoModeSchedulesByDeviceId(deviceId);
      // It's okay if no schedule is found, just return null or an empty object as per preference
      res.json(schedules || null); 
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAutoModeSchedule(req, res) {
    try { 
      const { scheduleId } = req.params;
      const schedule = await scheduleService.deleteAutoModeSchedule(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch tự động để xóa' });
      }
      res.json({ message: `Xóa lịch tự động thành công` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  // --- Common Endpoints (Cron, Logs) ---
  async checkAndExecuteAutoMode(req, res) { // Usually triggered internally, but can be exposed for testing
    try {
      // Add admin/specific protection if exposing this publicly
      const result = await scheduleService.checkAndExecuteAutoMode();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getScheduleLogs(req, res) {
    try {
      const { 
        deviceId, roomId, organizationId, isAutoMode, 
        startDate, endDate, limit, skip, success // Added success filter
      } = req.query;
      
      if (organizationId && organizationId !== req.user.organizationId && !req.user.isAdmin) { // Example admin check
        return res.status(403).json({ message: 'Bạn không có quyền truy cập dữ liệu của tổ chức này' });
      }
      
      const options = {
        deviceId,
        roomId,
        organizationId: organizationId || req.user.organizationId,
        isAutoMode,
        startDate,
        endDate,
        limit,
        skip,
        success // Pass success to service
      };
      
      const logs = await scheduleService.getScheduleLogs(options);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getScheduleLogById(req, res) {
    try {
      const log = await scheduleService.getScheduleLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ message: 'Không tìm thấy log lịch hẹn giờ' });
      }
      if (log.organizationId !== req.user.organizationId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập dữ liệu này' });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ScheduleController();