const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');

// Basic CRUD routes
router.post('/', sensorController.createSensor);
router.get('/', sensorController.getAllSensors);
router.get('/:id', sensorController.getSensorById);
router.put('/:id', sensorController.updateSensor);
router.delete('/:id', sensorController.deleteSensor);

// Additional routes
router.get('/device/:deviceId', sensorController.getSensorsByDevice);

module.exports = router; 