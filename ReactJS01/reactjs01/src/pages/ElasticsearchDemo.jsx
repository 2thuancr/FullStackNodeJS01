import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Tag, 
  Divider, 
  Alert,
  Button,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  HighlightOutlined, 
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined
} from '@ant-design/icons';
import SearchSuggestions from '../components/SearchSuggestions';
import SearchResults from '../components/SearchResults';
import ProductCard from '../components/ProductCard';
import { fuzzySearchProductsApi, getSearchSuggestionsApi } from '../util/api';

const { Title, Text, Paragraph } = Typography;

const ElasticsearchDemo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('elasticsearchDemoHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = (query) => {
    if (!query || query.trim().length === 0) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('elasticsearchDemoHistory', JSON.stringify(newHistory));
  };

  // Handle search
  const handleSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setProducts([]);
      setTotalResults(0);
      setSearchTerm('');
      return;
    }

    setLoading(true);
    setSearchTerm(query);
    saveToHistory(query);

    try {
      const response = await fuzzySearchProductsApi({ 
        q: query,
        limit: 20 
      });

      if (response.data.success) {
        const { products: searchResults, pagination } = response.data.data;
        setProducts(searchResults);
        setTotalResults(pagination.totalItems);
      } else {
        setProducts([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion select
  const handleSuggestionSelect = (value) => {
    handleSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setProducts([]);
    setTotalResults(0);
  };

  // Test API connection
  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await getSearchSuggestionsApi({ q: 'test', limit: 1 });
      if (response.data.success) {
        console.log('API connection successful');
      }
    } catch (error) {
      console.error('API connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <DatabaseOutlined style={{ color: '#52c41a' }} />
              Elasticsearch Demo
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px' }}>
              Trải nghiệm tìm kiếm thông minh với Elasticsearch - Gợi ý tự động, highlight kết quả và tìm kiếm mờ
            </Paragraph>
          </div>

          <Alert
            message="Tính năng Elasticsearch"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>Fuzzy Search:</strong> Tìm kiếm mờ, tự động sửa lỗi chính tả</li>
                <li><strong>Auto Suggestions:</strong> Gợi ý tìm kiếm thông minh từ API</li>
                <li><strong>Highlight Results:</strong> Làm nổi bật từ khóa trong kết quả</li>
                <li><strong>Search History:</strong> Lưu lịch sử tìm kiếm</li>
                <li><strong>Real-time Search:</strong> Tìm kiếm theo thời gian thực</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Button 
            type="primary" 
            icon={<ApiOutlined />}
            onClick={testApiConnection}
            loading={loading}
          >
            Test API Connection
          </Button>
        </Space>
      </Card>

      {/* Search Section */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined style={{ color: '#1890ff' }} />
              Tìm kiếm sản phẩm
            </Title>
            <Text type="secondary">
              Nhập từ khóa để tìm kiếm sản phẩm với Elasticsearch
            </Text>
          </div>

          <SearchSuggestions
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="Thử tìm kiếm: 'iphone', 'samsung', 'laptop'..."
            size="large"
            style={{ maxWidth: 600 }}
          />

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>
                Lịch sử tìm kiếm:
              </Text>
              <Space wrap>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <Tag
                    key={index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSearch(item)}
                  >
                    {item}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Space>
      </Card>

      {/* Search Results */}
      <SearchResults
        searchTerm={searchTerm}
        totalResults={totalResults}
        onClearSearch={handleClearSearch}
        searchType="fuzzy"
        highlightInfo={{ hasHighlights: true }}
      />

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tìm kiếm với Elasticsearch...</Text>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HighlightOutlined style={{ color: '#52c41a' }} />
              Kết quả tìm kiếm
            </Title>
            <Text type="secondary">
              Tìm thấy {totalResults} sản phẩm cho "{searchTerm}"
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard
                  product={product}
                  onViewDetails={(product) => {
                    console.log('View product:', product.name);
                  }}
                  onAddToCart={(product) => {
                    console.log('Add to cart:', product.name);
                  }}
                />
              </Col>
            ))}
          </Row>
        </div>
      ) : searchTerm ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              Không tìm thấy sản phẩm nào
            </Title>
            <Text type="secondary">
              Không có sản phẩm nào phù hợp với từ khóa "{searchTerm}"
            </Text>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              Bắt đầu tìm kiếm
            </Title>
            <Text type="secondary">
              Nhập từ khóa vào ô tìm kiếm để khám phá sản phẩm với Elasticsearch
            </Text>
          </div>
        </Card>
      )}

      {/* API Information */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Thông tin API Elasticsearch
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Text strong>Fuzzy Search API:</Text>
              <br />
              <Text code>GET /v1/api/products/fuzzy-search?q=iphone</Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text strong>Search Suggestions API:</Text>
              <br />
              <Text code>GET /v1/api/products/search-suggestions?q=iphone</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ElasticsearchDemo;
