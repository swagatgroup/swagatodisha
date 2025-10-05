// Environment Configuration
const config = {
    development: {
        apiBaseURL: '', // Use relative URLs for Vite proxy
        timeout: 10000,
    },
    production: {
        apiBaseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 60000, // 60 seconds timeout for production
    },
};

// Get current environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const currentConfig = isDevelopment ? config.development : config.production;

export const API_BASE_URL = currentConfig.apiBaseURL;
export const API_TIMEOUT = currentConfig.timeout;
export const IS_DEVELOPMENT = isDevelopment;

// Configuration loaded
