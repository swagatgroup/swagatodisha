import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, IS_DEVELOPMENT } from '../config/environment';

// Log API configuration (both dev and prod for debugging)
console.log('🌐 API Configuration:', {
    baseURL: API_BASE_URL || '(empty - using relative URLs)',
    timeout: API_TIMEOUT,
    isDevelopment: IS_DEVELOPMENT,
    fullURL: API_BASE_URL ? `${API_BASE_URL}/api/contact/submit` : '/api/contact/submit'
});

// ─── EXPLICIT LOGOUT FLAG ──────────────────────────────────────────────────────
// This flag is set by the Sign Out button handler BEFORE clearing auth data.
// When true, the 401 interceptor below skips its auto-logout logic because
// the user is already being navigated to /login-portal intentionally.
// Using a module-level variable here (instead of importing from AuthContext)
// to avoid circular dependency: api.js ← AuthContext.jsx ← api.js.
let _isExplicitLogout = false;
export function setExplicitLogout(val) { _isExplicitLogout = val; }
export function getExplicitLogout() { return _isExplicitLogout; }

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
        
        // If the data is FormData, don't set Content-Type - let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
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
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors (common in production)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
            console.error('🌐 Network Error:', error.config?.url);
        }
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.log('🌐 401 Unauthorized:', error.config?.url);

            // If the user explicitly clicked Sign Out, the clearAuthState() in the
            // button handler already wiped everything and window.location.replace()
            // is in progress. Skip — don't fight with the redirect.
            if (_isExplicitLogout) {
                console.log('🌐 Explicit logout in progress — skipping auto-logout');
                return Promise.reject(error);
            }

            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/login-portal' || currentPath === '/register';

            // Clear invalid token
            localStorage.removeItem('token');

            // Dispatch custom event so React (AuthContext) can handle it
            if (!isAuthPage) {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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