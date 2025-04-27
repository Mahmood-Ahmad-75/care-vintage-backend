const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Challenge extends Model {}

Challenge.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'completed'),
        defaultValue: 'active'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Challenge',
    timestamps: true
});

module.exports = Challenge; 