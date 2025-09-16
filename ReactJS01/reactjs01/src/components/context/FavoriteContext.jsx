import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { 
  addToFavoritesApi, 
  removeFromFavoritesApi, 
  getFavoritesApi, 
  checkFavoriteStatusApi,
  getFavoritesCountApi 
} from '../../util/api';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
};

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const loadingRef = useRef(false);
  const lastErrorTimeRef = useRef(0);
  const initialLoadRef = useRef(false);

  // Load favorites when user changes
  useEffect(() => {
    if (user && !initialLoadRef.current) {
      console.log('User changed, loading favorites for:', user.id);
      initialLoadRef.current = true;
      loadFavorites();
      loadFavoritesCount();
    } else if (!user) {
      console.log('No user, clearing favorites');
      initialLoadRef.current = false;
      setFavorites([]);
      setFavoriteIds(new Set());
      setFavoritesCount(0);
    }
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  const loadFavorites = async (params = {}) => {
    if (!user) {
      console.log('No user found, skipping favorites load');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('Favorites already loading, skipping...');
      return;
    }
    
    try {
      loadingRef.current = true;
      setLoading(true);
      console.log('Loading favorites for user:', user.id, 'with params:', params);
      const response = await getFavoritesApi(params);
      if (response?.data?.success) {
        const favoritesData = response.data.data.favorites || response.data.data;
        setFavorites(favoritesData);
        
        // Update favorite IDs set for quick lookup
        const ids = new Set(favoritesData.map(fav => 
          fav.productId || fav.product?.id || fav.id
        ));
        setFavoriteIds(ids);
        console.log('Favorites loaded successfully:', favoritesData.length, 'items');
      } else {
        console.warn('Favorites API returned unsuccessful response:', response?.data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      
      // Prevent spam error messages - only show once every 5 seconds
      const now = Date.now();
      const timeSinceLastError = now - lastErrorTimeRef.current;
      
      if (timeSinceLastError > 5000) { // 5 seconds
        lastErrorTimeRef.current = now;
        
        if (error.response?.status === 401) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
          message.error('Bạn không có quyền truy cập danh sách yêu thích.');
        } else if (error.code !== 'ERR_NETWORK') {
          // Don't show error for network issues as they might be temporary
          message.error('Không thể tải danh sách yêu thích');
        }
      } else {
        console.log('Suppressing error message to prevent spam');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadFavoritesCount = async () => {
    if (!user) return;
    
    try {
      const response = await getFavoritesCountApi();
      if (response?.data?.success) {
        setFavoritesCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  };

  const addToFavorites = async (productId) => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm yêu thích');
      return false;
    }

    try {
      console.log('Adding to favorites:', productId, 'for user:', user.id);
      const response = await addToFavoritesApi(productId);
      if (response?.data?.success) {
        // Update all states immediately
        setFavoriteIds(prev => new Set([...prev, productId]));
        setFavoritesCount(prev => prev + 1);
        
        // Reload favorites to get the complete product data (only if not already loading)
        if (!loadingRef.current) {
          loadFavorites();
        }
        
        message.success('Đã thêm vào danh sách yêu thích');
        return true;
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền thêm sản phẩm yêu thích.');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể thêm vào danh sách yêu thích');
      }
      return false;
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để xóa sản phẩm yêu thích');
      return false;
    }

    try {
      const response = await removeFromFavoritesApi(productId);
      if (response?.data?.success) {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setFavorites(prev => prev.filter(fav => 
          (fav.productId || fav.product?.id || fav.id) !== productId
        ));
        setFavoritesCount(prev => Math.max(0, prev - 1));
        message.success('Đã xóa khỏi danh sách yêu thích');
        return true;
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể xóa khỏi danh sách yêu thích');
      }
      return false;
    }
  };

  const toggleFavorite = async (productId) => {
    if (isFavorite(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.has(productId);
  };

  const checkFavoriteStatus = async (productId) => {
    if (!user) return false;
    
    // Check if we already have this product in our local state
    if (favoriteIds.has(productId)) {
      return true;
    }
    
    try {
      const response = await checkFavoriteStatusApi(productId);
      if (response?.data?.success) {
        const isFav = response.data.data.isFavorite;
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          if (isFav) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });
        return isFav;
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
    return false;
  };

  const clearAllFavorites = async () => {
    if (!user) return false;
    
    try {
      const response = await removeFromFavoritesApi('clear');
      if (response?.data?.success) {
        setFavorites([]);
        setFavoriteIds(new Set());
        setFavoritesCount(0);
        message.success('Đã xóa tất cả sản phẩm yêu thích');
        return true;
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      message.error('Không thể xóa tất cả sản phẩm yêu thích');
      return false;
    }
  };

  const value = {
    favorites,
    favoriteIds,
    favoritesCount,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    checkFavoriteStatus,
    clearAllFavorites,
    loadFavorites,
    loadFavoritesCount
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};
