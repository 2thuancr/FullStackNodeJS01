const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'fullstack_nodejs',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database Connected Successfully!');
        
        // Load all models
        require('../models');
        
        // Sync all models - chỉ tạo bảng mới nếu chưa tồn tại, không thay đổi dữ liệu
        await sequelize.sync();
        console.log('Database synchronized!');
    } catch (error) {
        console.error('Database connection failed:', error);
        // Không exit process để có thể debug
        // process.exit(1);
    }
};

module.exports = { connection, sequelize };
