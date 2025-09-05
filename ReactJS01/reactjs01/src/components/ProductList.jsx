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
      message.error('Không thể tải danh mục sản phẩm');
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
        ...(searchTerm && { search: searchTerm })
      };

      console.log('Loading products with params:', params, 'useLazyLoading:', useLazyLoading); // Debug log

      const response = await getProductsApi(params);
      console.log('API response:', response.data); // Debug log
      
      if (response.data.success) {
        const { products: newProducts, totalPages: newTotalPages, totalProducts: newTotalProducts } = response.data.data;
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        setTotalPages(newTotalPages);
        setTotalProducts(newTotalProducts);
        
        // Lazy loading: hasMore = còn sản phẩm chưa load
        // Pagination: hasMore = còn trang chưa xem
        if (useLazyLoading) {
          // Đơn giản: nếu load được ít hơn limit thì hết sản phẩm
          setHasMore(newProducts.length === 12);
        } else {
          setHasMore(pageNum < newTotalPages);
        }
        
        setPage(pageNum);
        
        console.log('Products loaded:', newProducts.length, 'Total pages:', newTotalPages, 'Total products:', newTotalProducts, 'Append:', append, 'HasMore:', useLazyLoading ? (append ? products.length + newProducts.length : newProducts.length) < newTotalProducts : pageNum < newTotalPages); // Debug log
      } else {
        message.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Lỗi khi tải sản phẩm');
    } finally {
      loadingState(false);
    }
  }, [selectedCategoryId, searchTerm, sortBy, sortOrder, pageSize, useLazyLoading]);

  // Lazy loading observer
  const lastProductElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      console.log('IntersectionObserver triggered:', entries[0].isIntersecting, 'hasMore:', hasMore, 'page:', page); // Debug log
      if (entries[0].isIntersecting && hasMore) {
        console.log('Loading more products, page:', page + 1); // Debug log
        loadProducts(page + 1, true);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, page, loadProducts]);

  // Effects
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(1, false);
  }, [selectedCategoryId, searchTerm, sortBy, sortOrder, pageSize]);

  // Reset when switching between pagination and lazy loading
  useEffect(() => {
    console.log('useLazyLoading changed to:', useLazyLoading); // Debug log
    if (useLazyLoading) {
      // Reset to first page when switching to lazy loading
      console.log('Switching to lazy loading mode'); // Debug log
      setPage(1);
      setProducts([]);
      // Lazy loading: load with fixed page size (12), append mode
      loadProducts(1, false);
    } else {
      // Reset to first page when switching to pagination
      console.log('Switching to pagination mode'); // Debug log
      setPage(1);
      setProducts([]);
      // Pagination: load with selected page size
      loadProducts(1, false);
    }
  }, [useLazyLoading]);

  // Handlers
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
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
    console.log('Page size changed to:', value); // Debug log
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

  const handleViewProduct = (product) => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      message.info(`Xem chi tiết sản phẩm: ${product.name}`);
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

        {/* Filters */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              loading={loading}
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Sắp xếp theo"
              value={sortBy}
              onChange={handleSortChange}
              style={{ width: '100%' }}
            >
              <Option value="createdAt">Ngày tạo</Option>
              <Option value="name">Tên sản phẩm</Option>
              <Option value="price">Giá</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Select
              value={sortOrder}
              onChange={handleSortOrderChange}
              style={{ width: '100%' }}
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
            <Col xs={24} sm={12} md={4}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                style={{ width: '100%' }}
              >
                <Option value={6}>6 sản phẩm/trang</Option>
                <Option value={12}>12 sản phẩm/trang</Option>
                <Option value={24}>24 sản phẩm/trang</Option>
                <Option value={48}>48 sản phẩm/trang</Option>
              </Select>
            </Col>
          )}
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
        <>
          <div className="product-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                ref={useLazyLoading && index === products.length - 1 ? lastProductElementRef : null}
                style={{ 
                  width: '100%',
                  minHeight: '400px'
                }}
              >
                <ProductCard
                  product={product}
                  onViewDetails={handleViewProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>

          {/* Lazy Loading Trigger Element */}
          {useLazyLoading && hasMore && !loadingMore && (
            <div 
              ref={lastProductElementRef}
              style={{ 
                height: '20px', 
                width: '100%',
                backgroundColor: 'transparent'
              }}
            >
              {/* Invisible trigger element */}
            </div>
          )}

          {/* Lazy Loading Indicator */}
          {useLazyLoading && loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin />
              <div style={{ marginTop: 8 }}>
                <Text>Đang tải thêm sản phẩm...</Text>
              </div>
            </div>
          )}

          {/* End of Products Message */}
          {useLazyLoading && !hasMore && products.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">Đã hiển thị tất cả sản phẩm</Text>
            </div>
          )}

          {/* Pagination */}
          {!useLazyLoading && totalProducts > 0 && (
            <CustomPagination
              current={page}
              total={totalProducts}
              pageSize={pageSize}
              onChange={handlePageChange}
              showTotal={true}
            />
          )}
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Debug: useLazyLoading={useLazyLoading.toString()}, totalPages={totalPages}, totalProducts={totalProducts}, hasMore={hasMore.toString()}, products.length={products.length}
              </Text>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
