const { Product, Category } = require('../models');

class ProductService {
    /**
     * Lấy danh sách sản phẩm với phân trang
     * @param {Object} options - Tùy chọn lọc và phân trang
     * @param {number} options.page - Trang hiện tại (mặc định: 1)
     * @param {number} options.limit - Số sản phẩm mỗi trang (mặc định: 10)
     * @param {number} options.categoryId - ID danh mục (tùy chọn)
     * @param {string} options.search - Tìm kiếm theo tên sản phẩm (tùy chọn)
     * @param {string} options.sortBy - Sắp xếp theo (name, price, createdAt, views, rating) (mặc định: createdAt)
     * @param {string} options.sortOrder - Thứ tự sắp xếp (ASC, DESC) (mặc định: DESC)
     * @param {number} options.minPrice - Giá tối thiểu (tùy chọn)
     * @param {number} options.maxPrice - Giá tối đa (tùy chọn)
     * @param {boolean} options.hasDiscount - Có khuyến mãi hay không (tùy chọn)
     * @param {number} options.minRating - Đánh giá tối thiểu (tùy chọn)
     * @param {string} options.status - Trạng thái sản phẩm (in_stock, out_of_stock, discontinued) (tùy chọn)
     * @param {boolean} options.popular - Sản phẩm phổ biến (views cao) (tùy chọn)
     * @returns {Promise<Object>} - Kết quả phân trang
     */
    async getProducts(options = {}) {
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
            popular,
            minViews,
            maxViews
        } = options;

        // Tính offset
        const offset = (page - 1) * limit;

        // Xây dựng điều kiện where
        const where = {
            isActive: true
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.name = {
                [require('sequelize').Op.like]: `%${search}%`
            };
        }

