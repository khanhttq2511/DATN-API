const History = require('../models/history.model');

class HistoryService {
  async createHistory(history) {
    return History.create(history);
  }
  async getListHistory(organizationId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const history = await History.find({ organizationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await History.countDocuments({ organizationId });
    
    return {
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getHistoryByDeviceId(deviceId, organizationId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const history = await History.find({ deviceId, organizationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await History.countDocuments({ deviceId, organizationId });
    
    return {
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getHistoryByDeviceType(deviceType, organizationId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const history = await History.find({ deviceType, organizationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await History.countDocuments({ deviceType, organizationId });
    
    return {
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
module.exports = new HistoryService();