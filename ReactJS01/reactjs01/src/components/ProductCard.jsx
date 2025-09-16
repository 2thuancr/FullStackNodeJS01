import React, { memo } from 'react';
import { Card, Button, Space, Typography, Tag, Image, Tooltip, Rate } from 'antd';
import { 
  EyeOutlined, 
  ShoppingCartOutlined, 
  StarOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';
import HighlightedText from './HighlightedText';
import FavoriteButton from './FavoriteButton';

const { Title, Text, Paragraph } = Typography;

const ProductCard = memo(({ 
  product, 
  onViewDetails, 
  onAddToCart 
}) => {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    discount,
    imageUrl,
    image,
    image_url,
    stock,
    category,
    createdAt,
    rating = 0,
    ratingCount = 0,
    viewCount = 0,
    purchaseCount = 0,
    commentCount = 0
  } = product;

  // Convert string values to numbers if needed
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericOriginalPrice = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const numericDiscount = typeof discount === 'string' ? parseFloat(discount) : discount;
  const numericStock = typeof stock === 'string' ? parseInt(stock) : stock;
  const numericRatingCount = typeof ratingCount === 'string' ? parseInt(ratingCount) : ratingCount;
  const numericPurchaseCount = typeof purchaseCount === 'string' ? parseInt(purchaseCount) : purchaseCount;
  const numericCommentCount = typeof commentCount === 'string' ? parseInt(commentCount) : commentCount;


  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { text: 'Còn hàng', color: 'green' };
    if (stock > 0) return { text: `Còn ${stock} sản phẩm`, color: 'orange' };
    return { text: 'Hết hàng', color: 'red' };
  };

  const stockStatus = getStockStatus(numericStock);

  // Xác định URL hình ảnh từ các trường có thể có
  const getImageUrl = () => {
    const url = imageUrl || image || image_url || null;
    
    // Kiểm tra nếu URL là example.com hoặc không hợp lệ
    if (url && (url.includes('example.com') || url.includes('placeholder'))) {
      return null;
    }
    
    return url;
  };

  const productImageUrl = getImageUrl();

  // Tạo placeholder image dựa trên tên sản phẩm
  const generatePlaceholderImage = (productName) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const color = colors[productName.length % colors.length];
    const firstLetter = productName.charAt(0).toUpperCase();
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              text-anchor="middle" dominant-baseline="middle" fill="white">
          ${firstLetter}
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.8)">
          ${productName}
        </text>
      </svg>
    `)}`;
  };

  return (
    <Card
      hoverable
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      cover={
        <div style={{ height: 160, overflow: 'hidden' }}>
          {productImageUrl ? (
            <Image
              alt={name}
              src={productImageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              fallback={
                <img
                  src={generatePlaceholderImage(name)}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              }
              onError={(e) => {
                // Thay thế bằng placeholder khi lỗi
                e.target.src = generatePlaceholderImage(name);
              }}
            />
          ) : (
            <img
              src={generatePlaceholderImage(name)}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
        </div>
      }
      bodyStyle={{ 
        padding: 12,
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      actions={[
        <Tooltip title="Xem chi tiết">
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails && onViewDetails(product)}
          >
            Chi tiết
          </Button>
        </Tooltip>,
        <Tooltip title="Thêm vào giỏ hàng">
          <Button 
            type="default" 
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={stock === 0}
          >
            Mua ngay
          </Button>
        </Tooltip>,
        <FavoriteButton 
          productId={id} 
          size="small" 
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ]}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category Tag */}
        {category && (
          <div style={{ marginBottom: 8 }}>
            <Tag 
              icon={<TagOutlined />} 
              color="blue"
              style={{ fontSize: '11px' }}
            >
              {category.name}
            </Tag>
          </div>
        )}

        {/* Product Name */}
        <Title 
          level={5} 
          style={{ 
            margin: '0 0 6px 0',
            minHeight: '32px',
            fontSize: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={name}
        >
          <HighlightedText 
            text={name} 
            highlights={product._highlight?.name} 
          />
        </Title>

        {/* Description */}
        <Paragraph
          style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            color: '#666',
            minHeight: '28px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          <HighlightedText 
            text={description} 
            highlights={product._highlight?.description} 
          />
        </Paragraph>

        {/* Price */}
        <div style={{ marginBottom: 8 }}>
          {numericOriginalPrice && numericOriginalPrice > numericPrice ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '16px', 
                    color: '#ff4d4f' 
                  }}
                >
                  {formatPrice(numericPrice)}
                </Text>
                {numericDiscount && numericDiscount > 0 && (
                  <Tag color="red" size="small">
                    -{numericDiscount.toFixed(0)}%
                  </Tag>
                )}
              </div>
              <Text 
                style={{ 
                  fontSize: '12px', 
                  color: '#999',
                  textDecoration: 'line-through'
                }}
              >
                {formatPrice(numericOriginalPrice)}
              </Text>
            </div>
          ) : (
            <Text 
              strong 
              style={{ 
                fontSize: '16px', 
                color: '#ff4d4f' 
              }}
            >
              {formatPrice(numericPrice)}
            </Text>
          )}
        </div>

        {/* Stock Status */}
        <div style={{ marginBottom: 6 }}>
          <Tag color={stockStatus.color} size="small">
            {stockStatus.text}
          </Tag>
        </div>

        {/* Rating and Date */}
        <div style={{ 
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          fontSize: '10px',
          color: '#999'
        }}>
          <div style={{ flex: 1 }}>
            <Rate 
              disabled 
              value={numericRating} 
              style={{ fontSize: '10px' }}
              allowHalf
            />
            <div style={{ fontSize: '9px', color: '#999', marginTop: 2 }}>
              {numericRating.toFixed(1)} ({numericRatingCount} đánh giá)
            </div>
            <div style={{ fontSize: '9px', color: '#1890ff', marginTop: 2 }}>
              👁️ {viewCount} lượt xem
            </div>
            <div style={{ fontSize: '9px', color: '#52c41a', marginTop: 2 }}>
              <UserOutlined /> {numericPurchaseCount} khách mua
            </div>
            <div style={{ fontSize: '9px', color: '#722ed1', marginTop: 2 }}>
              <MessageOutlined /> {numericCommentCount} bình luận
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Space size="small">
              <CalendarOutlined style={{ fontSize: '10px' }} />
              <Text type="secondary" style={{ fontSize: '10px' }}>
                {new Date(createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default ProductCard;
