const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

router.get('/', historyController.getHistory);
router.get('/device/:deviceId', historyController.getHistoryByDeviceId);
router.get('/type/:deviceType', historyController.getHistoryByDeviceType);

module.exports = router;