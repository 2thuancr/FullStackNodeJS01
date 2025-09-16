const { FavoriteProduct, Product, Category } = require('../models');

class FavoriteService {
    /**
     * Thêm sản phẩm vào danh sách yêu thích
     * @param {number} userId - ID của user
     * @param {number} productId - ID của sản phẩm
     * @returns {Promise<Object>} - Kết quả thêm favorite
     */
    async addToFavorites(userId, productId) {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            const product = await Product.findOne({
                where: { id: productId, isActive: true }
            });

            if (!product) {
                return {
                    success: false,
                    message: 'Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa'
                };
            }

            // Kiểm tra đã có trong favorite chưa
            const existingFavorite = await FavoriteProduct.findOne({
                where: { userId, productId }
            });

            if (existingFavorite) {
                return {
                    success: false,
                    message: 'Sản phẩm đã có trong danh sách yêu thích'
                };
            }

            // Thêm vào favorite
            const favorite = await FavoriteProduct.create({
                userId,
                productId
            });

            return {
                success: true,
                message: 'Đã thêm sản phẩm vào danh sách yêu thích',
                data: {
                    favoriteId: favorite.id,
                    productId: productId,
                    productName: product.name
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.addToFavorites:', error);
            return {
                success: false,
                message: 'Lỗi khi thêm sản phẩm vào danh sách yêu thích',
                error: error.message
            };
        }
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     * @param {number} userId - ID của user
     * @param {number} productId - ID của sản phẩm
     * @returns {Promise<Object>} - Kết quả xóa favorite
     */
    async removeFromFavorites(userId, productId) {
        try {
            const favorite = await FavoriteProduct.findOne({
                where: { userId, productId }
            });

            if (!favorite) {
                return {
                    success: false,
                    message: 'Sản phẩm không có trong danh sách yêu thích'
                };
            }

            await favorite.destroy();

            return {
                success: true,
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
                data: {
                    productId: productId
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.removeFromFavorites:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa sản phẩm khỏi danh sách yêu thích',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của user
     * @param {number} userId - ID của user
     * @param {Object} options - Tùy chọn phân trang và sắp xếp
     * @param {number} options.page - Trang hiện tại
     * @param {number} options.limit - Số sản phẩm mỗi trang
     * @param {string} options.sortBy - Trường sắp xếp
     * @param {string} options.sortOrder - Thứ tự sắp xếp
     * @param {string} options.search - Tìm kiếm theo tên sản phẩm
     * @returns {Promise<Object>} - Danh sách sản phẩm yêu thích
     */
    async getFavoriteProducts(userId, options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            search
        } = options;

        try {
            const offset = (page - 1) * limit;

            // Xây dựng điều kiện sắp xếp
            const validSortFields = ['createdAt', 'name', 'price', 'rating', 'views'];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            
            let order;
            if (sortField === 'createdAt') {
                order = [['createdAt', sortOrder.toUpperCase()]];
            } else {
                order = [[{ model: Product, as: 'product' }, sortField, sortOrder.toUpperCase()]];
            }

            // Xây dựng điều kiện where cho Product
            const productWhere = { isActive: true };
            if (search) {
                productWhere.name = {
                    [require('sequelize').Op.like]: `%${search}%`
                };
            }

            const result = await FavoriteProduct.findAndCountAll({
                where: { userId },
                include: [{
                    model: Product,
                    as: 'product',
                    where: productWhere,
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }],
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }],
                order,
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            const total = result.count;
            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                data: {
                    favorites: result.rows.map(row => ({
                        id: row.id,
                        addedAt: row.createdAt,
                        product: row.product
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: total,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    },
                    filters: {
                        search: search || null
                    }
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.getFavoriteProducts:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm yêu thích',
                error: error.message
            };
        }
    }

    /**
     * Kiểm tra sản phẩm có trong danh sách yêu thích không
     * @param {number} userId - ID của user
     * @param {number} productId - ID của sản phẩm
     * @returns {Promise<Object>} - Trạng thái favorite
     */
    async checkFavoriteStatus(userId, productId) {
        try {
            const favorite = await FavoriteProduct.findOne({
                where: { userId, productId }
            });

            return {
                success: true,
                data: {
                    isFavorite: !!favorite,
                    favoriteId: favorite ? favorite.id : null
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.checkFavoriteStatus:', error);
            return {
                success: false,
                message: 'Lỗi khi kiểm tra trạng thái yêu thích',
                error: error.message
            };
        }
    }

    /**
     * Lấy số lượng sản phẩm yêu thích của user
     * @param {number} userId - ID của user
     * @returns {Promise<Object>} - Số lượng favorite
     */
    async getFavoriteCount(userId) {
        try {
            const count = await FavoriteProduct.count({
                where: { userId }
            });

            return {
                success: true,
                data: {
                    favoriteCount: count
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.getFavoriteCount:', error);
            return {
                success: false,
                message: 'Lỗi khi đếm số sản phẩm yêu thích',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách user đã yêu thích sản phẩm (admin only)
     * @param {number} productId - ID của sản phẩm
     * @param {Object} options - Tùy chọn phân trang
     * @returns {Promise<Object>} - Danh sách user
     */
    async getProductFavorites(productId, options = {}) {
        const { page = 1, limit = 10 } = options;

        try {
            const offset = (page - 1) * limit;

            const result = await FavoriteProduct.findAndCountAll({
                where: { productId },
                include: [{
                    model: require('../models/user'),
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'fullName']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            const total = result.count;
            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                data: {
                    users: result.rows.map(row => ({
                        favoriteId: row.id,
                        addedAt: row.createdAt,
                        user: row.user
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: total,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.getProductFavorites:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách user yêu thích sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Xóa tất cả sản phẩm yêu thích của user
     * @param {number} userId - ID của user
     * @returns {Promise<Object>} - Kết quả xóa
     */
    async clearAllFavorites(userId) {
        try {
            const deletedCount = await FavoriteProduct.destroy({
                where: { userId }
            });

            return {
                success: true,
                message: `Đã xóa ${deletedCount} sản phẩm khỏi danh sách yêu thích`,
                data: {
                    deletedCount
                }
            };
        } catch (error) {
            console.error('Error in FavoriteService.clearAllFavorites:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa tất cả sản phẩm yêu thích',
                error: error.message
            };
        }
    }
}

module.exports = new FavoriteService();

