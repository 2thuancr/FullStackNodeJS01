const { ViewedProduct, Product, Category } = require('../models');

class ViewedProductService {
    /**
     * Ghi nhận sản phẩm đã xem
     * @param {Object} data - Dữ liệu view
     * @param {number} data.userId - ID của user (nullable cho guest)
     * @param {number} data.productId - ID của sản phẩm
     * @param {string} data.ipAddress - IP address
     * @param {string} data.userAgent - User agent
     * @param {string} data.sessionId - Session ID cho guest
     * @returns {Promise<Object>} - Kết quả ghi nhận view
     */
    async trackProductView(data) {
        try {
            const { userId, productId, ipAddress, userAgent, sessionId } = data;

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

            // Kiểm tra đã xem gần đây chưa (trong 10 giây) để tránh spam mạnh hơn
            const recentView = await ViewedProduct.findOne({
                where: {
                    productId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 1000) // 10 giây trước
                    }
                },
                order: [['viewedAt', 'DESC']]
            });

            // Kiểm tra duplicate dựa trên userId hoặc IP + UserAgent
            let isDuplicate = false;
            
            if (userId) {
                // User đã đăng nhập: kiểm tra theo userId
                if (recentView && recentView.userId === userId) {
                    isDuplicate = true;
                }
            } else {
                // Guest user: kiểm tra theo IP + UserAgent (không cần sessionId)
                if (recentView && 
                    recentView.ipAddress === ipAddress &&
                    recentView.userAgent === userAgent) {
                    isDuplicate = true;
                }
            }

            if (isDuplicate) {
                return {
                    success: true,
                    message: 'Đã ghi nhận lượt xem (tránh spam)',
                    data: {
                        productId,
                        isNewView: false
                    }
                };
            }

            // Ghi nhận view mới
            const viewedProduct = await ViewedProduct.create({
                userId: userId || null,
                productId,
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
                sessionId: sessionId || null,
                viewedAt: new Date()
            });

            // Tăng view count của sản phẩm
            await Product.increment('views', {
                where: { id: productId }
            });

