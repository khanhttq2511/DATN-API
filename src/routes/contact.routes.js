// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// POST /api/contact
router.post('/', contactController.createContact);

// GET /api/contact
router.get('/', contactController.getContacts);

module.exports = router;
