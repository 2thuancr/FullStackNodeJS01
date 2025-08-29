import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { testConnectionApi } from '../util/api';

const { Title, Text } = Typography;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await testConnectionApi();
      console.log('Backend test response:', response);
      message.success('Kết nối backend thành công!');
    } catch (error) {
      console.error('Backend test error:', error);
      message.error('Không thể kết nối backend! Kiểm tra server có đang chạy không.');
    }
  };

  const onFinish = async (values) => {
    console.log('Form values:', values);
    setLoading(true);
    try {
      // Chỉ gửi những field cần thiết, bỏ confirmPassword
      const { confirmPassword, ...registerData } = values;
      console.log('Register data to send:', registerData);
      
      const result = await register(registerData);
      console.log('Register result:', result);
      
      if (result.success) {
        console.log('Registration successful, navigating to OTP page...');
        console.log('Email to pass:', values.email);
        console.log('User data to pass:', result.data);
        
        // Lưu email vào localStorage như backup
        localStorage.setItem('temp_email', values.email);
        
        // Chuyển đến trang xác thực OTP với thông tin email
        navigate('/verify-otp', { 
          state: { 
            email: values.email,
            userData: result.data 
          } 
        });
      } else {
        console.log('Registration failed:', result.message);
      }
    } catch (error) {
      console.error('Error in onFinish:', error);
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
            Đăng ký
          </Title>
          <Text type="secondary">
            Tạo tài khoản mới
          </Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập tên đăng nhập"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Nhập họ và tên đầy đủ"
              size="large"
            />
          </Form.Item>

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

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            onClick={testBackendConnection}
            size="large" 
            style={{ width: '100%' }}
          >
            Test Kết nối Backend
          </Button>
          
          <Link to="/login">
            <Button 
              icon={<UserOutlined />} 
              size="large" 
              style={{ width: '100%' }}
            >
              Đã có tài khoản? Đăng nhập
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default Register;
