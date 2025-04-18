const scheduleService = require('../services/schedule.service');

class ScheduleController {
  async createSchedule(req, res) {
    try {
      const schedule = await scheduleService.createSchedule(req.body, req.user);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSchedulesByDeviceId(req, res) {
    try {
      const { deviceId } = req.params;
      const schedules = await scheduleService.getSchedulesByDeviceId(deviceId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getScheduleById(req, res) {
    try {
      const schedule = await scheduleService.getScheduleById(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateSchedule(req, res) {
    try {
      const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const schedule = await scheduleService.deleteSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn giờ' });
      }
      res.json({ message: 'Xóa lịch hẹn giờ thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ScheduleController();