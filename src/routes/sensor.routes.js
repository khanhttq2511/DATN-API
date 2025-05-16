const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');

// Basic CRUD routes
router.post('/', sensorController.createSensor);
router.get('/', sensorController.getAllSensors);
router.get('/:roomId', sensorController.getSensorById);
router.put('/:id', sensorController.updateSensor);
router.delete('/:id', sensorController.deleteSensor);

// Additional routes
router.get('/device/:deviceId', sensorController.getSensorsByDevice);

// Time-based data routes
router.get('/data/daily', sensorController.getSensorsByDay);
router.get('/data/weekly', sensorController.getSensorsByWeek);
router.get('/data/monthly', sensorController.getSensorsByMonth);

module.exports = router; 