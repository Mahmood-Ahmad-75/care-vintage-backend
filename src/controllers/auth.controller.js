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
    console.log("login");
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

        // Generate 6-digit PIN
        const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
        await user.update({
            resetPasswordToken: resetPin,
            resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        });

        // TODO: Send email with reset token
        // For now, we'll just return the token (in production, send via email)
        res.json({
            message: "Password reset token generated",
            resetPin,
        });
    } catch (error) {
        next(error);
    }
};
// otp
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        console.log("email,otp---------------------------",email,otp);
        if (!otp || !email) {
            throw new ValidationError("OTP and email are required");
        }
        const user = await User.findOne({
            where: {
                resetPasswordToken: otp,
                resetPasswordExpires: {
                    [Op.gt]: new Date()
                },
                email: email
            }
        });

        if (!user) {
            throw new ValidationError("Invalid or expired reset pin");
        }
        res.json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
}

// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const {   newPassword ,email} = req.body;
        console.log("email,newPassword",email,newPassword);
        if (!email || !newPassword) {
            throw new ValidationError("Email and new password are required");
        }

        // Find user with valid emaik

        const user = await User.findOne({
            where: {
               
                email: email
            }
        });

        if (!user) {
            throw new ValidationError("Invalid email");
        }

        // Update password and clear reset pin
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
    verifyOTP
};
