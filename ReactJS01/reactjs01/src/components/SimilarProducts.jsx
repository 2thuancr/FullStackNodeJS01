import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Empty, 
  Spin, 
  message
} from 'antd';
import { 
  EyeOutlined, 
  ShoppingCartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { getSimilarProductsApi } from '../util/api';

const { Title, Text } = Typography;

const SimilarProducts = ({ 
  productId, 
  limit = 4,
  showHeader = true,
  onViewProduct = null,
  onAddToCart = null
}) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      loadSimilarProducts();
    }
  }, [productId]);

  const loadSimilarProducts = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const response = await getSimilarProductsApi(productId, { limit });
      if (response?.data?.success) {
        // Handle the correct response structure
        const data = response.data.data;
        const products = data.similarProducts || data.products || data;
        // Ensure products is always an array
        setSimilarProducts(Array.isArray(products) ? products : []);
      } else {
        setSimilarProducts([]);
      }
    } catch (error) {
      // Handle 304 Not Modified as success (cached response)
      if (error.response?.status === 304) {
        // Keep existing data, don't clear it
        return;
      }
      setSimilarProducts([]);
      // Silent error handling - don't show error message for similar products
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const renderProduct = (product) => {
    return (
      <Col xs={12} sm={8} lg={6} key={product.id}>
        <Card
          hoverable
          cover={
            product.imageUrl ? (
              <img
                alt={product.name}
                src={product.imageUrl}
                style={{ height: 150, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: 150,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999'
                }}
              >
                Không có ảnh
              </div>
            )
          }
          actions={[
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(product)}
            >
              Xem
            </Button>,
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleAddToCart(product)}
            >
              Thêm giỏ
            </Button>
          ]}
        >
          <Card.Meta
            title={
              <Text ellipsis={{ tooltip: product.name }}>
                {product.name}
              </Text>
            }
            description={
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </Text>
                </div>
                <Text type="secondary" ellipsis={{ tooltip: product.description }}>
                  {product.description}
                </Text>
                {product.category && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {product.category.name}
                    </Text>
                  </div>
                )}
              </div>
            }
          />
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải sản phẩm tương tự...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!Array.isArray(similarProducts) || similarProducts.length === 0) {
    return null; // Don't show anything if no similar products
  }

  return (
    <Card>
      {showHeader && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Sản phẩm tương tự
            </Title>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={loadSimilarProducts}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>
          <Text type="secondary">
            {Array.isArray(similarProducts) ? similarProducts.length : 0} sản phẩm tương tự được gợi ý
          </Text>
        </div>
      )}
      
      <Row gutter={[16, 16]}>
        {Array.isArray(similarProducts) && similarProducts.map(renderProduct)}
      </Row>
    </Card>
  );
};

export default SimilarProducts;

