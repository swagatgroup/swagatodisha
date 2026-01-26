import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, IS_DEVELOPMENT } from '../config/environment';

// Log API configuration in development
if (IS_DEVELOPMENT) {
    console.log('🌐 API Configuration:', {
        baseURL: API_BASE_URL || '(empty - using relative URLs)',
        timeout: API_TIMEOUT
    });
}

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
        console.log('🌐 API Error - URL:', error.config?.url, 'Status:', error.response?.status);
        console.log('🌐 API Error - Message:', error.response?.data?.message || error.message);
        
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