const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Thêm các trường mới cho tính năng lọc
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    discount: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    ratingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('in_stock', 'out_of_stock', 'discontinued'),
        defaultValue: 'in_stock'
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = Product;
