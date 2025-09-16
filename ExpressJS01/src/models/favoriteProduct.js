const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FavoriteProduct = sequelize.define('FavoriteProduct', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    }
}, {
    tableName: 'favorite_products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'productId']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['productId']
        }
    ]
});

module.exports = FavoriteProduct;

