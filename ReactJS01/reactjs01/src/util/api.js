import axios from './axios.customize';

// API functions
const createUserApi = (username, fullName, email, password) => {
  const URL_API = "/v1/api/register";
  // Gửi cả username và name để tương thích với backend
  const data = { 
    username, 
    name: fullName, // Backend có thể mong đợi field 'name'
    fullName, 
    email, 
    password 
  };
  console.log('Sending to:', URL_API, 'Data:', data);
  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = { email, password };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/profile";
  return axios.get(URL_API);
};

// OTP API functions
const sendOTPApi = (email) => {
  const URL_API = "/v1/api/send-otp";
  const data = { email };
  return axios.post(URL_API, data);
};

const verifyOTPApi = (email, otpCode) => {
  const URL_API = "/v1/api/verify-otp";
  const data = { email, otpCode };
  console.log('Verify OTP API call:', URL_API, 'Data:', data);
  return axios.post(URL_API, data);
};

const resendOTPApi = (email) => {
  const URL_API = "/v1/api/resend-otp";
  const data = { email };
  return axios.post(URL_API, data);
};

const checkEmailVerificationApi = (email) => {
  const URL_API = `/v1/api/check-email-verification/${email}`;
  return axios.get(URL_API);
};

// Test API để kiểm tra kết nối backend
const testConnectionApi = () => {
  const URL_API = "/v1/api/test";
  return axios.get(URL_API);
};

// Products API functions
const getProductsApi = (params = {}) => {
  const URL_API = "/v1/api/products";
  return axios.get(URL_API, { params });
};

const getProductByIdApi = (id) => {
  const URL_API = `/v1/api/products/${id}`;
  return axios.get(URL_API);
};

// Categories API functions
const getCategoriesApi = () => {
  const URL_API = "/v1/api/categories";
  return axios.get(URL_API);
};

const getCategoryByIdApi = (id) => {
  const URL_API = `/v1/api/categories/${id}`;
  return axios.get(URL_API);
};

// Fuzzy Search API functions
const fuzzySearchProductsApi = (params = {}) => {
  const URL_API = "/v1/api/products/fuzzy-search";
  return axios.get(URL_API, { 
    params,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

const getSearchSuggestionsApi = (params = {}) => {
  const URL_API = "/v1/api/products/search-suggestions";
  return axios.get(URL_API, { 
    params,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

// Increment product view count API
const incrementProductViewApi = (productId) => {
  const URL_API = `/v1/api/products/${productId}/increment-view`;
  return axios.post(URL_API);
};

// Favorite Products API functions
const addToFavoritesApi = (productId) => {
  const URL_API = "/v1/api/favorites";
  const data = { productId };
  return axios.post(URL_API, data);
};

const removeFromFavoritesApi = (productId) => {
  const URL_API = `/v1/api/favorites/${productId}`;
  return axios.delete(URL_API);
};

const getFavoritesApi = (params = {}) => {
  const URL_API = "/v1/api/favorites";
  return axios.get(URL_API, { params });
};

const checkFavoriteStatusApi = (productId) => {
  const URL_API = `/v1/api/favorites/check/${productId}`;
  return axios.get(URL_API);
};

const getFavoritesCountApi = () => {
  const URL_API = "/v1/api/favorites/count";
  return axios.get(URL_API);
};

const clearAllFavoritesApi = () => {
  const URL_API = "/v1/api/favorites/clear";
  return axios.delete(URL_API);
};

// Viewed Products API functions
const addToViewedProductsApi = (productId) => {
  const URL_API = "/v1/api/viewed-products";
  const data = { productId };
  return axios.post(URL_API, data);
};

const getViewedProductsApi = (params = {}) => {
  const URL_API = "/v1/api/viewed-products";
  return axios.get(URL_API, { params });
};

const getGuestViewedProductsApi = (params = {}) => {
  const URL_API = "/v1/api/viewed-products/guest";
  return axios.get(URL_API, { params });
};

const clearViewedHistoryApi = () => {
  const URL_API = "/v1/api/viewed-products";
  return axios.delete(URL_API);
};

const getViewedStatisticsApi = () => {
  const URL_API = "/v1/api/viewed-products/statistics";
  return axios.get(URL_API);
};

const getMostViewedProductsApi = (params = {}) => {
  const URL_API = "/v1/api/viewed-products/most-viewed";
  return axios.get(URL_API, { params });
};

// Similar Products API functions
const getSimilarProductsApi = (productId, params = {}) => {
  const URL_API = `/v1/api/products/${productId}/similar`;
  return axios.get(URL_API, { 
    params: {
      ...params,
      _t: Date.now() // Add timestamp to prevent caching
    },
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
};

// Product Statistics API functions
const getProductStatsApi = (productId) => {
  const URL_API = `/v1/api/products/${productId}/stats`;
  return axios.get(URL_API);
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi, 
  sendOTPApi, 
  verifyOTPApi, 
  resendOTPApi, 
  checkEmailVerificationApi,
  testConnectionApi,
  getProductsApi,
  getProductByIdApi,
  getCategoriesApi,
  getCategoryByIdApi,
  fuzzySearchProductsApi,
  getSearchSuggestionsApi,
  incrementProductViewApi,
  // Favorite Products APIs
  addToFavoritesApi,
  removeFromFavoritesApi,
  getFavoritesApi,
  checkFavoriteStatusApi,
  getFavoritesCountApi,
  clearAllFavoritesApi,
  // Viewed Products APIs
  addToViewedProductsApi,
  getViewedProductsApi,
  getGuestViewedProductsApi,
  clearViewedHistoryApi,
  getViewedStatisticsApi,
  getMostViewedProductsApi,
  // Similar Products APIs
  getSimilarProductsApi,
  // Product Statistics APIs
  getProductStatsApi
};

// Default export cho backward compatibility
const api = {
  createUserApi,
  loginApi,
  getUserApi,
  sendOTPApi,
  verifyOTPApi,
  resendOTPApi,
  checkEmailVerificationApi,
  testConnectionApi,
  getProductsApi,
  getProductByIdApi,
  getCategoriesApi,
  getCategoryByIdApi,
  fuzzySearchProductsApi,
  getSearchSuggestionsApi,
  incrementProductViewApi,
  // Favorite Products APIs
  addToFavoritesApi,
  removeFromFavoritesApi,
  getFavoritesApi,
  checkFavoriteStatusApi,
  getFavoritesCountApi,
  clearAllFavoritesApi,
  // Viewed Products APIs
  addToViewedProductsApi,
  getViewedProductsApi,
  getGuestViewedProductsApi,
  clearViewedHistoryApi,
  getViewedStatisticsApi,
  getMostViewedProductsApi,
  // Similar Products APIs
  getSimilarProductsApi,
  // Product Statistics APIs
  getProductStatsApi
};

export default api;








