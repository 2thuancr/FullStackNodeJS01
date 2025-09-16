const { Client } = require('@elastic/elasticsearch');
const { Product, Category } = require('../models');

class ElasticsearchService {
    constructor() {
        this.client = new Client({
            node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
            auth: {
                username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
                password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
            },
            apiVersion: '8'
        });
        this.indexName = 'products';
    }

    /**
     * Kiểm tra kết nối Elasticsearch
     */
    async checkConnection() {
        try {
            const response = await this.client.ping();
            console.log('✅ Elasticsearch connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Elasticsearch connection failed:', error.message);
            return false;
        }
    }

    /**
     * Tạo index cho products
     */
    async createIndex() {
        try {
            const exists = await this.client.indices.exists({
                index: this.indexName
            });

            if (exists) {
                console.log(`Index ${this.indexName} already exists`);
                return true;
            }

            const response = await this.client.indices.create({
                index: this.indexName,
                mappings: {
                    properties: {
                        id: { type: 'integer' },
                        name: { 
                            type: 'text',
                            analyzer: 'standard',
                            fields: {
                                keyword: { type: 'keyword' },
                                suggest: { type: 'completion' }
                            }
                        },
                        description: { 
                            type: 'text',
                            analyzer: 'standard'
                        },
                        price: { type: 'float' },
                        originalPrice: { type: 'float' },
                        discount: { type: 'float' },
                        views: { type: 'integer' },
                        rating: { type: 'float' },
                        ratingCount: { type: 'integer' },
                        status: { type: 'keyword' },
                        stock: { type: 'integer' },
                        imageUrl: { type: 'keyword' },
                        categoryId: { type: 'integer' },
                        categoryName: { type: 'text' },
                        categoryDescription: { type: 'text' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' }
                    }
                },
                settings: {
                    analysis: {
                        analyzer: {
                            vietnamese_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding']
                            }
                        }
                    }
                }
            });

            console.log(`✅ Index ${this.indexName} created successfully`);
            return true;
        } catch (error) {
            console.error('❌ Error creating index:', error.message);
            return false;
        }
    }

    /**
     * Đồng bộ tất cả sản phẩm từ database sang Elasticsearch
     */
    async syncAllProducts() {
        try {
            console.log('🔄 Starting product sync to Elasticsearch...');
            
            const products = await Product.findAll({
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }]
            });

            const body = [];
            for (const product of products) {
                // Index document
                body.push({
                    index: {
                        _index: this.indexName,
                        _id: product.id
                    }
                });

                // Document data
                body.push({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                    originalPrice: parseFloat(product.originalPrice || 0),
                    discount: parseFloat(product.discount || 0),
                    views: product.views || 0,
                    rating: parseFloat(product.rating || 0),
                    ratingCount: product.ratingCount || 0,
                    status: product.status,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                    categoryId: product.categoryId,
                    categoryName: product.category?.name || '',
                    categoryDescription: product.category?.description || '',
                    isActive: product.isActive,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                });
            }

            if (body.length > 0) {
                const response = await this.client.bulk({ operations: body });
                console.log(`✅ Synced ${products.length} products to Elasticsearch`);
                return { success: true, count: products.length };
            }

