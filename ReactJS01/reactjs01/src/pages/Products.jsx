import React, { useState } from 'react';
import { Card, Switch, Space, Typography, message, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ProductList from '../components/ProductList';

const { Title, Text } = Typography;

const Products = () => {
  const [useLazyLoading, setUseLazyLoading] = useState(false);

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
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
              Chuyển đổi giữa phân trang và lazy loading
            </Text>
          </div>
          
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
        </Space>
      </Card>

      {/* Product List */}
      <ProductList
        useLazyLoading={useLazyLoading}
        onViewProduct={handleViewProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Product Detail Modal */}
      <Modal
        title="Chi tiết sản phẩm"
        open={!!selectedProduct}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        {selectedProduct && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    color: '#999'
                  }}
                >
                  Không có ảnh
                </div>
              )}
            </div>
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {selectedProduct.name}
                </Title>
                <Text type="secondary">
                  {selectedProduct.category?.name}
                </Text>
              </div>
              
              <div>
                <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedProduct.price)}
                </Text>
              </div>
              
              <div>
                <Text strong>Mô tả:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{selectedProduct.description}</Text>
                </div>
              </div>
              
              <div>
                <Text strong>Tồn kho: </Text>
                <Text style={{ 
                  color: selectedProduct.stock > 10 ? 'green' : 
                         selectedProduct.stock > 0 ? 'orange' : 'red' 
                }}>
                  {selectedProduct.stock > 10 ? 'Còn hàng' : 
                   selectedProduct.stock > 0 ? `Còn ${selectedProduct.stock} sản phẩm` : 
                   'Hết hàng'}
                </Text>
              </div>
              
              <div>
                <Text strong>Ngày tạo: </Text>
                <Text>
                  {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
