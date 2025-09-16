import React from 'react';
import { Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingState = ({ message = 'Đang tải...', size = 'large' }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <Spin 
        size={size} 
        indicator={<LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} spin />}
      />
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">{message}</Text>
      </div>
    </div>
  );
};

export default LoadingState;

