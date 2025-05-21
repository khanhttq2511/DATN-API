const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { protect } = require('../middleware');


// Basic CRUD routes
router.post('/', protect, roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/details', roomController.getRoomDetails);
router.get('/automode', protect, roomController.getRoomsByAutomode);
router.post('/automode', protect, roomController.changeAutomode);
router.get('/:id', roomController.getRoomById);
router.put('/:id', protect, roomController.updateRoom);
router.delete('/:id', protect, roomController.deleteRoom);
router.put('/update-allowed-devices', protect, roomController.updateAllowedDevices);
router.put('/force-update-allowed-devices', protect, roomController.forceUpdateAllowedDevices);

// Additional routes
// router.get('/type/:type', roomController.getRoomsByType);

module.exports = router; 