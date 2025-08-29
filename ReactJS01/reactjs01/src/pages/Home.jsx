import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  RocketOutlined, 
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Chào mừng trở lại, {user?.fullName}! 👋</Title>
        <Paragraph type="secondary">
          Đây là trang quản trị của ứng dụng FullStack NodeJS
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng mới"
              value={93}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoạt động"
              value={1128}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cài đặt"
              value={15}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin tài khoản" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <strong>Tên đăng nhập:</strong> {user?.username}
              </div>
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Vai trò:</strong> {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </div>
              <div>
                <strong>Ngày tham gia:</strong> {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Truy cập nhanh" style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<TeamOutlined />} 
                size="large"
                onClick={() => navigate('/users')}
                style={{ width: '100%', textAlign: 'left' }}
              >
                Quản lý người dùng
                <ArrowRightOutlined style={{ float: 'right' }} />
              </Button>
              <Button 
                icon={<SettingOutlined />} 
                size="large"
                onClick={() => navigate('/settings')}
                style={{ width: '100%', textAlign: 'left' }}
              >
                Cài đặt hệ thống
                <ArrowRightOutlined style={{ float: 'right' }} />
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Thống kê hoạt động">
            <Paragraph>
              Ứng dụng đang hoạt động ổn định với {user?.role === 'admin' ? 'quyền quản trị đầy đủ' : 'quyền người dùng cơ bản'}.
              Bạn có thể sử dụng các tính năng tương ứng với vai trò của mình.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
