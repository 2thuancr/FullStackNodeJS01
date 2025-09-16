import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Switch, Space, Typography, message, Tabs } from 'antd';
import { InfoCircleOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import ProductList from '../components/ProductList';
import FavoriteList from '../components/FavoriteList';
import ViewedProducts from '../components/ViewedProducts';
import SimilarProducts from '../components/SimilarProducts';
import { incrementProductViewApi, addToViewedProductsApi } from '../util/api';
import { useViewedProducts } from '../components/context/ViewedProductsContext';

const { Title, Text } = Typography;

const Products = () => {
  const navigate = useNavigate();
  const [useLazyLoading, setUseLazyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const { addToViewedProducts } = useViewedProducts();

  const handleLazyLoadingChange = (checked) => {
    console.log('Lazy loading switch changed to:', checked); // Debug log
    setUseLazyLoading(checked);
    
    // Show notification
    if (checked) {
      message.info('Đã chuyển sang chế độ Lazy Loading - Hiển thị tất cả sản phẩm, cuộn xuống để tải thêm');
    } else {
      message.info('Đã chuyển sang chế độ Phân trang - Chia thành các trang, có thể chọn số sản phẩm/trang');
    }
  };
  const [productViewCounts, setProductViewCounts] = useState({});

  const handleViewProduct = async (product) => {
    try {
      // Gọi API để tăng view count
      const response = await incrementProductViewApi(product.id);
      console.log('View count incremented for product:', product.name);
      
      // Cập nhật view count trong state nếu API trả về view count mới
      if (response?.data?.data?.viewCount !== undefined) {
        setProductViewCounts(prev => ({
          ...prev,
          [product.id]: response.data.data.viewCount
        }));
      }

      // Thêm vào danh sách sản phẩm đã xem
      await addToViewedProducts(product.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Không hiển thị lỗi cho user vì đây là tính năng phụ
    }
    
    // Điều hướng đến trang chi tiết sản phẩm
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (product) => {
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Reset loading flags when switching tabs
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Force re-render of components when switching tabs
    console.log('Switching to tab:', key);
  };


  const tabItems = [
    {
      key: 'products',
      label: 'Tất cả sản phẩm',
      icon: <InfoCircleOutlined />
    },
    {
      key: 'favorites',
      label: 'Sản phẩm yêu thích',
      icon: <HeartOutlined />
    },
    {
      key: 'viewed',
      label: 'Sản phẩm đã xem',
      icon: <EyeOutlined />
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return (
          <FavoriteList
            key="favorites" // Add key to force re-render when switching tabs
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
          />
        );
      case 'viewed':
        return (
          <ViewedProducts
            key="viewed" // Add key to force re-render when switching tabs
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
          />
        );
      case 'products':
        return (
          <ProductList
            key="products" // Add key to force re-render when switching tabs
            useLazyLoading={useLazyLoading}
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
            productViewCounts={productViewCounts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>

      {/* Header Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Space align="center" justify="space-between" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý sản phẩm
            </Title>
            <Text type="secondary">
              {activeTab === 'products' 
                ? 'Chuyển đổi giữa phân trang và lazy loading'
                : activeTab === 'favorites'
                ? 'Danh sách sản phẩm yêu thích của bạn'
                : 'Lịch sử sản phẩm đã xem'
              }
            </Text>
          </div>
          
          {activeTab === 'products' && (
            <Space>
              <Text style={{ color: !useLazyLoading ? '#1890ff' : '#999' }}>Phân trang</Text>
              <Switch
                checked={useLazyLoading}
                onChange={handleLazyLoadingChange}
                checkedChildren="Lazy"
                unCheckedChildren="Page"
              />
              <Text style={{ color: useLazyLoading ? '#1890ff' : '#999' }}>Lazy Loading</Text>
            </Space>
          )}
        </Space>
      </Card>

      {/* Tabs */}
      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Tab Content */}
      {renderTabContent()}

    </div>
  );
};

export default Products;
