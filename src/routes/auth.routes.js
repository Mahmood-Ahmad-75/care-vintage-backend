const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

 

 
module.exports = router; 