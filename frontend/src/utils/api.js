// API Configuration for Swagat Odisha
const API_CONFIG = {
    // Development
    development: {
        baseURL: 'http://localhost:5000',
        timeout: 10000
    },
    // Production (Render)
    production: {
        baseURL: 'https://swagat-odisha-backend.onrender.com',
        timeout: 30000
    }
};

// Get current environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: `${currentConfig.baseURL}/api/auth/login`,
        REGISTER: `${currentConfig.baseURL}/api/auth/register`,
        ME: `${currentConfig.baseURL}/api/auth/me`,
        LOGOUT: `${currentConfig.baseURL}/api/auth/logout`,
        CHANGE_PASSWORD: `${currentConfig.baseURL}/api/auth/change-password`,
        FORGOT_PASSWORD: `${currentConfig.baseURL}/api/auth/forgot-password`,
        RESET_PASSWORD: `${currentConfig.baseURL}/api/auth/reset-password`
    },
    // Student endpoints
    STUDENTS: {
        LIST: `${currentConfig.baseURL}/api/students`,
        CREATE: `${currentConfig.baseURL}/api/students`,
        GET_BY_ID: (id) => `${currentConfig.baseURL}/api/students/${id}`,
        UPDATE: (id) => `${currentConfig.baseURL}/api/students/${id}`,
        DELETE: (id) => `${currentConfig.baseURL}/api/students/${id}`,
        STATS: `${currentConfig.baseURL}/api/students/stats`,
        BY_AGENT: (agentId) => `${currentConfig.baseURL}/api/students/agent/${agentId}`
    },
    // Health check
    HEALTH: `${currentConfig.baseURL}/health`
};

// Axios configuration
export const axiosConfig = {
    baseURL: currentConfig.baseURL,
    timeout: currentConfig.timeout,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Environment info for debugging
export const API_INFO = {
    environment: isDevelopment ? 'development' : 'production',
    baseURL: currentConfig.baseURL,
    isDevelopment,
    config: currentConfig
};

// Log API configuration (only in development)
if (isDevelopment) {
    console.log('🔧 API Configuration:', API_INFO);
    console.log('📍 API Endpoints:', API_ENDPOINTS);
}

export default API_ENDPOINTS;
