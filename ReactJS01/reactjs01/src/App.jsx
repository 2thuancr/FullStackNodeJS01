import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './components/context/AuthContext';
import { FavoriteProvider } from './components/context/FavoriteContext';
import { ViewedProductsProvider } from './components/context/ViewedProductsContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import TestPage from './pages/TestPage';
import ElasticsearchDemo from './pages/ElasticsearchDemo';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <FavoriteProvider>
          <ViewedProductsProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/products" element={
                  <PrivateRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/products/:id" element={
                  <PrivateRoute>
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/test" element={
                  <PrivateRoute>
                    <Layout>
                      <TestPage />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/elasticsearch-demo" element={
                  <PrivateRoute>
                    <Layout>
                      <ElasticsearchDemo />
                    </Layout>
                  </PrivateRoute>
                } />
              </Routes>
            </Router>
          </ViewedProductsProvider>
        </FavoriteProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;








