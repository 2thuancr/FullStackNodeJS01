import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { createUserApi, loginApi, getUserApi } from '../../util/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Chỉ check auth khi component mount và có token
    // Không check auth mỗi khi token thay đổi
    if (token && !user) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []); // Chỉ chạy 1 lần khi component mount

  const checkAuth = async () => {
    try {
      const response = await getUserApi();
      console.log('Check auth response:', response);
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        console.log('Check auth failed:', response.data.message);
        logout();
      }
    } catch (error) {
      console.error('Check auth error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      console.log('Login response:', response);
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        console.log('Login successful, user data:', userData);
        console.log('Login successful, token:', authToken);
        
        // Set user và token trước
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        
        message.success('Đăng nhập thành công!');
        return { success: true };
      } else {
        console.log('Login failed:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại!';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register data:', userData);
      const response = await createUserApi(userData.username, userData.fullName, userData.email, userData.password);
      console.log('Register response:', response);
      
      // Kiểm tra response structure
      if (response && response.data) {
        console.log('Response data:', response.data);
        if (response.data.success) {
          message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
          return { success: true, data: response.data.data };
        } else {
          console.log('API returned success: false');
          return { success: false, message: response.data.message || 'Đăng ký thất bại!' };
        }
      } else {
        console.log('Invalid response structure:', response);
        return { success: false, message: 'Response không hợp lệ!' };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại!';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    message.info('Đã đăng xuất!');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth, // Export checkAuth để có thể gọi từ bên ngoài
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
