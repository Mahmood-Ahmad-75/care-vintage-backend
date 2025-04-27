require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGODB_URI || 'postgres://postgres:root12345@localhost:5432/auth-db',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    nodeEnv: process.env.NODE_ENV || 'development'
}; 