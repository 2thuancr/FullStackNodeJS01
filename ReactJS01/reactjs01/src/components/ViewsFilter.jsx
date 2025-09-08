import React from 'react';
import { Card, Select, Typography, Space, Tag } from 'antd';
import { EyeOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const ViewsFilter = ({ 
  viewsFilter, 
  onViewsFilterChange, 
  loading = false 
}) => {
  const viewsOptions = [
    { value: 'all', label: 'Tất cả', icon: <EyeOutlined />, color: 'default' },
    { value: 'trending', label: 'Xu hướng', icon: <FireOutlined />, color: 'red' },
    { value: 'popular', label: 'Phổ biến', icon: <StarOutlined />, color: 'orange' },
    { value: 'high_views', label: '> 5000 lượt xem', icon: <EyeOutlined />, color: 'volcano' },
    { value: 'medium_views', label: '1000-5000 lượt xem', icon: <EyeOutlined />, color: 'gold' },
    { value: 'low_views', label: '< 1000 lượt xem', icon: <EyeOutlined />, color: 'default' }
  ];

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <EyeOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Lượt xem
        </Title>
      </Space>
      
      <Select
        placeholder="Chọn mức độ phổ biến"
        style={{ width: '100%' }}
        value={viewsFilter}
        onChange={onViewsFilterChange}
        loading={loading}
        allowClear
        size="middle"
      >
        {viewsOptions.map(option => (
          <Option key={option.value} value={option.value}>
            <Space>
              {option.icon}
              <span>{option.label}</span>
              <Tag color={option.color} size="small">
                {option.value === 'all' ? 'All' : 
                 option.value === 'trending' ? 'Hot' :
                 option.value === 'popular' ? 'Popular' :
                 option.value === 'high_views' ? '>5K' :
                 option.value === 'medium_views' ? '1K-5K' :
                 option.value === 'low_views' ? '<1K' : ''}
              </Tag>
            </Space>
          </Option>
        ))}
      </Select>
    </Card>
  );
};

export default ViewsFilter;

