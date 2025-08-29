import React from 'react';
import { Card, Row, Col, Typography, Space, Divider, Tag } from 'antd';
import { 
  CodeOutlined, 
  DatabaseOutlined, 
  ApiOutlined, 
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const technologies = [
    {
      name: 'React.js',
      description: 'Thư viện JavaScript để xây dựng giao diện người dùng',
      icon: <CodeOutlined style={{ fontSize: '24px', color: '#61dafb' }} />,
      color: '#61dafb'
    },
    {
      name: 'Node.js',
      description: 'Môi trường runtime JavaScript phía server',
      icon: <CodeOutlined style={{ fontSize: '24px', color: '#339933' }} />,
      color: '#339933'
    },
    {
      name: 'Express.js',
      description: 'Framework web cho Node.js, đơn giản và linh hoạt',
      icon: <ApiOutlined style={{ fontSize: '24px', color: '#000000' }} />,
      color: '#000000'
    },
    {
      name: 'MongoDB',
      description: 'Cơ sở dữ liệu NoSQL hướng tài liệu',
      icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#47a248' }} />,
      color: '#47a248'
    },
    {
      name: 'Ant Design',
      description: 'Thư viện UI components cho React',
      icon: <CodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      name: 'JWT Authentication',
      description: 'Xác thực và phân quyền người dùng',
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      color: '#fa8c16'
    }
  ];

  const features = [
    '✅ Hệ thống đăng ký và đăng nhập an toàn',
    '✅ Xác thực email bằng mã OTP',
    '✅ Quản lý phiên đăng nhập với JWT',
    '✅ Giao diện responsive và thân thiện',
    '✅ Kiến trúc RESTful API',
    '✅ Bảo mật dữ liệu người dùng'
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '48px', color: 'white' }}>
        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
          🚀 Chào mừng đến với FullStack NodeJS
        </Title>
        <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
          Dự án demo tích hợp các công nghệ web hiện đại để xây dựng ứng dụng hoàn chỉnh
        </Paragraph>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Tag color="blue" style={{ fontSize: '14px', padding: '8px 16px' }}>
            <RocketOutlined /> FullStack Development
          </Tag>
          <Tag color="green" style={{ fontSize: '14px', padding: '8px 16px' }}>
            <HeartOutlined /> Modern Web Technologies
          </Tag>
          <Tag color="purple" style={{ fontSize: '14px', padding: '8px 16px' }}>
            <CheckCircleOutlined /> Best Practices
          </Tag>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Technologies Section */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CodeOutlined style={{ color: '#1890ff' }} />
              <span>Công nghệ sử dụng trong dự án</span>
            </div>
          }
          style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[16, 16]}>
            {technologies.map((tech, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center', 
                    border: `2px solid ${tech.color}`,
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  hoverable
                >
                  <div style={{ marginBottom: '12px' }}>
                    {tech.icon}
                  </div>
                  <Title level={5} style={{ margin: '8px 0', color: tech.color }}>
                    {tech.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {tech.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Features Section */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Tính năng chính</span>
                </div>
              }
              style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {features.map((feature, index) => (
                  <div key={index} style={{ fontSize: '14px' }}>
                    {feature}
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RocketOutlined style={{ color: '#722ed1' }} />
                  <span>Về dự án</span>
                </div>
              }
              style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Đây là dự án demo FullStack sử dụng Node.js và React.js để xây dựng hệ thống quản lý người dùng 
                với các tính năng xác thực và phân quyền. Dự án áp dụng các best practices trong phát triển web hiện đại.
              </Paragraph>
              
              <Divider />
              
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  🎯 Mục tiêu học tập
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiểu rõ kiến trúc FullStack và cách tích hợp Frontend với Backend
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: 'rgba(255,255,255,0.8)' }}>
          <Paragraph style={{ margin: '0' }}>
            Made with ❤️ using modern web technologies
          </Paragraph>
          <Text style={{ fontSize: '12px' }}>
            © 2024 FullStack NodeJS Demo Project
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Home;
