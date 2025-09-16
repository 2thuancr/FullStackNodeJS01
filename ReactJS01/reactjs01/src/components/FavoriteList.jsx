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
  Modal, 
  message,
  Pagination,
  Select,
  Input
} from 'antd';
import { 
  HeartFilled, 
  DeleteOutlined, 
  ShoppingCartOutlined,
  EyeOutlined,
  ClearOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useFavorite } from './context/FavoriteContext';
import ProductCard from './ProductCard';
import LoadingState from './LoadingState';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const FavoriteList = ({ 
  showHeader = true, 
  showPagination = true, 
  pageSize = 12,
  onViewProduct = null,
  onAddToCart = null
}) => {
  const { 
    favorites, 
    favoritesCount, 
    loading, 
    loadFavorites, 
    clearAllFavorites,
    removeFromFavorites 
  } = useFavorite();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load favorites only once when component mounts
  useEffect(() => {
    // Only load if we haven't loaded before and not currently loading
    if (!hasLoadedOnce && !loading) {
      setHasLoadedOnce(true);
      loadFavorites({
        page: currentPage,
        limit: pageSize,
        sortBy,
        search: searchTerm
      });
    }
  }, [hasLoadedOnce, loading]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Only call API if we have data and user is changing page
    if (favorites.length > 0) {
      loadFavorites({
        page,
        limit: pageSize,
        sortBy,
        search: searchTerm
      });
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    // Only call API if we have data and user is changing sort
    if (favorites.length > 0) {
      loadFavorites({
        page: 1,
        limit: pageSize,
        sortBy: value,
        search: searchTerm
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Always call API for search as it's a new query
    loadFavorites({
      page: 1,
      limit: pageSize,
      sortBy,
      search: value
    });
  };

  const handleRemoveFromFavorites = async (productId) => {
    const success = await removeFromFavorites(productId);
    // No need to reload favorites as it's handled in the context
  };

  const handleClearAll = async () => {
    const success = await clearAllFavorites();
    if (success) {
      setShowClearModal(false);
      setCurrentPage(1);
      // No need to reload favorites as it's handled in the context
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

  const renderProduct = (favorite) => {
    const product = favorite.product || favorite;
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
        <Card
          hoverable
          cover={
            product.imageUrl ? (
              <img
                alt={product.name}
                src={product.imageUrl}
                style={{ height: 200, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: 200,
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
            </Button>,
            <Button
              type="text"
              danger
              icon={<HeartFilled />}
              onClick={() => handleRemoveFromFavorites(product.id)}
            >
              Bỏ yêu thích
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
                  <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </Text>
                </div>
                <Text type="secondary" ellipsis={{ tooltip: product.description }}>
                  {product.description}
                </Text>
              </div>
            }
          />
        </Card>
      </Col>
    );
  };

  if (loading && favorites.length === 0) {
    return <LoadingState message="Đang tải danh sách yêu thích..." />;
  }

  return (
    <div>
      {showHeader && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Sản phẩm yêu thích
              </Title>
              <Text type="secondary">
                {favorites.length} sản phẩm trong danh sách yêu thích
              </Text>
            </div>
            
            <Space wrap>
              <Search
                placeholder="Tìm kiếm sản phẩm yêu thích"
                onSearch={handleSearch}
                style={{ width: 250 }}
                allowClear
              />
              
              <Select
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: 150 }}
              >
                <Option value="createdAt">Mới nhất</Option>
                <Option value="oldest">Cũ nhất</Option>
                <Option value="name">Tên A-Z</Option>
                <Option value="price_asc">Giá thấp-cao</Option>
                <Option value="price_desc">Giá cao-thấp</Option>
              </Select>
              
              {favoritesCount > 0 && (
                <Button
                  danger
                  icon={<ClearOutlined />}
                  onClick={() => setShowClearModal(true)}
                >
                  Xóa tất cả
                </Button>
              )}
            </Space>
          </div>
        </Card>
      )}

      {favorites.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Chưa có sản phẩm yêu thích nào</Text>
                <br />
                <Text type="secondary">Hãy thêm sản phẩm vào danh sách yêu thích của bạn</Text>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {favorites.map(renderProduct)}
          </Row>
          
          {showPagination && favorites.length > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={favorites.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
                }
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Xác nhận xóa"
        open={showClearModal}
        onOk={handleClearAll}
        onCancel={() => setShowClearModal(false)}
        okText="Xóa tất cả"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?</p>
        <p style={{ color: '#ff4d4f' }}>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default FavoriteList;
