import React from 'react';
import { Card, Typography, Tag, Space, Button } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ProductCard = ({ product, onViewDetails, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatStock = (stock) => {
    if (stock > 10) return 'Còn hàng';
    if (stock > 0) return `Còn ${stock} sản phẩm`;
    return 'Hết hàng';
  };

  const getStockColor = (stock) => {
    if (stock > 10) return 'green';
    if (stock > 0) return 'orange';
    return 'red';
  };

  return (
    <Card
      hoverable
      cover={
        <div style={{ 
          height: 200, 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px 8px 0 0'
        }}>
          {product.imageUrl ? (
            <img
              alt={product.name}
              src={product.imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            style={{ 
              display: product.imageUrl ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: '14px',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '24px', opacity: 0.5 }}>📷</div>
            <div>Không có ảnh</div>
          </div>
        </div>
      }
      actions={[
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '0 16px 16px 16px',
          width: '100%'
        }}>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetails(product)}
            style={{ 
              flex: 1,
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '6px',
              border: '1px solid #d9d9d9'
            }}
          >
            Xem chi tiết
          </Button>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />} 
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            style={{ 
              flex: 1,
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '6px',
              background: product.stock === 0 ? '#f5f5f5' : '#1890ff',
              borderColor: product.stock === 0 ? '#d9d9d9' : '#1890ff'
            }}
          >
            Thêm vào giỏ
          </Button>
        </div>
      ]}
      style={{ 
        height: '100%',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #f0f0f0',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Product Name */}
        <Title 
          level={5} 
          style={{ 
            margin: '0 0 8px 0', 
            fontSize: '16px',
            fontWeight: '600',
            lineHeight: '1.4',
            color: '#262626'
          }}
          ellipsis={{ rows: 2 }}
        >
          {product.name}
        </Title>
        
        {/* Description */}
        <Paragraph 
          ellipsis={{ rows: 2 }} 
          style={{ 
            margin: '0 0 12px 0', 
            fontSize: '13px', 
            color: '#8c8c8c',
            lineHeight: '1.4'
          }}
        >
          {product.description}
        </Paragraph>
        
        {/* Price and Stock */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <Text strong style={{ 
            fontSize: '18px', 
            color: '#ff4d4f',
            fontWeight: '700'
          }}>
            {formatPrice(product.price)}
          </Text>
          <Tag 
            color={getStockColor(product.stock)}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '500'
            }}
          >
            {formatStock(product.stock)}
          </Tag>
        </div>
        
        {/* Category */}
        {product.category && (
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '11px',
              color: '#bfbfbf',
              marginTop: 'auto'
            }}
          >
            Danh mục: {product.category.name}
          </Text>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
