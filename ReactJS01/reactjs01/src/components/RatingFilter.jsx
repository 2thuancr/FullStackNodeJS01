import React from 'react';
import { Card, Select, Typography, Space, Tag, Rate } from 'antd';
import { StarOutlined, HeartOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const RatingFilter = ({ 
  ratingFilter, 
  onRatingFilterChange, 
  loading = false 
}) => {
  const ratingOptions = [
    { value: '', label: 'Tất cả', rating: 0, color: 'default' },
    { value: '5', label: 'Xuất sắc (5 sao)', rating: 5, color: 'green' },
    { value: '4', label: 'Rất tốt (4+ sao)', rating: 4, color: 'blue' },
    { value: '3', label: 'Tốt (3+ sao)', rating: 3, color: 'orange' },
    { value: '2', label: 'Trung bình (2+ sao)', rating: 2, color: 'gold' },
    { value: '1', label: 'Kém (1+ sao)', rating: 1, color: 'red' }
  ];

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <StarOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Đánh giá
        </Title>
      </Space>
      
      <Select
        placeholder="Chọn mức đánh giá"
        style={{ width: '100%' }}
        value={ratingFilter}
        onChange={onRatingFilterChange}
        loading={loading}
        allowClear
        size="middle"
      >
        {ratingOptions.map(option => (
          <Option key={option.value} value={option.value}>
            <Space>
              <StarOutlined />
              <span>{option.label}</span>
              {option.rating > 0 && (
                <Rate 
                  disabled 
                  value={option.rating} 
                  style={{ fontSize: '12px' }}
                />
              )}
              <Tag color={option.color} size="small">
                {option.value === '' ? 'All' : 
                 option.value === '5' ? '5★' :
                 option.value === '4' ? '4★+' :
                 option.value === '3' ? '3★+' :
                 option.value === '2' ? '2★+' :
                 option.value === '1' ? '1★+' : ''}
              </Tag>
            </Space>
          </Option>
        ))}
      </Select>
    </Card>
  );
};

export default RatingFilter;
