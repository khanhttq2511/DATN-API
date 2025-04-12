const HistoryService = require('../services/history.service');

class HistoryController {
  async getHistory(req, res) {
    try {
      const organizationId = req.query.organizationId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await HistoryService.getListHistory(organizationId, page, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getHistoryByDeviceId(req, res) {
    try {
      const organizationId = req.query.organizationId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await HistoryService.getHistoryByDeviceId(req.params.deviceId, organizationId, page, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getHistoryByDeviceType(req, res) {
    try {
      const organizationId = req.query.organizationId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await HistoryService.getHistoryByDeviceType(req.params.deviceType, organizationId, page, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = new HistoryController();