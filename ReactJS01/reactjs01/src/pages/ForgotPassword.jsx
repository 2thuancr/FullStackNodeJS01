import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Quên mật khẩu
          </Title>
          <Text type="secondary">
            Nhập email để khôi phục mật khẩu
          </Text>
        </div>

        <Form
          name="forgotPassword"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              Gửi email khôi phục
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Link to="/login">
            <Button 
              icon={<ArrowLeftOutlined />} 
              size="large" 
              style={{ width: '100%' }}
            >
              Quay lại đăng nhập
            </Button>
          </Link>
          
          <Link to="/register">
            <Button 
              type="link" 
              style={{ width: '100%' }}
            >
              Chưa có tài khoản? Đăng ký ngay
            </Button>
          </Link>
        </Space>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu đến email của bạn.
            Vui lòng kiểm tra cả thư mục spam nếu không thấy email.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;