        // Lọc theo giá
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price[require('sequelize').Op.gte] = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price[require('sequelize').Op.lte] = maxPrice;
            }
        }

        // Lọc theo khoảng giảm giá
        if (minDiscount !== undefined || maxDiscount !== undefined) {
            where.discount = {};
            if (minDiscount !== undefined) {
                where.discount[require('sequelize').Op.gte] = minDiscount;
            }
            if (maxDiscount !== undefined) {
                where.discount[require('sequelize').Op.lte] = maxDiscount;
            }
        }

        // Lọc theo đánh giá
        if (minRating !== undefined) {
            where.rating = {
                [require('sequelize').Op.gte]: minRating
            };
        }

        // Lọc theo trạng thái
        if (status) {
            where.status = status;
        }

        // Lọc sản phẩm phổ biến (views cao)
        if (popular) {
            where.views = {
                [require('sequelize').Op.gte]: 5000 // Ngưỡng views để coi là phổ biến
            };
        }

        // Lọc theo khoảng view count
        if (minViews !== undefined || maxViews !== undefined) {
            where.views = {};
            if (minViews !== undefined) {
                where.views[require('sequelize').Op.gte] = minViews;
            }
            if (maxViews !== undefined) {
                where.views[require('sequelize').Op.lte] = maxViews;
            }
        }

        // Xây dựng điều kiện sắp xếp
        const validSortFields = ['name', 'price', 'createdAt', 'views', 'rating', 'discount'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const order = [[sortField, sortOrder.toUpperCase()]];

        try {
            const result = await Product.findAndCountAll({
                where,
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }],
                order,
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true // Đảm bảo đếm chính xác khi có join
            });

            const total = result.count;
            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                data: {
                    products: result.rows,
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
            console.error('Error in ProductService.getProducts:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy sản phẩm theo ID
     * @param {number} id - ID sản phẩm
     * @returns {Promise<Object>} - Thông tin sản phẩm
     */
    async getProductById(id) {
        try {
            const product = await Product.findOne({
                where: {
                    id,
                    isActive: true
                },
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }]
            });

            if (!product) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            return {
                success: true,
                data: product
            };
        } catch (error) {
            console.error('Error in ProductService.getProductById:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách danh mục
     * @returns {Promise<Object>} - Danh sách danh mục
     */
    async getCategories() {
        try {
            const categories = await Category.findAll({
                where: {
                    isActive: true
                },
                order: [['name', 'ASC']]
            });

            return {
                success: true,
                data: categories
            };
        } catch (error) {
            console.error('Error in ProductService.getCategories:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách danh mục',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách các khoảng discount có sẵn
     * @returns {Promise<Object>} - Danh sách khoảng discount
     */
    async getDiscountRanges() {
        try {
            const ranges = [
                { label: '0% - 5%', minDiscount: 0, maxDiscount: 5, description: 'Giảm giá nhẹ' },
                { label: '5% - 10%', minDiscount: 5, maxDiscount: 10, description: 'Giảm giá vừa' },
                { label: '10% - 15%', minDiscount: 10, maxDiscount: 15, description: 'Giảm giá tốt' },
                { label: '15% - 20%', minDiscount: 15, maxDiscount: 20, description: 'Giảm giá cao' },
                { label: 'Trên 20%', minDiscount: 20, maxDiscount: 100, description: 'Giảm giá cực cao' }
            ];

            // Đếm số sản phẩm trong mỗi khoảng
            for (const range of ranges) {
                const count = await Product.count({
                    where: {
                        isActive: true,
                        discount: {
                            [require('sequelize').Op.gte]: range.minDiscount,
                            [require('sequelize').Op.lte]: range.maxDiscount
                        }
                    }
                });
                range.productCount = count;
            }

            return {
                success: true,
                data: ranges
            };
        } catch (error) {
            console.error('Error in ProductService.getDiscountRanges:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách khoảng discount',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách các khoảng view count có sẵn
     * @returns {Promise<Object>} - Danh sách khoảng view count
     */
    async getViewCountRanges() {
        try {
            const ranges = [
                { 
                    label: 'Dưới 1,000 lượt xem', 
                    minViews: 0, 
                    maxViews: 999, 
                    description: 'Sản phẩm mới',
                    color: '#2196F3',
                    icon: '🆕'
                },
                { 
                    label: '1,000 - 3,000 lượt xem', 
                    minViews: 1000, 
                    maxViews: 2999, 
                    description: 'Sản phẩm đang phát triển',
                    color: '#4CAF50',
                    icon: '📈'
                },
                { 
                    label: '3,000 - 5,000 lượt xem', 
                    minViews: 3000, 
                    maxViews: 4999, 
                    description: 'Sản phẩm phổ biến',
                    color: '#FF9800',
                    icon: '⭐'
                },
                { 
                    label: '5,000 - 10,000 lượt xem', 
                    minViews: 5000, 
                    maxViews: 9999, 
                    description: 'Sản phẩm hot',
                    color: '#FF5722',
                    icon: '🔥'
                },
                { 
                    label: 'Trên 10,000 lượt xem', 
                    minViews: 10000, 
                    maxViews: null, 
                    description: 'Sản phẩm cực hot',
                    color: '#E91E63',
                    icon: '💥'
                }
            ];

            // Đếm số sản phẩm trong mỗi khoảng
            for (const range of ranges) {
                const whereCondition = {
                    isActive: true
                };

                if (range.minViews !== null) {
                    whereCondition.views = { [require('sequelize').Op.gte]: range.minViews };
                }
                if (range.maxViews !== null) {
                    whereCondition.views = {
                        ...whereCondition.views,
                        [require('sequelize').Op.lte]: range.maxViews
                    };
                }

                const count = await Product.count({ where: whereCondition });
                range.productCount = count;
            }

            return {
                success: true,
                data: ranges
            };
        } catch (error) {
            console.error('Error in ProductService.getViewCountRanges:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách khoảng view count',
                error: error.message
            };
        }
    }

    /**
     * Tăng view count cho sản phẩm
     * @param {number} id - ID sản phẩm
     * @returns {Promise<Object>} - Kết quả tăng view count
     */
    async incrementProductView(id) {
        try {
            // Tìm sản phẩm trước
            const product = await Product.findOne({
                where: {
                    id,
                    isActive: true
                }
            });

            if (!product) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            // Tăng view count
            const updatedProduct = await Product.increment('views', {
                where: {
                    id,
                    isActive: true
                }
            });

            // Lấy view count mới
            const updatedProductData = await Product.findOne({
                where: { id },
                attributes: ['id', 'name', 'views']
            });

            return {
                success: true,
                message: 'Tăng view count thành công',
                data: {
                    productId: id,
                    productName: updatedProductData.name,
                    newViewCount: updatedProductData.views
                }
            };
        } catch (error) {
            console.error('Error in ProductService.incrementProductView:', error);
            return {
                success: false,
                message: 'Lỗi khi tăng view count',
                error: error.message
            };
        }
    }
}

module.exports = new ProductService();

