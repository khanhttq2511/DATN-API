const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { protect } = require('../middleware');

// --- Manual (One-Time) Schedule Routes ---
router.post('/', protect, scheduleController.createSchedule);
router.get('/manual/device/:deviceId', protect, scheduleController.getSchedulesByDeviceId);
router.get('/manual/:id', protect, scheduleController.getScheduleById);
router.put('/manual/:id', protect, scheduleController.updateSchedule);
router.delete('/manual/:id', protect, scheduleController.deleteSchedule);

// --- Auto Mode Schedule Routes ---
// Create or Update an auto-mode schedule for a device. Uses deviceId from body.
router.post('/auto-mode', protect, scheduleController.createOrUpdateAutoModeSchedule);
// Get the auto-mode schedule for a specific device by deviceId
router.get('/auto-mode/device/:deviceId', protect, scheduleController.getAllAutoModeSchedulesByDeviceId);
// Delete the auto-mode schedule for a specific device by scheduleId
router.delete('/auto-mode/device/:scheduleId', protect, scheduleController.deleteAutoModeSchedule);

// --- Common Routes (Logs, Cron Trigger) ---
// Endpoint to manually trigger the cron job for checking auto mode schedules (for testing/admin)
// Ensure proper protection for this if it's not just for internal testing.
router.get('/auto-mode/execute', protect, scheduleController.checkAndExecuteAutoMode);

// Schedule execution logs routes
// router.get('/logs', protect, scheduleController.getScheduleLogs);
// router.get('/logs/:id', protect, scheduleController.getScheduleLogById);

module.exports = router;