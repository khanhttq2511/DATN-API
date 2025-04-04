const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { protect } = require('../middleware');
// Basic CRUD routes
router.get('/list-type', deviceController.getDevicesByType);
router.post('/', protect, deviceController.createDevice);
router.get('/', deviceController.getAllDevicesByRoomId);
router.get('/:id', deviceController.getDeviceById);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);
router.post('/toggle-status', deviceController.toggleStatus);




module.exports = router; 