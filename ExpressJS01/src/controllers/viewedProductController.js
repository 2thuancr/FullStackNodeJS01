const viewedProductService = require('../services/viewedProductService');

class ViewedProductController {
    /**
     * Ghi nhận sản phẩm đã xem
     * POST /v1/api/viewed-products
     */
    async trackProductView(req, res) {
        try {
            const { productId } = req.body;
            
            // Lấy userId từ token nếu có (optional)
            let userId = null;
            try {
                const token = req.header('Authorization')?.replace('Bearer ', '');
                if (token) {
                    const userService = require('../services/userService');
                    const decoded = userService.verifyToken(token);
                    const user = await userService.findById(decoded.id);
                    if (user) {
                        userId = user.id;
                    }
                }
            } catch (error) {
                // Token không hợp lệ hoặc không có, tiếp tục như guest
                console.log('No valid token, tracking as guest');
            }
            
            const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const userAgent = req.get('User-Agent');
            
            // Tạo sessionId nếu không có
            let sessionId = req.sessionID || req.headers['x-session-id'] || req.headers['x-request-id'];
            if (!sessionId) {
                // Tạo sessionId dựa trên IP + UserAgent + timestamp
                const crypto = require('crypto');
                sessionId = crypto.createHash('md5')
                    .update(ipAddress + userAgent + Date.now().toString())
                    .digest('hex')
                    .substring(0, 16);
            }

            // Validate input
            if (!productId || isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            // Log để debug
            console.log('🔍 Tracking product view:', {
                productId: parseInt(productId),
                userId,
                ipAddress,
                sessionId: sessionId ? sessionId.substring(0, 10) + '...' : 'null',
                userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'null'
            });

            const result = await viewedProductService.trackProductView({
                userId,
                productId: parseInt(productId),
                ipAddress,
                userAgent,
                sessionId
            });

            if (!result.success) {
                const statusCode = result.message.includes('không tồn tại') ? 404 : 400;
                return res.status(statusCode).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.trackProductView:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi ghi nhận lượt xem sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy lịch sử xem sản phẩm của user
     * GET /v1/api/viewed-products
     */
    async getViewedProducts(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 10,
                sortBy = 'viewedAt',
                sortOrder = 'DESC',
                days = 30
            } = req.query;

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const daysNum = parseInt(days);

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

            if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
                return res.status(400).json({
                    success: false,
                    message: 'Số ngày phải từ 1 đến 365'
                });
            }

            // Validate sort options
            const validSortFields = ['viewedAt', 'name', 'price', 'rating'];
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

            const result = await viewedProductService.getViewedProducts(userId, {
                page: pageNum,
                limit: limitNum,
                sortBy,
                sortOrder: sortOrder.toUpperCase(),
                days: daysNum
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.getViewedProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy lịch sử xem sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy lịch sử xem sản phẩm của guest
     * GET /v1/api/viewed-products/guest
     */
    async getGuestViewedProducts(req, res) {
        try {
            // Tạo sessionId nếu không có (tương tự như trackProductView)
            let sessionId = req.sessionID || req.headers['x-session-id'] || req.headers['x-request-id'];
            
            if (!sessionId) {
                // Tạo sessionId dựa trên IP + UserAgent + timestamp
                const crypto = require('crypto');
                const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
                const userAgent = req.get('User-Agent') || 'unknown';
                sessionId = crypto.createHash('md5')
                    .update(ipAddress + userAgent + Date.now().toString())
                    .digest('hex')
                    .substring(0, 16);
            }

            const {
                page = 1,
                limit = 10,
                days = 7
            } = req.query;

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const daysNum = parseInt(days);

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải là số nguyên dương'
                });
            }

            if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Số sản phẩm mỗi trang phải từ 1 đến 50'
                });
            }

            if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Số ngày phải từ 1 đến 30'
                });
            }

            // Log để debug
            console.log('🔍 Getting guest viewed products:', {
                sessionId: sessionId ? sessionId.substring(0, 10) + '...' : 'null',
                page: pageNum,
                limit: limitNum,
                days: daysNum
            });

            const result = await viewedProductService.getGuestViewedProducts(sessionId, {
                page: pageNum,
                limit: limitNum,
                days: daysNum
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            // Thêm sessionId vào response để client có thể sử dụng
            result.data.sessionId = sessionId;

            res.json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.getGuestViewedProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy lịch sử xem sản phẩm của guest',
                error: error.message
            });
        }
    }

    /**
     * Xóa lịch sử xem sản phẩm
     * DELETE /v1/api/viewed-products
     */
    async clearViewedHistory(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.query;

            // Validate productId if provided
            if (productId && isNaN(parseInt(productId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            const result = await viewedProductService.clearViewedHistory(
                userId, 
                productId ? parseInt(productId) : null
            );

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.clearViewedHistory:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa lịch sử xem sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy thống kê xem sản phẩm
     * GET /v1/api/viewed-products/statistics
     */
    async getViewStatistics(req, res) {
        try {
            const userId = req.user.id;
            const { days = 30 } = req.query;

            const daysNum = parseInt(days);

            if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
                return res.status(400).json({
                    success: false,
                    message: 'Số ngày phải từ 1 đến 365'
                });
            }

            const result = await viewedProductService.getViewStatistics(userId, {
                days: daysNum
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.getViewStatistics:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thống kê xem sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách sản phẩm được xem nhiều nhất (admin)
     * GET /v1/api/viewed-products/most-viewed
     */
    async getMostViewedProducts(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                days = 30
            } = req.query;

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const daysNum = parseInt(days);

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

            if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
                return res.status(400).json({
                    success: false,
                    message: 'Số ngày phải từ 1 đến 365'
                });
            }

            const result = await viewedProductService.getMostViewedProducts({
                page: pageNum,
                limit: limitNum,
                days: daysNum
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ViewedProductController.getMostViewedProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sản phẩm được xem nhiều nhất',
                error: error.message
            });
        }
    }
}

module.exports = new ViewedProductController();
