const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { protect } = require('../middleware');

router.post('/', protect, scheduleController.createSchedule);
router.get('/device/:deviceId', protect, scheduleController.getSchedulesByDeviceId);
router.get('/:id', protect, scheduleController.getScheduleById);
router.put('/:id', protect, scheduleController.updateSchedule);
router.delete('/:id', protect, scheduleController.deleteSchedule);

module.exports = router;