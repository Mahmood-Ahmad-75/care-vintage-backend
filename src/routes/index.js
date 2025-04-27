const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const challengeRoutes = require('./challenge.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/challenges', challengeRoutes);

// Export the router
module.exports = router; 