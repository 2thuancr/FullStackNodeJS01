import React from 'react';
import { Pagination, Button, Space, Typography, Row, Col } from 'antd';
import { 
  DoubleLeftOutlined, 
  LeftOutlined, 
  RightOutlined, 
  DoubleRightOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

const CustomPagination = ({ 
  current, 
  total, 
  pageSize, 
  onChange, 
  showQuickJumper = true,
  showTotal = true 
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total > 0 ? (current - 1) * pageSize + 1 : 0;
  const endItem = Math.min(current * pageSize, total);
  
  console.log('CustomPagination render:', { current, total, pageSize, totalPages, startItem, endItem }); // Debug log

  const handlePageChange = (page) => {
    onChange(page);
  };

  const handlePrev = () => {
    if (current > 1) {
      handlePageChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      handlePageChange(current + 1);
    }
  };

  const handleFirst = () => {
    handlePageChange(1);
  };

  const handleLast = () => {
    handlePageChange(totalPages);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, current - 2);
      let end = Math.min(totalPages, current + 2);
      
      // Adjust if we're near the beginning or end
      if (current <= 3) {
        end = Math.min(5, totalPages);
      }
      if (current >= totalPages - 2) {
        start = Math.max(1, totalPages - 4);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={{ marginTop: 32 }}>
      <Row justify="space-between" align="middle">
        <Col>
          {showTotal && (
            <Text type="secondary">
              Hiển thị {startItem}-{endItem} của {total} sản phẩm
            </Text>
          )}
        </Col>
        
        <Col>
          <Space size="small">
            {/* First Page */}
            <Button 
              size="small" 
              icon={<DoubleLeftOutlined />}
              onClick={handleFirst}
              disabled={current === 1}
              title="Trang đầu"
            />
            
            {/* Previous Page */}
            <Button 
              size="small" 
              icon={<LeftOutlined />}
              onClick={handlePrev}
              disabled={current === 1}
              title="Trang trước"
            />
            
            {/* Page Numbers */}
            <Space size="small">
              {pageNumbers.map(pageNum => (
                <Button
                  key={pageNum}
                  size="small"
                  type={pageNum === current ? 'primary' : 'default'}
                  onClick={() => handlePageChange(pageNum)}
                  style={{ minWidth: 32 }}
                >
                  {pageNum}
                </Button>
              ))}
            </Space>
            
            {/* Next Page */}
            <Button 
              size="small" 
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={current === totalPages}
              title="Trang sau"
            />
            
            {/* Last Page */}
            <Button 
              size="small" 
              icon={<DoubleRightOutlined />}
              onClick={handleLast}
              disabled={current === totalPages}
              title="Trang cuối"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CustomPagination;
