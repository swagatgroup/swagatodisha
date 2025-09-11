import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/environment';

// API Configuration
const api = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:3000/',
    timeout: API_TIMEOUT || 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Only redirect if we're not already on login/register pages to avoid infinite loops
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';

            // Clear invalid token
            localStorage.removeItem('token');

            // Only redirect if not already on an auth page
            if (!isAuthPage) {
                console.log('Token expired or invalid, redirecting to login');
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