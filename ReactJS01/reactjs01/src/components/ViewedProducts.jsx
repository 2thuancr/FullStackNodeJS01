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
  Input,
  Statistic,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  ShoppingCartOutlined,
  ClearOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useViewedProducts } from './context/ViewedProductsContext';
import { useAuth } from './context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ViewedProducts = ({ 
  showHeader = true, 
  showPagination = true, 
  pageSize = 12,
  showStatistics = true,
  onViewProduct = null,
  onAddToCart = null
}) => {
  const { 
    viewedProducts, 
    mostViewedProducts,
    statistics,
    loading, 
    loadViewedProducts, 
    clearViewedHistory 
  } = useViewedProducts();

  
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('viewedAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // recent, most-viewed
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load viewed products only once when component mounts
  useEffect(() => {
    // Only load if we haven't loaded before and not currently loading
    if (!hasLoadedOnce && !loading) {
      setHasLoadedOnce(true);
      loadViewedProducts({
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder: 'DESC',
        days: 30,
        search: searchTerm
      });
    }
  }, [hasLoadedOnce, loading]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Only call API if we have data and user is changing page
    if (viewedProducts.length > 0) {
      loadViewedProducts({
        page,
        limit: pageSize,
        sortBy,
        sortOrder: 'DESC',
        days: 30,
        search: searchTerm
      });
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    // Only call API if we have data and user is changing sort
    if (viewedProducts.length > 0) {
      loadViewedProducts({
        page: 1,
        limit: pageSize,
        sortBy: value,
        sortOrder: 'DESC',
        days: 30,
        search: searchTerm
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Always call API for search as it's a new query
    loadViewedProducts({
      page: 1,
      limit: pageSize,
      sortBy,
      sortOrder: 'DESC',
      days: 30,
      search: value
    });
  };

  const handleClearHistory = async () => {
    const success = await clearViewedHistory();
    if (success) {
      setShowClearModal(false);
      setCurrentPage(1);
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

  const renderProduct = (item, isMostViewed = false) => {
    const product = item.product || item;
    const viewedAt = item.viewedAt || item.createdAt;
    
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
              Xem lại
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text ellipsis={{ tooltip: product.name }} style={{ flex: 1 }}>
                  {product.name}
                </Text>
                {isMostViewed && (
                  <FireOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                )}
              </div>
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
                {!isMostViewed && viewedAt && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <ClockCircleOutlined /> {new Date(viewedAt).toLocaleString('vi-VN')}
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

  const renderStatistics = () => {
    if (!statistics || !user) return null;

    return (
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Thống kê xem sản phẩm</Title>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Tổng lượt xem"
              value={statistics.totalViews || 0}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Sản phẩm đã xem"
              value={statistics.uniqueProducts || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Tuần này"
              value={statistics.thisWeek || 0}
              suffix="lượt xem"
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Tháng này"
              value={statistics.thisMonth || 0}
              suffix="lượt xem"
            />
          </Col>
        </Row>
      </Card>
    );
  };

  if (loading && viewedProducts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Sản phẩm đã xem
              </Title>
              <Text type="secondary">
                {viewedProducts.length} sản phẩm trong lịch sử xem
              </Text>
            </div>
            
            <Space wrap>
              <Search
                placeholder="Tìm kiếm sản phẩm đã xem"
                onSearch={handleSearch}
                style={{ width: 250 }}
                allowClear
              />
              
              <Select
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: 150 }}
              >
                <Option value="viewedAt">Mới nhất</Option>
                <Option value="viewedAt">Cũ nhất</Option>
                <Option value="name">Tên A-Z</Option>
                <Option value="price">Giá thấp-cao</Option>
                <Option value="price">Giá cao-thấp</Option>
              </Select>
              
              {user && viewedProducts.length > 0 && (
                <Button
                  danger
                  icon={<ClearOutlined />}
                  onClick={() => setShowClearModal(true)}
                >
                  Xóa lịch sử
                </Button>
              )}
            </Space>
          </div>
        </Card>
      )}

      {showStatistics && renderStatistics()}

      {/* Tab Navigation */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type={activeTab === 'recent' ? 'primary' : 'default'}
            onClick={() => setActiveTab('recent')}
          >
            Sản phẩm đã xem gần đây
          </Button>
          <Button
            type={activeTab === 'most-viewed' ? 'primary' : 'default'}
            onClick={() => setActiveTab('most-viewed')}
            icon={<FireOutlined />}
          >
            Sản phẩm hot
          </Button>
        </Space>
      </Card>

      {activeTab === 'recent' && (
        <>
          {viewedProducts.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary">Chưa có sản phẩm nào được xem</Text>
                    <br />
                    <Text type="secondary">Hãy xem một số sản phẩm để chúng xuất hiện ở đây</Text>
                  </div>
                }
              />
            </Card>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {viewedProducts.map(item => renderProduct(item, false))}
              </Row>
              
              {showPagination && viewedProducts.length > pageSize && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={currentPage}
                    total={viewedProducts.length}
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
        </>
      )}

      {activeTab === 'most-viewed' && (
        <>
          {mostViewedProducts.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có sản phẩm hot nào"
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {mostViewedProducts.map(item => renderProduct(item, true))}
            </Row>
          )}
        </>
      )}

      <Modal
        title="Xác nhận xóa lịch sử"
        open={showClearModal}
        onOk={handleClearHistory}
        onCancel={() => setShowClearModal(false)}
        okText="Xóa lịch sử"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem sản phẩm?</p>
        <p style={{ color: '#ff4d4f' }}>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default ViewedProducts;
