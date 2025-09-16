import React from 'react';
import { Typography, Tag, Space, Divider } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const SearchResults = ({ 
  searchTerm, 
  totalResults, 
  activeFilters = {},
  onClearSearch,
  onClearFilters 
}) => {
  if (!searchTerm && Object.keys(activeFilters).length === 0) {
    return null;
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const hasSearchTerm = searchTerm && searchTerm.trim().length > 0;

  return (
    <div style={{
      background: '#f8f9fa',
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
      border: '1px solid #e9ecef'
    }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Search Results Header */}
        {hasSearchTerm && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <SearchOutlined style={{ color: '#1890ff' }} />
              <Text strong>
                Kết quả tìm kiếm cho: "<Text code>{searchTerm}</Text>"
              </Text>
              <Tag color="blue">{totalResults} sản phẩm</Tag>
            </Space>
            <Text 
              type="secondary" 
              style={{ cursor: 'pointer', color: '#1890ff' }}
              onClick={onClearSearch}
            >
              Xóa tìm kiếm
            </Text>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <>
            {hasSearchTerm && <Divider style={{ margin: '8px 0' }} />}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space wrap>
                <FilterOutlined style={{ color: '#52c41a' }} />
                <Text strong>Bộ lọc đang áp dụng:</Text>
                {activeFilters.category && (
                  <Tag color="green" closable onClose={() => onClearFilters('category')}>
                    Danh mục: {activeFilters.category}
                  </Tag>
                )}
                {activeFilters.priceRange && (
                  <Tag color="orange" closable onClose={() => onClearFilters('priceRange')}>
                    Giá: {activeFilters.priceRange[0].toLocaleString()} - {activeFilters.priceRange[1].toLocaleString()} VNĐ
                  </Tag>
                )}
                {activeFilters.promotion && (
                  <Tag color="red" closable onClose={() => onClearFilters('promotion')}>
                    {activeFilters.promotion}
                  </Tag>
                )}
                {activeFilters.views && (
                  <Tag color="purple" closable onClose={() => onClearFilters('views')}>
                    Lượt xem: {activeFilters.views}
                  </Tag>
                )}
                {activeFilters.rating && (
                  <Tag color="gold" closable onClose={() => onClearFilters('rating')}>
                    Đánh giá: {activeFilters.rating} sao trở lên
                  </Tag>
                )}
                {activeFilters.status && (
                  <Tag color="cyan" closable onClose={() => onClearFilters('status')}>
                    Trạng thái: {activeFilters.status}
                  </Tag>
                )}
              </Space>
              <Text 
                type="secondary" 
                style={{ cursor: 'pointer', color: '#1890ff' }}
                onClick={() => onClearFilters('all')}
              >
                Xóa tất cả bộ lọc
              </Text>
            </div>
          </>
        )}

        {/* No Results Message */}
        {totalResults === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">
              {hasSearchTerm 
                ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"`
                : 'Không có sản phẩm nào phù hợp với bộ lọc'
              }
            </Text>
          </div>
        )}
      </Space>
    </div>
  );
};

export default SearchResults;





