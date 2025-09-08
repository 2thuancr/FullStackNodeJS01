import React from 'react';
import { Card, Select, Typography, Space, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const StatusFilter = ({ 
  statusFilter, 
  onStatusFilterChange, 
  loading = false 
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tất cả', icon: <ClockCircleOutlined />, color: 'default' },
    { value: 'in_stock', label: 'Còn hàng', icon: <CheckCircleOutlined />, color: 'green' },
    { value: 'low_stock', label: 'Sắp hết hàng', icon: <ExclamationCircleOutlined />, color: 'orange' },
    { value: 'out_of_stock', label: 'Hết hàng', icon: <CloseCircleOutlined />, color: 'red' }
  ];

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <CheckCircleOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Trạng thái
        </Title>
      </Space>
      
      <Select
        placeholder="Chọn trạng thái"
        style={{ width: '100%' }}
        value={statusFilter}
        onChange={onStatusFilterChange}
        loading={loading}
        allowClear
        size="middle"
      >
        {statusOptions.map(option => (
          <Option key={option.value} value={option.value}>
            <Space>
              {option.icon}
              <span>{option.label}</span>
              <Tag color={option.color} size="small">
                {option.value === 'all' ? 'All' : 
                 option.value === 'in_stock' ? 'In Stock' :
                 option.value === 'low_stock' ? 'Low Stock' :
                 option.value === 'out_of_stock' ? 'Out of Stock' : ''}
              </Tag>
            </Space>
          </Option>
        ))}
      </Select>
    </Card>
  );
};

export default StatusFilter;
