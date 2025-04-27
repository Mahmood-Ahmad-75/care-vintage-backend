const sequelize = require('./database');

const initializeDatabase = async () => {
    try {
        // Test the connection
        await sequelize.authenticate();
        console.log('PostgreSQL connection has been established successfully.');

        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized successfully.');

        return sequelize;
    } catch (error) {
        console.error('Unable to initialize database:', error);
        throw error;
    }
};

module.exports = initializeDatabase; 