import React from 'react';
import { Card, Slider, Typography, Space, InputNumber, Row, Col } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PriceRangeFilter = ({ 
  priceRange, 
  onPriceRangeChange, 
  loading = false 
}) => {
  const [minPrice, maxPrice] = priceRange || [0, 10000000];

  const handleSliderChange = (value) => {
    onPriceRangeChange(value);
  };

  const handleMinPriceChange = (value) => {
    if (value !== null && value >= 0) {
      onPriceRangeChange([value, maxPrice]);
    }
  };

  const handleMaxPriceChange = (value) => {
    if (value !== null && value >= minPrice) {
      onPriceRangeChange([minPrice, value]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <DollarOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Khoảng giá
        </Title>
      </Space>
      
      <div style={{ marginBottom: 16 }}>
        <Slider
          range
          min={0}
          max={10000000}
          step={100000}
          value={priceRange}
          onChange={handleSliderChange}
          disabled={loading}
          tooltip={{
            formatter: (value) => formatPrice(value)
          }}
        />
      </div>

      <Row gutter={8}>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Từ</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 4 }}
              value={minPrice}
              onChange={handleMinPriceChange}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0"
              disabled={loading}
              min={0}
              max={maxPrice}
            />
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Đến</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 4 }}
              value={maxPrice}
              onChange={handleMaxPriceChange}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="10,000,000"
              disabled={loading}
              min={minPrice}
              max={10000000}
            />
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatPrice(minPrice)} - {formatPrice(maxPrice)}
        </Text>
      </div>
    </Card>
  );
};

export default PriceRangeFilter;
