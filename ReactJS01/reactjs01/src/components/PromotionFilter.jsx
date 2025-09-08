import React from 'react';
import { Card, Select, Typography, Space, Tag } from 'antd';
import { GiftOutlined, PercentageOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const PromotionFilter = ({ 
  promotionFilter, 
  onPromotionFilterChange, 
  loading = false 
}) => {
  const promotionOptions = [
    { value: '', label: 'Tất cả', color: 'default' },
    { value: 'any', label: 'Có khuyến mãi', color: 'red' },
    { value: 'high', label: 'Giảm > 20%', color: 'volcano' },
    { value: 'medium', label: 'Giảm 10-20%', color: 'orange' },
    { value: 'low', label: 'Giảm < 10%', color: 'gold' }
  ];

  const getOptionIcon = (value) => {
    switch (value) {
      case 'any':
      case 'high':
      case 'medium':
      case 'low':
        return <PercentageOutlined />;
      default:
        return <GiftOutlined />;
    }
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <GiftOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Khuyến mãi
        </Title>
      </Space>
      
      <Select
        placeholder="Chọn loại khuyến mãi"
        style={{ width: '100%' }}
        value={promotionFilter}
        onChange={onPromotionFilterChange}
        loading={loading}
        allowClear
        size="middle"
      >
        {promotionOptions.map(option => (
          <Option key={option.value} value={option.value}>
            <Space>
              {getOptionIcon(option.value)}
              <span>{option.label}</span>
              <Tag color={option.color} size="small">
                {option.value === '' ? 'All' : 
                 option.value === 'any' ? 'Sale' :
                 option.value === 'high' ? '>20%' :
                 option.value === 'medium' ? '10-20%' :
                 option.value === 'low' ? '<10%' : ''}
              </Tag>
            </Space>
          </Option>
        ))}
      </Select>
    </Card>
  );
};

export default PromotionFilter;
