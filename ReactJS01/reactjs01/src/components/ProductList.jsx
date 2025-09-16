import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Select,
  AutoComplete
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { getProductsApi, getCategoriesApi, fuzzySearchProductsApi, getSearchSuggestionsApi } from '../util/api';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import CustomPagination from './CustomPagination';
import PriceRangeFilter from './PriceRangeFilter';
import PromotionFilter from './PromotionFilter';
import ViewsFilter from './ViewsFilter';
import RatingFilter from './RatingFilter';
import StatusFilter from './StatusFilter';
import SearchResults from './SearchResults';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductList = ({ 
  useLazyLoading = false, 
  onViewProduct, 
  onAddToCart,
  productViewCounts = {}
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
  const [searchInput, setSearchInput] = useState(''); // For real-time input
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pageSize, setPageSize] = useState(12);
  
  // New filter states
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [promotionFilter, setPromotionFilter] = useState('');
  const [viewsFilter, setViewsFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs
  const observerRef = useRef();
  const lastProductRef = useRef();
  const searchTimeoutRef = useRef();

  // Debounce function
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Generate search suggestions from API
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [suggestionsCache, setSuggestionsCache] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Fetch suggestions from API with caching
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setApiSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    
    // Check cache first
    if (suggestionsCache[query]) {
      setApiSuggestions(suggestionsCache[query]);
      setLoadingSuggestions(false);
      return;
    }
    
    setLoadingSuggestions(true);
    try {
      const response = await getSearchSuggestionsApi({ q: query, limit: 8 });
      if (response.data.success) {
        const suggestions = response.data.data.map(item => ({
          value: item.text,
          label: item.text,
          type: 'api'
        }));
        setApiSuggestions(suggestions);
        // Cache the results
        setSuggestionsCache(prev => ({
          ...prev,
          [query]: suggestions
        }));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setApiSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced suggestion fetch
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 200), // Giảm từ 300ms xuống 200ms
    []
  );

  // Update suggestions when search input changes
  useEffect(() => {
    debouncedFetchSuggestions(searchInput);
  }, [searchInput]);

  // Auto-load products when search input changes (with debounce)
  useEffect(() => {
    if (searchInput && searchInput.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        setSearchTerm(searchInput);
        setPage(1);
      }, 300); // Giảm từ 500ms xuống 300ms
      
      return () => clearTimeout(timeoutId);
    } else if (searchInput === '') {
      // Clear search immediately when input is empty
      setSearchTerm('');
      setPage(1);
    }
  }, [searchInput]);

  // Generate search suggestions (combine API and local)
  const generateSearchSuggestions = useMemo(() => {
    if (!searchInput || searchInput.length < 2) return [];
    
    const suggestions = [...apiSuggestions];
    
    // Add local suggestions if API suggestions are not enough
    if (suggestions.length < 5) {
      const input = searchInput.toLowerCase();
      
      // Add product names
      products.forEach(product => {
        if (product.name.toLowerCase().includes(input) && 
            !suggestions.some(s => s.value === product.name)) {
          suggestions.push({
            value: product.name,
            label: product.name,
            type: 'product'
          });
        }
      });
      
      // Add category names
      categories.forEach(category => {
        if (category.name.toLowerCase().includes(input) && 
            !suggestions.some(s => s.value === category.name)) {
          suggestions.push({
            value: category.name,
            label: category.name,
            type: 'category'
          });
        }
      });
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [searchInput, apiSuggestions, products, categories]);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await getCategoriesApi();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load products - Remove useCallback to prevent dependency issues
  const loadProducts = async (pageNum = 1, append = false) => {
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
        ...(searchTerm && { q: searchTerm }), // Changed from 'search' to 'q' for fuzzy search
        ...(priceRange && priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange && priceRange[1] > 0 && priceRange[1] < 10000000 && { maxPrice: priceRange[1] }),
        ...(promotionFilter === 'any' && { minDiscount: 0.01 }),
        ...(promotionFilter === 'high' && { minDiscount: 20 }),
        ...(promotionFilter === 'medium' && { minDiscount: 10, maxDiscount: 20 }),
        ...(promotionFilter === 'low' && { maxDiscount: 10 }),
        ...(viewsFilter && { views: viewsFilter }),
        ...(ratingFilter && { minRating: ratingFilter }),
        ...(statusFilter && { status: statusFilter })
      };

      // Use fuzzy search if searchTerm exists, otherwise use regular search
      const useFuzzySearch = searchTerm && searchTerm.trim().length > 0;
      
      // Debug log để kiểm tra parameters
      console.log('Price Range State:', priceRange);
      console.log('API Parameters:', params);
      console.log('Using fuzzy search:', useFuzzySearch);
      
      const response = useFuzzySearch 
        ? await fuzzySearchProductsApi(params)
        : await getProductsApi(params);
      
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
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response?.status === 500) {
        message.error('Lỗi server: Backend đang gặp sự cố. Vui lòng kiểm tra lại sau.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình backend.');
      } else if (error.code === 'ERR_NETWORK') {
        message.error('Không thể kết nối đến backend. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      } else {
        message.error(`Lỗi khi tải sản phẩm: ${error.message || 'Lỗi không xác định'}`);
      }
    } finally {
      loadingState(false);
    }
  };

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
  }, [loadingMore, hasMore, products.length, useLazyLoading, totalProducts]);

  // Effects
  useEffect(() => {
    loadCategories();
  }, []);

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
  }, [useLazyLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Handle real-time search input
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    setShowSuggestions(value.length >= 2);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (value) => {
    setSearchInput(value);
    setSearchTerm(value);
    setShowSuggestions(false);
    setPage(1);
  };

  // Create active filters object for SearchResults
  const activeFilters = useMemo(() => {
    const filters = {};
    
    if (selectedCategoryId) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      if (category) {
        filters.category = category.name;
      }
    }
    
    if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000000)) {
      filters.priceRange = priceRange;
    }
    
    if (promotionFilter) {
      const promotionLabels = {
        'any': 'Có khuyến mãi',
        'high': 'Giảm > 20%',
        'medium': 'Giảm 10-20%',
        'low': 'Giảm < 10%'
      };
      filters.promotion = promotionLabels[promotionFilter] || promotionFilter;
    }
    
    if (viewsFilter) {
      const viewsLabels = {
        'high': 'Lượt xem cao (>1000)',
        'medium': 'Lượt xem trung bình (500-1000)',
        'low': 'Lượt xem thấp (<500)'
      };
      filters.views = viewsLabels[viewsFilter] || viewsFilter;
    }
    
    if (ratingFilter) {
      filters.rating = ratingFilter;
    }
    
    if (statusFilter) {
      const statusLabels = {
        'in_stock': 'Còn hàng',
        'out_of_stock': 'Hết hàng',
        'discontinued': 'Ngừng kinh doanh'
      };
      filters.status = statusLabels[statusFilter] || statusFilter;
    }
    
    return filters;
  }, [selectedCategoryId, categories, priceRange, promotionFilter, viewsFilter, ratingFilter, statusFilter]);

  // Clear search function
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  // Clear cache and reload
  const handleClearCache = () => {
    setSuggestionsCache({});
    setApiSuggestions([]);
    setPage(1);
    loadProducts(1, false);
  };

  // Clear filters function
  const handleClearFilters = (filterType) => {
    if (filterType === 'all') {
      setSelectedCategoryId('');
      setPriceRange([0, 10000000]);
      setPromotionFilter('');
      setViewsFilter('');
      setRatingFilter('');
      setStatusFilter('');
    } else {
      switch (filterType) {
        case 'category':
          setSelectedCategoryId('');
          break;
        case 'priceRange':
          setPriceRange([0, 10000000]);
          break;
        case 'promotion':
          setPromotionFilter('');
          break;
        case 'views':
          setViewsFilter('');
          break;
        case 'rating':
          setRatingFilter('');
          break;
        case 'status':
          setStatusFilter('');
          break;
        default:
          break;
      }
    }
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
          {/* Search Results Summary */}
          <SearchResults
            searchTerm={searchTerm}
            totalResults={totalProducts}
            activeFilters={activeFilters}
            onClearSearch={handleClearSearch}
            onClearFilters={handleClearFilters}
          />

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
                <AutoComplete
                  value={searchInput}
                  options={generateSearchSuggestions}
                  onSearch={handleSearchInputChange}
                  onSelect={handleSuggestionSelect}
                  placeholder="Tìm kiếm sản phẩm..."
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
                  dropdownStyle={{
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                  filterOption={(inputValue, option) =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  }
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onFocus={() => {
                    if (searchInput.length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  notFoundContent={
                    loadingSuggestions ? (
                      <div style={{ textAlign: 'center', padding: '10px' }}>
                        <Spin size="small" /> Đang tải gợi ý...
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                        Không tìm thấy gợi ý
                      </div>
                    )
                  }
                >
                  <Input.Search
                    onSearch={handleSearch}
                    enterButton
                    size="large"
                    style={{ width: '100%' }}
                  />
                </AutoComplete>
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
                    product={{
                      ...product,
                      viewCount: productViewCounts[product.id] || product.viewCount || 0
                    }}
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