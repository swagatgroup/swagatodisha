import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, IS_DEVELOPMENT } from '../config/environment';

// Log API configuration (both dev and prod for debugging)
console.log('🌐 API Configuration:', {
    baseURL: API_BASE_URL || '(empty - using relative URLs)',
    timeout: API_TIMEOUT,
    isDevelopment: IS_DEVELOPMENT,
    fullURL: API_BASE_URL ? `${API_BASE_URL}/api/contact/submit` : '/api/contact/submit'
});

// API Configuration
const api = axios.create({
    baseURL: API_BASE_URL || '',
    timeout: API_TIMEOUT || 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🌐 API Request - URL:', config.url);
        console.log('🌐 API Request - Token:', token ? 'Present' : 'Missing');
        
        // If the data is FormData, don't set Content-Type - let browser set it with boundary
        if (config.data instanceof FormData) {
            // Remove Content-Type header to let browser set it automatically with boundary
            delete config.headers['Content-Type'];
            console.log('🌐 API Request - FormData detected, letting browser set Content-Type');
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🌐 API Request - Authorization header set');
        } else {
            console.log('🌐 API Request - No token, no Authorization header');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('🌐 API Response - URL:', response.config.url, 'Status:', response.status);
        return response;
    },
    (error) => {
        const fullURL = error.config?.baseURL 
            ? `${error.config.baseURL}${error.config.url}` 
            : error.config?.url || 'unknown';
        
        console.log('🌐 API Error - URL:', error.config?.url);
        console.log('🌐 API Error - Full URL:', fullURL);
        console.log('🌐 API Error - Base URL:', error.config?.baseURL || '(empty - relative)');
        console.log('🌐 API Error - Status:', error.response?.status || 'No response');
        console.log('🌐 API Error - Message:', error.response?.data?.message || error.message);
        console.log('🌐 API Error - Code:', error.code);
        console.log('🌐 API Error - Request made:', !!error.request);
        console.log('🌐 API Error - Response received:', !!error.response);
        
        // Handle network errors (common in production)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
            console.error('🌐 Network Error - Possible causes:', {
                baseURL: error.config?.baseURL || '(not set - check VITE_API_BASE_URL)',
                url: error.config?.url,
                message: 'Check if backend is accessible and CORS is configured correctly'
            });
        }
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.log('🌐 API Error - 401 Unauthorized, clearing token');
            // Only redirect if we're not already on login/register pages to avoid infinite loops
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';

            // Clear invalid token
            localStorage.removeItem('token');

            // Only redirect if not already on an auth page
            if (!isAuthPage) {
                window.location.href = '/login';
            }
        }

        // Handle other error types
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
        } else if (error.response?.status >= 500) {
            console.error('Server error occurred');
        }

        return Promise.reject(error);
    }
);

export default api;