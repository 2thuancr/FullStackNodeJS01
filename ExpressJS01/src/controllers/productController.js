const productService = require('../services/productService');

class ProductController {
    /**
     * Lấy danh sách sản phẩm với phân trang
     * GET /api/products
     */
    async getProducts(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                categoryId,
                search,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            // Validate parameters
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            if (pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải lớn hơn 0'
                });
            }

            if (limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Số sản phẩm mỗi trang phải từ 1 đến 100'
                });
            }

            const validSortFields = ['name', 'price', 'createdAt'];
            if (!validSortFields.includes(sortBy)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trường sắp xếp không hợp lệ. Chỉ chấp nhận: name, price, createdAt'
                });
            }

            const validSortOrders = ['ASC', 'DESC'];
            if (!validSortOrders.includes(sortOrder.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Thứ tự sắp xếp không hợp lệ. Chỉ chấp nhận: ASC, DESC'
                });
            }

            const result = await productService.getProducts({
                page: pageNum,
                limit: limitNum,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                search,
                sortBy,
                sortOrder: sortOrder.toUpperCase()
            });

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ProductController.getProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy sản phẩm theo ID
     * GET /api/products/:id
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID sản phẩm không hợp lệ'
                });
            }

            const result = await productService.getProductById(parseInt(id));

            if (!result.success) {
                const statusCode = result.message.includes('Không tìm thấy') ? 404 : 500;
                return res.status(statusCode).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ProductController.getProductById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách danh mục
     * GET /api/categories
     */
    async getCategories(req, res) {
        try {
            const result = await productService.getCategories();

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ProductController.getCategories:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách danh mục',
                error: error.message
            });
        }
    }
}

module.exports = new ProductController();
