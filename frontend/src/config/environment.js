// Environment Configuration
const config = {
    development: {
        apiBaseURL: 'http://localhost:5000',
        timeout: 10000,
    },
    production: {
        apiBaseURL: 'https://swagat-odisha-backend.onrender.com',
        timeout: 30000, // Longer timeout for production
    },
};

// Get current environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const currentConfig = isDevelopment ? config.development : config.production;

export const API_BASE_URL = currentConfig.apiBaseURL;
export const API_TIMEOUT = currentConfig.timeout;
export const IS_DEVELOPMENT = isDevelopment;

// Log configuration in development
if (IS_DEVELOPMENT) {
    console.log('🔧 Environment:', IS_DEVELOPMENT ? 'Development' : 'Production');
    console.log('📍 API Base URL:', API_BASE_URL);
}
