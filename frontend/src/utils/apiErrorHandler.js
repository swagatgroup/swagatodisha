/**
 * Enhanced API Error Handler for Swagat Odisha
 * Handles CORS, rate limiting, and network errors gracefully
 */

const API_BASE_URL = 'https://swagat-odisha-backend.onrender.com';

class APIError extends Error {
    constructor(message, status, type) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.type = type;
    }
}

export const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Handle different status codes
        if (!response.ok) {
            let errorMessage = 'An error occurred';
            let errorType = 'unknown';

            switch (response.status) {
                case 429:
                    errorMessage = 'Too many requests. Please try again in a few minutes.';
                    errorType = 'rate_limit';
                    break;
                case 401:
                    errorMessage = 'Authentication failed. Please check your credentials.';
                    errorType = 'auth';
                    break;
                case 403:
                    errorMessage = 'Access denied. You do not have permission to perform this action.';
                    errorType = 'permission';
                    break;
                case 404:
                    errorMessage = 'The requested resource was not found.';
                    errorType = 'not_found';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    errorType = 'server';
                    break;
                default:
                    errorMessage = `Server error: ${response.status}`;
                    errorType = 'server';
            }

            throw new APIError(errorMessage, response.status, errorType);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true, data: await response.text() };
        }

    } catch (error) {
        console.error('❌ API Error:', error);

        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new APIError(
                'Network error. Please check your connection and try again.',
                0,
                'network'
            );
        }

        // Handle CORS errors
        if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
            throw new APIError(
                'Connection blocked. Please try refreshing the page.',
                0,
                'cors'
            );
        }

        // Re-throw API errors
        if (error instanceof APIError) {
            throw error;
        }

        // Handle other errors
        throw new APIError(
            error.message || 'An unexpected error occurred',
            0,
            'unknown'
        );
    }
};

// Specific API methods
export const api = {
    get: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, data, options = {}) => apiCall(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    }),
    put: (endpoint, data, options = {}) => apiCall(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'DELETE' })
};

// Error handler for UI
export const handleAPIError = (error, showAlert = true) => {
    console.error('API Error Handler:', error);

    let userMessage = 'An error occurred. Please try again.';
    let shouldRetry = false;

    if (error instanceof APIError) {
        switch (error.type) {
            case 'rate_limit':
                userMessage = 'Too many requests. Please wait a moment and try again.';
                shouldRetry = true;
                break;
            case 'network':
                userMessage = 'Connection problem. Please check your internet and try again.';
                shouldRetry = true;
                break;
            case 'cors':
                userMessage = 'Connection blocked. Please refresh the page and try again.';
                shouldRetry = true;
                break;
            case 'auth':
                userMessage = 'Please check your login credentials and try again.';
                break;
            case 'permission':
                userMessage = 'You do not have permission to perform this action.';
                break;
            case 'server':
                userMessage = 'Server error. Please try again in a few minutes.';
                shouldRetry = true;
                break;
            default:
                userMessage = error.message || 'An unexpected error occurred.';
        }
    }

    if (showAlert) {
        // You can replace this with your preferred notification system
        alert(userMessage);
    }

    return {
        message: userMessage,
        shouldRetry,
        error
    };
};

export default api;
