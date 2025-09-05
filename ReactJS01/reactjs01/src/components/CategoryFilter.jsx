import React from 'react';
import { Select, Typography, Space } from 'antd';
import { TagOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const CategoryFilter = ({ 
  categories = [], 
  selectedCategoryId, 
  onCategoryChange, 
  loading = false 
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <TagOutlined style={{ color: '#1890ff' }} />
        <Title level={5} style={{ margin: 0 }}>
          Lọc theo danh mục
        </Title>
      </Space>
      
      <Select
        placeholder="Chọn danh mục sản phẩm"
        style={{ width: 300 }}
        value={selectedCategoryId}
        onChange={onCategoryChange}
        loading={loading}
        allowClear
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value="">Tất cả danh mục</Option>
        {categories.map(category => (
          <Option key={category.id} value={category.id}>
            {category.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CategoryFilter;
