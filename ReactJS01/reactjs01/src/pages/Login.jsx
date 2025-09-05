import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate('/');
      }
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
            Đăng nhập
          </Title>
          <Text type="secondary">
            Chào mừng bạn trở lại!
          </Text>
        </div>

        <Form
          name="login"
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

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
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
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Link to="/register">
            <Button 
              icon={<UserOutlined />} 
              size="large" 
              style={{ width: '100%' }}
            >
              Đăng ký tài khoản mới
            </Button>
          </Link>
          
          <Link to="/forgot-password">
            <Button 
              type="link" 
              style={{ width: '100%' }}
            >
              Quên mật khẩu?
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default Login;

