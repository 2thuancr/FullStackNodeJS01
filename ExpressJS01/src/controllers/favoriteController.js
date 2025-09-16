const favoriteService = require('../services/favoriteService');

class FavoriteController {
    /**
     * Thêm sản phẩm vào danh sách yêu thích
     * POST /v1/api/favorites
     */
    async addToFavorites(req, res) {
        try {
            const { productId } = req.body;
            const userId = req.user.id;

            // Validate input
            if (!productId || isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            const result = await favoriteService.addToFavorites(userId, parseInt(productId));

            if (!result.success) {
                const statusCode = result.message.includes('không tồn tại') ? 404 : 400;
                return res.status(statusCode).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('Error in FavoriteController.addToFavorites:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi thêm sản phẩm vào danh sách yêu thích',
                error: error.message
            });
        }
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     * DELETE /v1/api/favorites/:productId
     */
    async removeFromFavorites(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            // Validate input
            if (!productId || isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            const result = await favoriteService.removeFromFavorites(userId, parseInt(productId));

            if (!result.success) {
                const statusCode = result.message.includes('không có trong') ? 404 : 400;
                return res.status(statusCode).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.removeFromFavorites:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa sản phẩm khỏi danh sách yêu thích',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách sản phẩm yêu thích
     * GET /v1/api/favorites
     */
    async getFavoriteProducts(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải là số nguyên dương'
                });
            }

            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Số sản phẩm mỗi trang phải từ 1 đến 100'
                });
            }

            // Validate sort options
            const validSortFields = ['createdAt', 'name', 'price', 'rating', 'views'];
            if (!validSortFields.includes(sortBy)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trường sắp xếp không hợp lệ'
                });
            }

            const validSortOrders = ['ASC', 'DESC'];
            if (!validSortOrders.includes(sortOrder.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Thứ tự sắp xếp không hợp lệ'
                });
            }

            const result = await favoriteService.getFavoriteProducts(userId, {
                page: pageNum,
                limit: limitNum,
                sortBy,
                sortOrder: sortOrder.toUpperCase()
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.getFavoriteProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sản phẩm yêu thích',
                error: error.message
            });
        }
    }

    /**
     * Kiểm tra trạng thái yêu thích của sản phẩm
     * GET /v1/api/favorites/check/:productId
     */
    async checkFavoriteStatus(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            // Validate input
            if (!productId || isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            const result = await favoriteService.checkFavoriteStatus(userId, parseInt(productId));

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.checkFavoriteStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi kiểm tra trạng thái yêu thích',
                error: error.message
            });
        }
    }

    /**
     * Lấy số lượng sản phẩm yêu thích
     * GET /v1/api/favorites/count
     */
    async getFavoriteCount(req, res) {
        try {
            const userId = req.user.id;

            const result = await favoriteService.getFavoriteCount(userId);

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.getFavoriteCount:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi đếm số sản phẩm yêu thích',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách user đã yêu thích sản phẩm (admin only)
     * GET /v1/api/favorites/product/:productId/users
     */
    async getProductFavorites(req, res) {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Validate input
            if (!productId || isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải là số nguyên dương'
                });
            }

            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Số user mỗi trang phải từ 1 đến 100'
                });
            }

            const result = await favoriteService.getProductFavorites(parseInt(productId), {
                page: pageNum,
                limit: limitNum
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.getProductFavorites:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách user yêu thích sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Xóa tất cả sản phẩm yêu thích
     * DELETE /v1/api/favorites/clear
     */
    async clearAllFavorites(req, res) {
        try {
            const userId = req.user.id;

            const result = await favoriteService.clearAllFavorites(userId);

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in FavoriteController.clearAllFavorites:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa tất cả sản phẩm yêu thích',
                error: error.message
            });
        }
    }
}

module.exports = new FavoriteController();

