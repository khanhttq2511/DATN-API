const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware');
// User routes
router.get('/me', protect, userController.me);
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/verify-otp', userController.verifyOTP);
router.post('/send-otp', userController.sendOTP);
router.post('/change-password', userController.resetPassword);
router.post('/logout', userController.logout);

module.exports = router; 