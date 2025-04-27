const Challenge = require('../models/challenge.model');
const User = require('../models/user.model');

// Add new challenge
const addChallenge = async (req, res) => {
    try {
        const { title, description, points } = req.body;
        const userId = req.user.id; // From auth middleware

        const challenge = await Challenge.create({
            title,
            description,
            points,
            userId
        });

        res.status(201).json({
            message: 'Challenge created successfully',
            challenge
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating challenge',
            error: error.message
        });
    }
};

// Complete a challenge
const completeChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user.id;

        // Find the challenge
        const challenge = await Challenge.findOne({
            where: {
                id: challengeId,
                userId: userId
            }
        });

        if (!challenge) {
            return res.status(404).json({
                message: 'Challenge not found or not authorized'
            });
        }

        if (challenge.status === 'completed') {
            return res.status(400).json({
                message: 'Challenge is already completed'
            });
        }

        // Update challenge status
        await challenge.update({
            status: 'completed',
            completedAt: new Date()
        });

        // Update user points
        const user = await User.findByPk(userId);
        await user.increment('points', { by: challenge.points });

        res.json({
            message: 'Challenge completed successfully',
            challenge,
            pointsEarned: challenge.points
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error completing challenge',
            error: error.message
        });
    }
};

// Get user's challenges
const getUserChallenges = async (req, res) => {
    try {
        const userId = req.user.id;

        const challenges = await Challenge.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            challenges
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching challenges',
            error: error.message
        });
    }
};

module.exports = {
    addChallenge,
    completeChallenge,
    getUserChallenges
}; 