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
  return axios.get(URL_API, { params });
};

const getSearchSuggestionsApi = (params = {}) => {
  const URL_API = "/v1/api/products/search-suggestions";
  return axios.get(URL_API, { params });
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
  getSearchSuggestionsApi
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
  getSearchSuggestionsApi
};

export default api;




