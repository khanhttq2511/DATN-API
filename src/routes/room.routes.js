const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller.js');

const { protect } = require('../middleware');
// Basic CRUD routes
router.post('/', protect, roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/', roomController.getRoomDetails);
router.put('/:id', protect, roomController.updateRoom);
router.delete('/:id', protect, roomController.deleteRoom);


// Additional routes
// router.get('/type/:type', roomController.getRoomsByType);

module.exports = router; 