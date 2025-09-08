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
                sortOrder = 'DESC',
                minPrice,
                maxPrice,
                minDiscount,
                maxDiscount,
                minRating,
                status,
                popular
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

            const validSortFields = ['name', 'price', 'createdAt', 'views', 'rating', 'discount'];
            if (!validSortFields.includes(sortBy)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trường sắp xếp không hợp lệ. Chỉ chấp nhận: name, price, createdAt, views, rating, discount'
                });
            }

            const validSortOrders = ['ASC', 'DESC'];
            if (!validSortOrders.includes(sortOrder.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Thứ tự sắp xếp không hợp lệ. Chỉ chấp nhận: ASC, DESC'
                });
            }

            // Validate additional parameters
            const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
            const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;
            const minRatingNum = minRating ? parseFloat(minRating) : undefined;
            const minDiscountNum = minDiscount ? parseFloat(minDiscount) : undefined;
            const maxDiscountNum = maxDiscount ? parseFloat(maxDiscount) : undefined;
            const popularBool = popular === 'true' ? true : popular === 'false' ? false : undefined;

            // Validate price range
            if (minPriceNum !== undefined && (isNaN(minPriceNum) || minPriceNum < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Giá tối thiểu phải là số dương'
                });
            }

            if (maxPriceNum !== undefined && (isNaN(maxPriceNum) || maxPriceNum < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Giá tối đa phải là số dương'
                });
            }

            if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Giá tối thiểu không được lớn hơn giá tối đa'
                });
            }

            // Validate discount range
            if (minDiscountNum !== undefined && (isNaN(minDiscountNum) || minDiscountNum < 0 || minDiscountNum > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phần trăm giảm giá tối thiểu phải từ 0 đến 100'
                });
            }

            if (maxDiscountNum !== undefined && (isNaN(maxDiscountNum) || maxDiscountNum < 0 || maxDiscountNum > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phần trăm giảm giá tối đa phải từ 0 đến 100'
                });
            }

            if (minDiscountNum !== undefined && maxDiscountNum !== undefined && minDiscountNum > maxDiscountNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Phần trăm giảm giá tối thiểu không được lớn hơn tối đa'
                });
            }

            // Validate rating
            if (minRatingNum !== undefined && (isNaN(minRatingNum) || minRatingNum < 0 || minRatingNum > 5)) {
                return res.status(400).json({
                    success: false,
                    message: 'Đánh giá tối thiểu phải từ 0 đến 5 sao'
                });
            }

            // Validate status
            const validStatuses = ['in_stock', 'out_of_stock', 'discontinued'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: in_stock, out_of_stock, discontinued'
                });
            }

            const result = await productService.getProducts({
                page: pageNum,
                limit: limitNum,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                search,
                sortBy,
                sortOrder: sortOrder.toUpperCase(),
                minPrice: minPriceNum,
                maxPrice: maxPriceNum,
                minDiscount: minDiscountNum,
                maxDiscount: maxDiscountNum,
                minRating: minRatingNum,
                status,
                popular: popularBool
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

    /**
     * Lấy danh sách các khoảng discount có sẵn
     * GET /api/products/discount-ranges
     */
    async getDiscountRanges(req, res) {
        try {
            const result = await productService.getDiscountRanges();

            if (!result.success) {
                return res.status(500).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Error in ProductController.getDiscountRanges:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách khoảng discount',
                error: error.message
            });
        }
    }
}

module.exports = new ProductController();

