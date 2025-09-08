import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Row, 
  Col, 
  Spin, 
  Empty, 
  Button, 
  Space, 
  Typography, 
  message,
  Pagination,
  Input,
  Select
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { getProductsApi, getCategoriesApi } from '../util/api';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import CustomPagination from './CustomPagination';
import PriceRangeFilter from './PriceRangeFilter';
import PromotionFilter from './PromotionFilter';
import ViewsFilter from './ViewsFilter';
import RatingFilter from './RatingFilter';
import StatusFilter from './StatusFilter';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductList = ({ 
  useLazyLoading = false, 
  onViewProduct, 
  onAddToCart 
}) => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pageSize, setPageSize] = useState(12);
  
  // New filter states
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [promotionFilter, setPromotionFilter] = useState('');
  const [viewsFilter, setViewsFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Refs
  const observerRef = useRef();
  const lastProductRef = useRef();

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategoriesApi();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Load products
  const loadProducts = useCallback(async (pageNum = 1, append = false) => {
    const loadingState = append ? setLoadingMore : setLoading;
    loadingState(true);
    
    try {
      // Lazy loading: use fixed page size (12), pagination: use selected page size
      const limit = useLazyLoading ? 12 : pageSize;
      
      const params = {
        page: pageNum,
        limit: limit,
        sortBy,
        sortOrder,
        ...(selectedCategoryId && { categoryId: selectedCategoryId }),
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange && priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange && priceRange[1] < 10000000 && { maxPrice: priceRange[1] }),
        ...(promotionFilter === 'any' && { minDiscount: 0.01 }),
        ...(promotionFilter === 'high' && { minDiscount: 20 }),
        ...(promotionFilter === 'medium' && { minDiscount: 10, maxDiscount: 20 }),
        ...(promotionFilter === 'low' && { maxDiscount: 10 }),
        ...(viewsFilter && { views: viewsFilter }),
        ...(ratingFilter && { minRating: ratingFilter }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await getProductsApi(params);
      
      if (response.data.success) {
        const { products: newProducts, pagination } = response.data.data;
        const newTotalPages = pagination.totalPages;
        const newTotalProducts = pagination.totalItems;
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        setTotalPages(newTotalPages);
        setTotalProducts(newTotalProducts);
        const newHasMore = pageNum < newTotalPages;
        setHasMore(newHasMore);
        console.log('Load products result:', { 
          pageNum, 
          newTotalPages, 
          newHasMore, 
          newProductsLength: newProducts.length,
          totalProducts: newTotalProducts,
          append,
          responseData: response.data.data
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Lỗi khi tải sản phẩm');
    } finally {
      loadingState(false);
    }
  }, [selectedCategoryId, searchTerm, sortBy, sortOrder, pageSize, useLazyLoading, priceRange, promotionFilter, viewsFilter, ratingFilter, statusFilter]);

  // Lazy loading observer
  const lastProductElementRef = useCallback(node => {
    console.log('Observer callback called:', { 
      node: !!node, 
      loadingMore, 
      useLazyLoading, 
      hasMore,
      productsLength: products.length 
    });
    
    if (loadingMore || !useLazyLoading) {
      console.log('Observer skipped:', { loadingMore, useLazyLoading });
      return;
    }
    
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      console.log('Intersection observer triggered:', {
        isIntersecting: entries[0].isIntersecting,
        hasMore,
        loadingMore,
        productsLength: products.length
      });
      
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        const currentPage = Math.floor(products.length / 12) + 1;
        const nextPage = currentPage + 1;
        console.log('Loading more products:', {
          currentPage,
          nextPage,
          productsLength: products.length,
          totalProducts
        });
        loadProducts(nextPage, true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    if (node) {
      console.log('Observing node:', node);
      observerRef.current.observe(node);
    }
  }, [loadingMore, hasMore, products.length, loadProducts, useLazyLoading, totalProducts]);

  // Effects
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Debug effect for lazy loading
  useEffect(() => {
    console.log('Lazy loading state changed:', {
      useLazyLoading,
      hasMore,
      loadingMore,
      productsLength: products.length,
      totalProducts,
      totalPages
    });
  }, [useLazyLoading, hasMore, loadingMore, products.length, totalProducts, totalPages]);

  useEffect(() => {
    loadProducts(1, false);
  }, [selectedCategoryId, searchTerm, sortBy, sortOrder, pageSize, priceRange, promotionFilter, viewsFilter, ratingFilter, statusFilter]);

  // Reset when switching between pagination and lazy loading
  useEffect(() => {
    if (useLazyLoading) {
      // Reset to first page when switching to lazy loading
      setPage(1);
      setProducts([]);
      setHasMore(true);
      // Load first page immediately
      loadProducts(1, false);
    }
  }, [useLazyLoading, loadProducts]);

  // Handlers
  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadProducts(newPage, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    loadProducts(1, false);
  };

  // New filter handlers
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setPage(1);
  };

  const handlePromotionFilterChange = (value) => {
    setPromotionFilter(value);
    setPage(1);
  };

  const handleViewsFilterChange = (value) => {
    setViewsFilter(value);
    setPage(1);
  };

  const handleRatingFilterChange = (value) => {
    setRatingFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleViewProduct = (product) => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      message.info(`Xem chi tiết: ${product.name}`);
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh sách sản phẩm
            {totalProducts > 0 && (
              <Text type="secondary" style={{ marginLeft: 8, fontSize: '14px' }}>
                ({totalProducts} sản phẩm)
              </Text>
            )}
          </Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Advanced Filters */}
        <Col xs={24} lg={6}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 20
          }}>
            <Title level={4} style={{ marginBottom: 20, color: '#1890ff' }}>
              BỘ LỌC TÌM KIẾM
            </Title>
            
            {/* Category Filter */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>
                Theo Danh Mục
              </Text>
              <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                loading={loading}
              />
            </div>

            {/* Price Range Filter */}
            <div style={{ marginBottom: 20 }}>
              <PriceRangeFilter
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                loading={loading}
              />
            </div>

            {/* Promotion Filter */}
            <div style={{ marginBottom: 20 }}>
              <PromotionFilter
                promotionFilter={promotionFilter}
                onPromotionFilterChange={handlePromotionFilterChange}
                loading={loading}
              />
            </div>

            {/* Views Filter */}
            <div style={{ marginBottom: 20 }}>
              <ViewsFilter
                viewsFilter={viewsFilter}
                onViewsFilterChange={handleViewsFilterChange}
                loading={loading}
              />
            </div>

            {/* Rating Filter */}
            <div style={{ marginBottom: 20 }}>
              <RatingFilter
                ratingFilter={ratingFilter}
                onRatingFilterChange={handleRatingFilterChange}
                loading={loading}
              />
            </div>

            {/* Status Filter */}
            <div style={{ marginBottom: 20 }}>
              <StatusFilter
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                loading={loading}
              />
            </div>
          </div>
        </Col>

        {/* Right Content Area */}
        <Col xs={24} lg={18}>
          {/* Search and Sort Controls */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Row gutter={[16, 16]} align="middle">
              {/* Search */}
              <Col xs={24} md={12}>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  onSearch={handleSearch}
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
                />
              </Col>
              
              {/* Sort Controls */}
              <Col xs={24} md={12}>
                <Row gutter={[8, 8]}>
                  <Col xs={8}>
                    <Select
                      placeholder="Sắp xếp theo"
                      value={sortBy}
                      onChange={handleSortChange}
                      style={{ width: '100%' }}
                      size="middle"
                    >
                      <Option value="createdAt">Ngày tạo</Option>
                      <Option value="name">Tên sản phẩm</Option>
                      <Option value="price">Giá</Option>
                      <Option value="views">Lượt xem</Option>
                      <Option value="rating">Đánh giá</Option>
                    </Select>
                  </Col>
                  
                  <Col xs={8}>
                    <Select
                      value={sortOrder}
                      onChange={handleSortOrderChange}
                      style={{ width: '100%' }}
                      size="middle"
                    >
                      <Option value="DESC">
                        <SortDescendingOutlined /> Giảm dần
                      </Option>
                      <Option value="ASC">
                        <SortAscendingOutlined /> Tăng dần
                      </Option>
                    </Select>
                  </Col>

                  {!useLazyLoading && (
                    <Col xs={8}>
                      <Select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{ width: '100%' }}
                        size="middle"
                      >
                        <Option value={6}>6 sản phẩm/trang</Option>
                        <Option value={12}>12 sản phẩm/trang</Option>
                        <Option value={24}>24 sản phẩm/trang</Option>
                        <Option value={48}>48 sản phẩm/trang</Option>
                      </Select>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Đang tải sản phẩm...</Text>
              </div>
            </div>
          ) : products.length === 0 ? (
            <Empty
              description="Không tìm thấy sản phẩm nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="product-grid">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  ref={useLazyLoading && index === products.length - 1 ? lastProductElementRef : null}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={handleViewProduct}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Lazy Loading Trigger Element */}
          {useLazyLoading && hasMore && !loadingMore && products.length > 0 && (
            <div 
              ref={lastProductElementRef}
              style={{ 
                height: '20px', 
                width: '100%',
                backgroundColor: 'rgba(255,0,0,0.1)', // Temporary red background for debugging
                marginTop: '20px',
                border: '1px dashed red' // Temporary border for debugging
              }}
            >
              {/* Lazy loading trigger - scroll to see more */}
            </div>
          )}

          {/* Manual Load More Button for Testing */}
          {useLazyLoading && hasMore && !loadingMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Button 
                type="primary" 
                onClick={() => {
                  const currentPage = Math.floor(products.length / 12) + 1;
                  const nextPage = currentPage + 1;
                  console.log('Manual load more:', { currentPage, nextPage, productsLength: products.length });
                  loadProducts(nextPage, true);
                }}
              >
                Load More (Test)
              </Button>
            </div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Đang tải thêm sản phẩm...</Text>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!useLazyLoading && totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: 32,
              padding: '20px 0'
            }}>
              <CustomPagination
                current={page}
                total={totalPages}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductList;