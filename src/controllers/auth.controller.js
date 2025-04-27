const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const {
    ValidationError,
    AuthenticationError,
    ConflictError,
    NotFoundError
} = require("../utils/errors");

// Register new user
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [{ email }, { username }] 
            } 
        });
        if (existingUser) {
            throw new ConflictError("User already exists");
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new AuthenticationError("Invalid credentials");
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AuthenticationError("Invalid credentials");
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        });

        // TODO: Send email with reset token
        // For now, we'll just return the token (in production, send via email)
        res.json({
            message: "Password reset token generated",
            resetToken,
        });
    } catch (error) {
        next(error);
    }
};

// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            throw new ValidationError("Reset token and new password are required");
        }

        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            throw new ValidationError("Invalid or expired reset token");
        }

        // Update password and clear reset token
        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        res.json({ message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
};
