import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  HomeOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      onClick: () => navigate('/')
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
      onClick: () => navigate('/products')
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng',
      onClick: () => navigate('/users')
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        padding: '0 24px', 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          <span>FullStack</span>
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            flex: 1, 
            justifyContent: 'center',
            border: 'none',
            background: 'transparent'
          }}
        />

        {/* User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#666' }}>Xin chào, {user?.fullName}</span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar 
              icon={<UserOutlined />} 
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      </Header>

      {/* Content Area */}
      <div 
        className="content-scroll-area"
        style={{
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: '#f5f5f5'
        }}
      >
        <Content style={{ 
          margin: '24px', 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          minHeight: 'calc(100vh - 112px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {children}
        </Content>
        <Footer style={{ 
          textAlign: 'center',
          background: '#f5f5f5',
          padding: '16px 0',
          color: '#666'
        }}>
          FullStack NodeJS App ©2024 Created with ❤️
        </Footer>
      </div>
    </AntLayout>
  );
};

export default Layout;




