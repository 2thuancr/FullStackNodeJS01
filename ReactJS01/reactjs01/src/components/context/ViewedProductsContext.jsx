import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { 
  addToViewedProductsApi, 
  getViewedProductsApi, 
  getGuestViewedProductsApi,
  clearViewedHistoryApi,
  getViewedStatisticsApi,
  getMostViewedProductsApi 
} from '../../util/api';
import { useAuth } from './AuthContext';

const ViewedProductsContext = createContext();

export const useViewedProducts = () => {
  const context = useContext(ViewedProductsContext);
  if (!context) {
    throw new Error('useViewedProducts must be used within a ViewedProductsProvider');
  }
  return context;
};

export const ViewedProductsProvider = ({ children }) => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const loadingRef = useRef(false);
  const lastErrorTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Load viewed products when user changes
  useEffect(() => {
    if (user) {
      retryCountRef.current = 0; // Reset retry count when user changes
      loadViewedProducts();
      loadMostViewedProducts();
      loadStatistics();
    } else {
      setViewedProducts([]);
      setMostViewedProducts([]);
      setStatistics(null);
      retryCountRef.current = 0; // Reset retry count when no user
    }
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  const loadViewedProducts = async (params = {}) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      return;
    }
    
    // Check retry count for 400 errors
    if (retryCountRef.current >= maxRetries) {
      return;
    }
    
    try {
      setLoading(true);
      loadingRef.current = true;
      
      // Use the correct parameters as per your documentation
      const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        days: params.days || 30
      };
      
      // Add optional parameters if provided
      if (params.sortBy) apiParams.sortBy = params.sortBy;
      if (params.sortOrder) apiParams.sortOrder = params.sortOrder;
      
      // Use user API if user is logged in, otherwise use guest API
      const response = user 
        ? await getViewedProductsApi(apiParams)
        : await getGuestViewedProductsApi(apiParams);
      
      if (response?.data?.success) {
        // Try different possible data structures
        let viewedData = [];
        
        if (response.data.data.viewedProducts) {
          viewedData = response.data.data.viewedProducts;
        } else if (response.data.data.products) {
          viewedData = response.data.data.products;
        } else if (Array.isArray(response.data.data)) {
          viewedData = response.data.data;
        } else if (response.data.data) {
          viewedData = [response.data.data];
        }
        
        setViewedProducts(Array.isArray(viewedData) ? viewedData : []);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        setViewedProducts([]);
      }
    } catch (error) {
      // Increment retry count for 400 errors
      if (error.response?.status === 400) {
        retryCountRef.current += 1;
      }
      
      // Prevent spam error messages - only show once every 5 seconds
      const now = Date.now();
      const timeSinceLastError = now - lastErrorTimeRef.current;
      
      if (timeSinceLastError > 5000) { // 5 seconds
        lastErrorTimeRef.current = now;
        
        // Only show error message if it's not a network error or 400 error
        if (error.code !== 'ERR_NETWORK' && error.response?.status !== 404 && error.response?.status !== 400) {
          message.error('Không thể tải lịch sử xem sản phẩm');
        }
      }
      
      setViewedProducts([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadMostViewedProducts = async (params = {}) => {
    try {
      const response = await getMostViewedProductsApi(params);
      if (response?.data?.success) {
        const mostViewedData = response.data.data.products || response.data.data;
        setMostViewedProducts(mostViewedData);
      }
    } catch (error) {
      // Silent error handling for most viewed products
    }
  };

  const loadStatistics = async () => {
    if (!user) return;
    
    try {
      const response = await getViewedStatisticsApi();
      if (response?.data?.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      // Silent error handling for statistics
    }
  };

  const addToViewedProducts = async (productId) => {
    if (!productId) {
      return false;
    }
    
    try {
      const response = await addToViewedProductsApi(productId);
      
      if (response?.data?.success) {
        // Reload viewed products to get updated list
        await loadViewedProducts();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Don't show error message as this is a background operation
      return false;
    }
  };

  const clearViewedHistory = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để xóa lịch sử xem');
      return false;
    }

    try {
      const response = await clearViewedHistoryApi();
      if (response?.data?.success) {
        setViewedProducts([]);
        message.success('Đã xóa lịch sử xem sản phẩm');
        return true;
      }
    } catch (error) {
      console.error('Error clearing viewed history:', error);
      message.error('Không thể xóa lịch sử xem sản phẩm');
      return false;
    }
  };

  const getRecentViewedProducts = (limit = 5) => {
    return viewedProducts.slice(0, limit);
  };

  const getViewedProductsByCategory = (categoryId) => {
    return viewedProducts.filter(item => 
      item.product?.categoryId === categoryId || 
      item.categoryId === categoryId
    );
  };

  const getViewedProductsByDateRange = (startDate, endDate) => {
    return viewedProducts.filter(item => {
      const viewedAt = new Date(item.viewedAt || item.createdAt);
      return viewedAt >= startDate && viewedAt <= endDate;
    });
  };

  const value = {
    viewedProducts,
    mostViewedProducts,
    statistics,
    loading,
    addToViewedProducts,
    clearViewedHistory,
    loadViewedProducts,
    loadMostViewedProducts,
    loadStatistics,
    getRecentViewedProducts,
    getViewedProductsByCategory,
    getViewedProductsByDateRange
  };

  return (
    <ViewedProductsContext.Provider value={value}>
      {children}
    </ViewedProductsContext.Provider>
  );
};
