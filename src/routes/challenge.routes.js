const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Add new challenge
router.post('/', challengeController.addChallenge);

// Complete a challenge
router.post('/:challengeId/complete', challengeController.completeChallenge);

// Get user's challenges
router.get('/', challengeController.getUserChallenges);

module.exports = router; 