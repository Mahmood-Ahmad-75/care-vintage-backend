const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const initializeDatabase = require('./config/db.init');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:8081',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);
 
// Initialize database and start server
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; 