const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Admin only route
router.get('/admin', verifyToken, checkRole(['admin']), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

module.exports = router; 