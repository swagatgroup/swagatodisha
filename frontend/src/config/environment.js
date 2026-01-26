// Environment Configuration
const config = {
    development: {
        apiBaseURL: '', // Use relative URLs for Vite proxy
        timeout: 10000,
    },
    production: {
        // Use VITE_API_BASE_URL if set, otherwise fallback to known production backend
        apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'https://swagat-odisha-backend.onrender.com',
        timeout: 60000, // 60 seconds timeout for production
    },
};

// Get current environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const currentConfig = isDevelopment ? config.development : config.production;

// Final API base URL with fallback
export const API_BASE_URL = currentConfig.apiBaseURL || '';
export const API_TIMEOUT = currentConfig.timeout;
export const IS_DEVELOPMENT = isDevelopment;

// Log configuration in production for debugging
if (!isDevelopment) {
    console.log('🌐 Production API Configuration:', {
        apiBaseURL: API_BASE_URL || '(empty - will use relative URLs)',
        timeout: API_TIMEOUT,
        envVar: import.meta.env.VITE_API_BASE_URL || '(not set)'
    });
}

// Configuration loaded