            return { success: true, count: 0 };
        } catch (error) {
            console.error('❌ Error syncing products:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fuzzy search sản phẩm
     */
    async fuzzySearch(query, options = {}) {
        try {
            // Kiểm tra kết nối Elasticsearch trước
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                console.log('⚠️ Elasticsearch không khả dụng, sử dụng MySQL search thay thế');
                return await this.fallbackSearch(query, options);
            }
            const {
                page = 1,
                limit = 10,
                categoryId,
                minPrice,
                maxPrice,
                minRating,
                status,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const from = (page - 1) * limit;

            // Xây dựng query
            const searchQuery = {
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    // Fuzzy search trên name
                                    {
                                        fuzzy: {
                                            name: {
                                                value: query,
                                                fuzziness: 'AUTO',
                                                max_expansions: 50
                                            }
                                        }
                                    },
                                    // Match phrase trên name
                                    {
                                        match_phrase: {
                                            name: {
                                                query: query,
                                                boost: 2
                                            }
                                        }
                                    },
                                    // Match trên description
                                    {
                                        match: {
                                            description: {
                                                query: query,
                                                boost: 1.5
                                            }
                                        }
                                    },
                                    // Match trên category name
                                    {
                                        match: {
                                            categoryName: {
                                                query: query,
                                                boost: 1.2
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    filter: [
                        { term: { isActive: true } }
                    ]
                }
            };

            // Thêm filters
            if (categoryId) {
                searchQuery.bool.filter.push({ term: { categoryId: categoryId } });
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                const priceRange = {};
                if (minPrice !== undefined) priceRange.gte = minPrice;
                if (maxPrice !== undefined) priceRange.lte = maxPrice;
                searchQuery.bool.filter.push({ range: { price: priceRange } });
            }

            if (minRating !== undefined) {
                searchQuery.bool.filter.push({ range: { rating: { gte: minRating } } });
            }

            if (status) {
                searchQuery.bool.filter.push({ term: { status: status } });
            }

            // Sort
            const sort = [];
            if (sortBy === 'relevance') {
                // Sort by relevance (default)
            } else {
                sort.push({ [sortBy]: { order: sortOrder } });
            }

            const response = await this.client.search({
                index: this.indexName,
                query: searchQuery,
                sort: sort,
                from: from,
                size: limit,
                highlight: {
                    fields: {
                        name: {},
                        description: {},
                        categoryName: {}
                    }
                }
            });

            const products = response.hits.hits.map(hit => ({
                ...hit._source,
                _score: hit._score,
                _highlight: hit.highlight
            }));

            const total = response.hits.total.value;

            return {
                success: true,
                data: {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: limit,
                        hasNextPage: page < Math.ceil(total / limit),
                        hasPrevPage: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('❌ Error in fuzzy search:', error.message);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Gợi ý từ khóa tìm kiếm
     */
    async getSearchSuggestions(query, limit = 5) {
        try {
            // Kiểm tra kết nối Elasticsearch trước
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                console.log('⚠️ Elasticsearch không khả dụng, sử dụng MySQL suggestions thay thế');
                return await this.getSearchSuggestionsFallback(query, limit);
            }
            const response = await this.client.search({
                index: this.indexName,
                suggest: {
                    product_suggest: {
                        prefix: query,
                        completion: {
                            field: 'name.suggest',
                            size: limit
                        }
                    }
                }
            });

            const suggestions = response.suggest.product_suggest[0].options.map(option => ({
                text: option.text,
                score: option._score
            }));

            return {
                success: true,
                data: suggestions
            };
        } catch (error) {
            console.error('❌ Error getting suggestions:', error.message);
            return {
                success: false,
                message: 'Lỗi khi lấy gợi ý tìm kiếm',
                error: error.message
            };
        }
    }

    /**
     * Cập nhật một sản phẩm trong Elasticsearch
     */
    async updateProduct(productId, productData) {
        try {
            await this.client.index({
                index: this.indexName,
                id: productId,
                document: productData
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating product in Elasticsearch:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Xóa một sản phẩm khỏi Elasticsearch
     */
    async deleteProduct(productId) {
        try {
            await this.client.delete({
                index: this.indexName,
                id: productId
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting product from Elasticsearch:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fallback search sử dụng MySQL khi Elasticsearch không khả dụng
     */
    async fallbackSearch(query, options = {}) {
        try {
            const { Product, Category } = require('../models');
            const { Op } = require('sequelize');
            
            const {
                page = 1,
                limit = 10,
                categoryId,
                minPrice,
                maxPrice,
                minRating,
                status,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const offset = (page - 1) * limit;

            // Xây dựng điều kiện where với fuzzy search đơn giản
            const where = {
                isActive: true,
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                    { '$category.name$': { [Op.like]: `%${query}%` } }
                ]
            };

            // Thêm filters
            if (categoryId) {
                where.categoryId = categoryId;
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {};
                if (minPrice !== undefined) where.price[Op.gte] = minPrice;
                if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
            }

            if (minRating !== undefined) {
                where.rating = { [Op.gte]: minRating };
            }

            if (status) {
                where.status = status;
            }

            // Sort options
            const validSortFields = ['name', 'price', 'createdAt', 'views', 'rating', 'discount'];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const order = [[sortField, sortOrder.toUpperCase()]];

            // Tìm kiếm
            const { count, rows: products } = await Product.findAndCountAll({
                where,
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }],
                order,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                success: true,
                data: {
                    products: products.map(product => ({
                        ...product.toJSON(),
                        _score: 1.0, // Fallback score
                        _highlight: {
                            name: [product.name],
                            description: [product.description]
                        }
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(count / limit),
                        totalItems: count,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: page < Math.ceil(count / limit),
                        hasPrevPage: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('❌ Error in fallback search:', error.message);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm sản phẩm',
                error: error.message
            };
        }
    }

    /**
     * Fallback suggestions sử dụng MySQL
     */
    async getSearchSuggestionsFallback(query, limit = 5) {
        try {
            const { Product } = require('../models');
            const { Op } = require('sequelize');

            const products = await Product.findAll({
                where: {
                    isActive: true,
                    name: { [Op.like]: `%${query}%` }
                },
                attributes: ['name'],
                limit: parseInt(limit),
                order: [['views', 'DESC']]
            });

            const suggestions = products.map(product => ({
                text: product.name,
                score: 1.0
            }));

            return {
                success: true,
                data: suggestions
            };
        } catch (error) {
            console.error('❌ Error getting fallback suggestions:', error.message);
            return {
                success: false,
                message: 'Lỗi khi lấy gợi ý tìm kiếm',
                error: error.message
            };
        }
    }
}

module.exports = new ElasticsearchService();
