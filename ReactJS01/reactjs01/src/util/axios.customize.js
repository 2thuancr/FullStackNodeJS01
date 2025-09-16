import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888'
});

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    // Thêm Authorization header cho các API cần authentication
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    
    // Các API cần authentication (không bao gồm public APIs)
    const publicApis = ['/register', '/login', '/forgot-password', '/verify-otp', '/send-otp', '/resend-otp', '/check-email-verification', '/test'];
    const isPublicApi = publicApis.some(api => config.url.includes(api));
    
    if (token && !isPublicApi) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding token to request:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else if (!token && !isPublicApi) {
        console.warn('No token found for protected API:', config.url);
    } else if (isPublicApi) {
        console.log('Public API, no token needed:', config.url);
    }
    
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response; // Trả về toàn bộ response object
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
        console.error('Unauthorized access. Token may be invalid or expired.');
        
        // Xóa token cũ và redirect về login
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        
        // Chỉ redirect nếu không phải trang login
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }
    
    return Promise.reject(error);
});

export default instance;
