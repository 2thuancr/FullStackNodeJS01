const User = require('./user');
const Category = require('./category');
const Product = require('./product');

// Thiết lập quan hệ giữa các model
// Product thuộc về Category
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// Category có nhiều Products
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
});

module.exports = {
    User,
    Category,
    Product
};