            return {
                success: true,
                message: 'Đã ghi nhận lượt xem sản phẩm',
                data: {
                    viewId: viewedProduct.id,
                    productId,
                    isNewView: true
                }
            };
        } catch (error) {
            console.error('Error in ViewedProductService.trackProductView:', error);
            return {
                success: false,
                message: 'Lỗi khi ghi nhận lượt xem sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy lịch sử xem sản phẩm của user
     * @param {number} userId - ID của user
     * @param {Object} options - Tùy chọn phân trang và lọc
     * @returns {Promise<Object>} - Lịch sử xem sản phẩm
     */
    async getViewedProducts(userId, options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'viewedAt',
            sortOrder = 'DESC',
            days = 30 // Lấy lịch sử trong X ngày gần đây
        } = options;

        try {
            const offset = (page - 1) * limit;

            // Tính ngày bắt đầu
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Xây dựng điều kiện sắp xếp
            const validSortFields = ['viewedAt', 'name', 'price', 'rating'];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'viewedAt';
            
            let order;
            if (sortField === 'viewedAt') {
                order = [['viewedAt', sortOrder.toUpperCase()]];
            } else {
                order = [[{ model: Product, as: 'product' }, sortField, sortOrder.toUpperCase()]];
            }

            const result = await ViewedProduct.findAndCountAll({
                where: {
                    userId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                include: [{
                    model: Product,
                    as: 'product',
                    where: { isActive: true },
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

            // Loại bỏ duplicate products (chỉ lấy lần xem gần nhất)
            const uniqueProducts = new Map();
            result.rows.forEach(row => {
                if (!uniqueProducts.has(row.productId) || 
                    new Date(row.viewedAt) > new Date(uniqueProducts.get(row.productId).viewedAt)) {
                    uniqueProducts.set(row.productId, row);
                }
            });

            const uniqueRows = Array.from(uniqueProducts.values());

            return {
                success: true,
                data: {
                    viewedProducts: uniqueRows.map(row => ({
                        id: row.id,
                        viewedAt: row.viewedAt,
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
                        days,
                        startDate,
                        endDate: new Date()
                    }
                }
            };
        } catch (error) {
            console.error('Error in ViewedProductService.getViewedProducts:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy lịch sử xem sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy lịch sử xem sản phẩm của guest (theo sessionId)
     * @param {string} sessionId - Session ID của guest
     * @param {Object} options - Tùy chọn phân trang
     * @returns {Promise<Object>} - Lịch sử xem sản phẩm
     */
    async getGuestViewedProducts(sessionId, options = {}) {
        const {
            page = 1,
            limit = 10,
            days = 7 // Guest chỉ lưu 7 ngày
        } = options;

        try {
            const offset = (page - 1) * limit;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const result = await ViewedProduct.findAndCountAll({
                where: {
                    sessionId,
                    userId: null, // Chỉ lấy guest views
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                include: [{
                    model: Product,
                    as: 'product',
                    where: { isActive: true },
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }],
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }],
                order: [['viewedAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            const total = result.count;
            const totalPages = Math.ceil(total / limit);

            // Loại bỏ duplicate products
            const uniqueProducts = new Map();
            result.rows.forEach(row => {
                if (!uniqueProducts.has(row.productId) || 
                    new Date(row.viewedAt) > new Date(uniqueProducts.get(row.productId).viewedAt)) {
                    uniqueProducts.set(row.productId, row);
                }
            });

            const uniqueRows = Array.from(uniqueProducts.values());

            return {
                success: true,
                data: {
                    viewedProducts: uniqueRows.map(row => ({
                        id: row.id,
                        viewedAt: row.viewedAt,
                        product: row.product
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
            console.error('Error in ViewedProductService.getGuestViewedProducts:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy lịch sử xem sản phẩm của guest',
                error: error.message
            };
        }
    }

    /**
     * Xóa lịch sử xem sản phẩm của user
     * @param {number} userId - ID của user
     * @param {number} productId - ID của sản phẩm (optional, nếu không có thì xóa tất cả)
     * @returns {Promise<Object>} - Kết quả xóa
     */
    async clearViewedHistory(userId, productId = null) {
        try {
            const whereCondition = { userId };
            if (productId) {
                whereCondition.productId = productId;
            }

            const deletedCount = await ViewedProduct.destroy({
                where: whereCondition
            });

            return {
                success: true,
                message: productId 
                    ? `Đã xóa lịch sử xem sản phẩm ${productId}`
                    : `Đã xóa ${deletedCount} lượt xem khỏi lịch sử`,
                data: {
                    deletedCount
                }
            };
        } catch (error) {
            console.error('Error in ViewedProductService.clearViewedHistory:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa lịch sử xem sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy thống kê xem sản phẩm của user
     * @param {number} userId - ID của user
     * @param {Object} options - Tùy chọn thống kê
     * @returns {Promise<Object>} - Thống kê xem sản phẩm
     */
    async getViewStatistics(userId, options = {}) {
        const { days = 30 } = options;

        try {
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Tổng số lượt xem
            const totalViews = await ViewedProduct.count({
                where: {
                    userId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                }
            });

            // Số sản phẩm unique đã xem
            const uniqueProducts = await ViewedProduct.count({
                where: {
                    userId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                distinct: true,
                col: 'productId'
            });

            // Sản phẩm xem nhiều nhất
            const mostViewed = await ViewedProduct.findAll({
                where: {
                    userId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'imageUrl']
                }],
                attributes: [
                    'productId',
                    [require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'viewCount']
                ],
                group: ['productId'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'DESC']],
                limit: 5
            });

            // Thống kê theo ngày
            const dailyStats = await ViewedProduct.findAll({
                where: {
                    userId,
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                attributes: [
                    [require('sequelize').fn('DATE', require('sequelize').col('viewedAt')), 'date'],
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'viewCount']
                ],
                group: [require('sequelize').fn('DATE', require('sequelize').col('viewedAt'))],
                order: [[require('sequelize').fn('DATE', require('sequelize').col('viewedAt')), 'ASC']]
            });

            return {
                success: true,
                data: {
                    totalViews,
                    uniqueProducts,
                    mostViewed: mostViewed.map(item => ({
                        product: item.product,
                        viewCount: parseInt(item.dataValues.viewCount)
                    })),
                    dailyStats: dailyStats.map(item => ({
                        date: item.dataValues.date,
                        viewCount: parseInt(item.dataValues.viewCount)
                    })),
                    period: {
                        days,
                        startDate,
                        endDate: new Date()
                    }
                }
            };
        } catch (error) {
            console.error('Error in ViewedProductService.getViewStatistics:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê xem sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách sản phẩm được xem nhiều nhất (admin)
     * @param {Object} options - Tùy chọn phân trang và lọc
     * @returns {Promise<Object>} - Danh sách sản phẩm hot
     */
    async getMostViewedProducts(options = {}) {
        const {
            page = 1,
            limit = 10,
            days = 30
        } = options;

        try {
            const offset = (page - 1) * limit;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const result = await ViewedProduct.findAndCountAll({
                where: {
                    viewedAt: {
                        [require('sequelize').Op.gte]: startDate
                    }
                },
                include: [{
                    model: Product,
                    as: 'product',
                    where: { isActive: true },
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }]
                }],
                attributes: [
                    'productId',
                    [require('sequelize').fn('COUNT', require('sequelize').col('ViewedProduct.id')), 'viewCount'],
                    [require('sequelize').fn('MAX', require('sequelize').col('ViewedProduct.viewedAt')), 'lastViewedAt']
                ],
                group: ['productId'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('ViewedProduct.id')), 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            const total = result.count;
            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                data: {
                    mostViewed: result.rows.map(item => ({
                        product: item.product,
                        viewCount: parseInt(item.dataValues.viewCount),
                        lastViewedAt: item.dataValues.lastViewedAt
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
            console.error('Error in ViewedProductService.getMostViewedProducts:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm được xem nhiều nhất',
                error: error.message
            };
        }
    }
}

module.exports = new ViewedProductService();
