const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ViewedProduct = sequelize.define('ViewedProduct', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Cho phép guest users
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    viewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    ipAddress: {
        type: DataTypes.STRING(45), // IPv6 compatible
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sessionId: {
        type: DataTypes.STRING(255),
        allowNull: true // Để track guest users
    }
}, {
    tableName: 'viewed_products',
    timestamps: false, // Sử dụng viewedAt thay vì createdAt
    indexes: [
        {
            fields: ['userId', 'viewedAt']
        },
        {
            fields: ['productId', 'viewedAt']
        },
        {
            fields: ['sessionId', 'viewedAt']
        },
        {
            fields: ['viewedAt']
        }
    ]
});

module.exports = ViewedProduct;

