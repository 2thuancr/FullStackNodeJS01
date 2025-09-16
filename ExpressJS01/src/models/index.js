const User = require('./user');
const Category = require('./category');
const Product = require('./product');
const FavoriteProduct = require('./favoriteProduct');
const ViewedProduct = require('./viewedProduct');
const Purchase = require('./purchase');
const Comment = require('./comment');

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

// User có nhiều FavoriteProducts
User.hasMany(FavoriteProduct, {
    foreignKey: 'userId',
    as: 'favoriteProducts'
});

// Product có nhiều FavoriteProducts
Product.hasMany(FavoriteProduct, {
    foreignKey: 'productId',
    as: 'favoriteProducts'
});

// FavoriteProduct thuộc về User và Product
FavoriteProduct.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

FavoriteProduct.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// User có nhiều ViewedProducts
User.hasMany(ViewedProduct, {
    foreignKey: 'userId',
    as: 'viewedProducts'
});

// Product có nhiều ViewedProducts
Product.hasMany(ViewedProduct, {
    foreignKey: 'productId',
    as: 'viewedProducts'
});

// ViewedProduct thuộc về User và Product
ViewedProduct.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

ViewedProduct.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// User có nhiều Purchases
User.hasMany(Purchase, {
    foreignKey: 'userId',
    as: 'purchases'
});

// Product có nhiều Purchases
Product.hasMany(Purchase, {
    foreignKey: 'productId',
    as: 'purchases'
});

// Purchase thuộc về User và Product
Purchase.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Purchase.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// User có nhiều Comments
User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments'
});

// Product có nhiều Comments
Product.hasMany(Comment, {
    foreignKey: 'productId',
    as: 'comments'
});

// Comment thuộc về User và Product
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Comment.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Comment có thể có parent comment (reply)
Comment.hasMany(Comment, {
    foreignKey: 'parentId',
    as: 'replies'
});

Comment.belongsTo(Comment, {
    foreignKey: 'parentId',
    as: 'parent'
});

module.exports = {
    User,
    Category,
    Product,
    FavoriteProduct,
    ViewedProduct,
    Purchase,
    Comment
};

