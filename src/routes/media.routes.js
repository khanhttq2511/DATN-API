const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/media.controller');

// Các route CRUD cho Item
router.post('/upload', MediaController.uploadFiles)
router.post('/upload-document', MediaController.uploadDocument)
router.post('/upload-video', MediaController.uploadVideo)


module.exports = router;