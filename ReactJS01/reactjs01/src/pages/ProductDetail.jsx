import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Image, 
  Typography, 
  Button, 
  InputNumber, 
  Select, 
  Space, 
  Divider, 
  Rate, 
  Tag, 
  message, 
  Spin,
  Carousel,
  Tabs,
  List,
  Avatar,
  Input,
  Form,
  Badge
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  ShareAltOutlined, 
  MinusOutlined, 
  PlusOutlined,
  StarOutlined,
  UserOutlined,
  MessageOutlined,
  EyeOutlined,
  LeftOutlined
} from '@ant-design/icons';
import { getProductByIdApi } from '../util/api';
import { useFavorite } from '../components/context/FavoriteContext';
import { useViewedProducts } from '../components/context/ViewedProductsContext';
import SimilarProducts from '../components/SimilarProducts';
import ProductCard from '../components/ProductCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorite();
  const { addToViewedProducts } = useViewedProducts();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Mock data for sizes (you can get this from API)
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng'];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductByIdApi(id);
      if (response?.data?.success) {
        const productData = response.data.data;
        console.log('Product data from API:', productData);
        console.log('Product images:', productData.images);
        console.log('Product image:', productData.image);
        setProduct(productData);
        
        // Add to viewed products
        addToViewedProducts(productData.id);
        
        // Set first image as selected
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(0);
        }
        
        // Mock reviews data (replace with real API)
        setReviews([
          {
            id: 1,
            user: 'Nguyễn Văn A',
            rating: 5,
            comment: 'Sản phẩm rất đẹp, chất lượng tốt, giao hàng nhanh. Rất hài lòng!',
            date: '2024-01-15',
            verified: true
          },
          {
            id: 2,
            user: 'Trần Thị B',
            rating: 4,
            comment: 'Sản phẩm ổn, giá cả hợp lý. Chỉ hơi nhỏ so với kích thước mong đợi.',
            date: '2024-01-10',
            verified: true
          },
          {
            id: 3,
            user: 'Lê Văn C',
            rating: 5,
            comment: 'Tuyệt vời! Sẽ mua lại lần sau.',
            date: '2024-01-08',
            verified: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      message.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn size');
      return;
    }
    
    try {
      // Mock API call (replace with real API)
      message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      message.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn size');
      return;
    }
    message.info('Chuyển đến trang thanh toán');
  };

  const handleToggleFavorite = async () => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product.id);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      message.warning('Vui lòng nhập bình luận');
      return;
    }
    
    setSubmittingReview(true);
    try {
      // Mock API call (replace with real API)
      const review = {
        id: Date.now(),
        user: 'Bạn',
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
        verified: false
      };
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      message.success('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      message.error('Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải thông tin sản phẩm...</Text>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Text type="secondary">Không tìm thấy sản phẩm</Text>
        <br />
        <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  // Handle different image data structures
  let images = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images = product.images;
  } else if (product.image) {
    images = [product.image];
  } else if (product.imageUrl) {
    images = [product.imageUrl];
  } else {
    images = ['https://via.placeholder.com/400x400?text=No+Image'];
  }
  
  console.log('Final images array:', images);
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;
  const totalReviews = reviews.length;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Back Button */}
      <Button 
        icon={<LeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        Quay lại
      </Button>

      <Row gutter={[32, 32]}>
        {/* Product Images */}
        <Col xs={24} lg={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                  preview={{
                    mask: <EyeOutlined />
                  }}
                  fallback="https://via.placeholder.com/400x400?text=No+Image"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px dashed #d9d9d9'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }}>📷</div>
                    <div style={{ color: '#999' }}>Không có ảnh sản phẩm</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space wrap>
                  {images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={60}
                      height={60}
                      style={{
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: '4px'
                      }}
                      onClick={() => setSelectedImage(index)}
                      preview={false}
                      fallback="https://via.placeholder.com/60x60?text=No+Image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                  ))}
                </Space>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Info */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Product Name & Rating */}
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {product.name}
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Rate disabled value={averageRating} style={{ fontSize: 16 }} />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({totalReviews} đánh giá)
                  </Text>
                </div>
              </div>

              {/* Price */}
              <div>
                <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                  {product.price?.toLocaleString('vi-VN')} ₫
                </Title>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text delete type="secondary" style={{ marginLeft: 8 }}>
                    {product.originalPrice.toLocaleString('vi-VN')} ₫
                  </Text>
                )}
              </div>

              {/* Stock Status */}
              <div>
                <Tag color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}>
                  {product.stock > 10 ? 'Còn hàng' : 
                   product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 
                   'Hết hàng'}
                </Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Mã sản phẩm: {product.id}
                </Text>
              </div>

              {/* Size Selection */}
              <div>
                <Text strong>Kích thước:</Text>
                <div style={{ marginTop: 8 }}>
                  <Select
                    value={selectedSize}
                    onChange={setSelectedSize}
                    placeholder="Chọn size"
                    style={{ width: 120 }}
                  >
                    {sizes.map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <Text strong>Số lượng:</Text>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Button 
                      icon={<MinusOutlined />} 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    />
                    <InputNumber
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={product.stock}
                      style={{ width: 80 }}
                    />
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    />
                  </Space>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <Space wrap>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={!selectedSize || product.stock === 0}
                    style={{ minWidth: 160 }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    danger
                    onClick={handleBuyNow}
                    disabled={!selectedSize || product.stock === 0}
                    style={{ minWidth: 160 }}
                  >
                    Mua ngay
                  </Button>
                </Space>
              </div>

              {/* Additional Actions */}
              <div>
                <Space>
                  <Button
                    icon={<HeartOutlined />}
                    type={isFavorite(product.id) ? 'primary' : 'default'}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite(product.id) ? 'Đã yêu thích' : 'Yêu thích'}
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    Chia sẻ
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Card style={{ marginTop: 32 }}>
        <Tabs defaultActiveKey="description">
          <Tabs.TabPane tab="Mô tả sản phẩm" key="description">
            <div style={{ padding: '16px 0' }}>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                {product.description || 'Sản phẩm chất lượng cao, được thiết kế đẹp mắt và phù hợp với nhiều phong cách thời trang. Chất liệu bền đẹp, dễ dàng vệ sinh và bảo quản.'}
              </Paragraph>
              
              <Divider />
              
              <Title level={4}>Thông số kỹ thuật:</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Text strong>Chất liệu:</Text> <Text>100% Cotton</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Xuất xứ:</Text> <Text>Việt Nam</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Màu sắc:</Text> <Text>Đa dạng</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Bảo hành:</Text> <Text>6 tháng</Text>
                </Col>
              </Row>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab={`Đánh giá (${totalReviews})`} key="reviews">
            <div style={{ padding: '16px 0' }}>
              {/* Review Summary */}
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                      {averageRating.toFixed(1)}
                    </Title>
                    <Rate disabled value={averageRating} style={{ fontSize: 20 }} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">{totalReviews} đánh giá</Text>
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={16}>
                  <div>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ width: 20 }}>{star}</Text>
                          <StarOutlined style={{ color: '#faad14', margin: '0 8px' }} />
                          <div style={{ 
                            flex: 1, 
                            height: 8, 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: 4, 
                            margin: '0 8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: '#faad14',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <Text type="secondary" style={{ width: 40, textAlign: 'right' }}>
                            {count}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Write Review */}
              <Card title="Viết đánh giá của bạn" style={{ marginBottom: 24 }}>
                <Form layout="vertical">
                  <Form.Item label="Đánh giá">
                    <Rate 
                      value={newReview.rating} 
                      onChange={(value) => setNewReview(prev => ({ ...prev, rating: value }))}
                    />
                  </Form.Item>
                  <Form.Item label="Bình luận">
                    <TextArea
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      onClick={handleSubmitReview}
                      loading={submittingReview}
                    >
                      Gửi đánh giá
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {/* Reviews List */}
              <List
                dataSource={reviews}
                renderItem={(review) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={<UserOutlined />} />
                      }
                      title={
                        <Space>
                          <Text strong>{review.user}</Text>
                          <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                          {review.verified && <Tag color="green">Đã mua</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <Paragraph style={{ margin: '8px 0' }}>
                            {review.comment}
                          </Paragraph>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Similar Products */}
      <Card style={{ marginTop: 32 }}>
        <Title level={3}>Sản phẩm tương tự</Title>
        <SimilarProducts 
          productId={product.id}
          onViewProduct={(product) => navigate(`/products/${product.id}`)}
          onAddToCart={handleAddToCart}
        />
      </Card>
    </div>
  );
};

export default ProductDetail;
