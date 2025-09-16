import React from 'react';
import { Card, Typography, Button } from 'antd';

const { Title, Text } = Typography;

const TestPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Test Page</Title>
        <Text>Nếu bạn thấy trang này, có nghĩa là React app đang hoạt động bình thường.</Text>
        <br />
        <Button type="primary" style={{ marginTop: 16 }}>
          Test Button
        </Button>
      </Card>
    </div>
  );
};

export default TestPage;

