import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTPApi, resendOTPApi } from '../util/api';

const { Title, Text } = Typography;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const formRef = useRef();

  // Lấy thông tin user từ location state (được truyền từ trang đăng ký)
  const userData = location.state?.userData;
  const email = location.state?.email || localStorage.getItem('temp_email');

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Email from state:', email);
    console.log('User data from state:', userData);
    
    if (!email) {
      message.error('Không tìm thấy thông tin email!');
      navigate('/register');
      return;
    }

    // Force update form với email mới
    if (formRef.current && email) {
      formRef.current.setFieldsValue({ email: email });
      console.log('Form updated with email:', email);
    }

    // Bắt đầu đếm ngược
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate, location.state, userData]);

  const onFinish = async (values) => {
    console.log('OTP Form values:', values);
    console.log('Email from location state:', email);
    console.log('User data from location state:', userData);
    
    setLoading(true);
    try {
      // Đảm bảo sử dụng email từ form
      const emailToUse = values.email || email;
      console.log('Using email for API call:', emailToUse);
      console.log('OTP value from form:', values.otpCode);
      console.log('Form values:', values);
      
      // Gửi cả email và OTP từ form
      const response = await verifyOTPApi(emailToUse, values.otpCode);
      console.log('Verify OTP response:', response);

      if (response.data.success) {
        message.success('Xác thực OTP thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        message.error(response.data.message || 'Mã OTP không đúng!');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Xác thực OTP thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Sử dụng email từ form hoặc từ state
      const emailToUse = email || userData?.email;
      console.log('Resending OTP to:', emailToUse);
      
      const response = await resendOTPApi(emailToUse);
      if (response.data.success) {
        message.success('Đã gửi lại mã OTP!');
        setCountdown(60);
        setCanResend(false);
      } else {
        message.error(response.data.message || 'Gửi lại OTP thất bại!');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Gửi lại OTP thất bại!';
      message.error(errorMessage);
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
            Xác thực Email
          </Title>
          <Text type="secondary">
            Nhập mã OTP đã được gửi đến {email}
          </Text>
        </div>

        <Form
          ref={formRef}
          name="verifyOTP"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          initialValues={{ email: email }}
          onValuesChange={(changedValues, allValues) => {
            console.log('Form values changed:', allValues);
          }}
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
              placeholder="Email của bạn"
              size="large"
              value={email}
              disabled
            />
          </Form.Item>
          
          <Form.Item
            name="otpCode"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP!' },
              { len: 6, message: 'Mã OTP phải có 6 ký tự!' }
            ]}
          >
            <Input 
              prefix={<LockOutlined />} 
              placeholder="Nhập mã OTP 6 ký tự"
              size="large"
              maxLength={6}
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
              Xác thực
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            onClick={handleResendOTP}
            disabled={!canResend || loading}
            size="large" 
            style={{ width: '100%' }}
          >
            {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau ${countdown}s`}
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Current form values:', { email, userData });
              console.log('Location state:', location.state);
              console.log('Form ref values:', formRef.current?.getFieldsValue());
              console.log('Form initial values:', formRef.current?.getFieldsValue());
            }}
            size="large" 
            style={{ width: '100%' }}
          >
            Debug Info
          </Button>
          
          <Button 
            onClick={async () => {
              try {
                const formValues = formRef.current?.getFieldsValue();
                const emailToTest = formValues?.email || email;
                               console.log('Testing API call with:', { email: emailToTest, otpCode: '123456' });
               const response = await verifyOTPApi(emailToTest, '123456');
                console.log('Test API response:', response);
              } catch (error) {
                console.error('Test API error:', error);
              }
            }}
            size="large" 
            style={{ width: '100%' }}
          >
            Test API
          </Button>
          
          <Button 
            onClick={() => navigate('/register')}
            size="large" 
            style={{ width: '100%' }}
          >
            Quay lại đăng ký
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default VerifyOTP;
