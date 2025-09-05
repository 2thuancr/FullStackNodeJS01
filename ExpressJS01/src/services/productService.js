const { Product, Category } = require('../models');

class ProductService {
    /**
     * Lấy danh sách sản phẩm với phân trang
     * @param {Object} options - Tùy chọn lọc và phân trang
     * @param {number} options.page - Trang hiện tại (mặc định: 1)
     * @param {number} options.limit - Số sản phẩm mỗi trang (mặc định: 10)
     * @param {number} options.categoryId - ID danh mục (tùy chọn)
     * @param {string} options.search - Tìm kiếm theo tên sản phẩm (tùy chọn)
     * @param {string} options.sortBy - Sắp xếp theo (name, price, createdAt) (mặc định: createdAt)
     * @param {string} options.sortOrder - Thứ tự sắp xếp (ASC, DESC) (mặc định: DESC)
     * @returns {Promise<Object>} - Kết quả phân trang
     */
    async getProducts(options = {}) {
        const {
            page = 1,
            limit = 10,
            categoryId,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
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

        // Xây dựng điều kiện sắp xếp
        const order = [[sortBy, sortOrder.toUpperCase()]];

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
}

module.exports = new ProductService();
