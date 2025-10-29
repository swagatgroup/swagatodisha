import { API_BASE_URL } from '../config/environment';

/**
 * Gets the effective backend URL for API calls
 * @returns {string} - The backend base URL
 */
const getEffectiveBackendUrl = () => {
    // If API_BASE_URL is explicitly set (production), use it
    if (API_BASE_URL && API_BASE_URL !== '') {
        return API_BASE_URL;
    }
    
    // In development with Vite proxy, use empty string or current origin
    // This allows the proxy to work correctly
    if (import.meta.env.DEV) {
        return '';
    }
    
    // Fallback to current origin
    return window.location.origin;
};

/**
 * Converts a document path to a full URL
 * @param {string} path - The document path (can be relative or absolute)
 * @returns {string} - The full document URL
 */
export const getDocumentUrl = (path) => {
    if (!path) {
        console.warn('getDocumentUrl: No path provided');
        return '';
    }
    
    // If it's already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // Get the effective backend URL
    const baseUrl = getEffectiveBackendUrl();
    
    // If it's a relative path starting with /, prepend the backend URL
    if (path.startsWith('/')) {
        // In development with empty baseUrl, return the path as-is for proxy to handle
        if (baseUrl === '') {
            return path;
        }
        return `${baseUrl}${path}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the backend URL
    if (baseUrl === '') {
        return `/${path}`;
    }
    return `${baseUrl}/${path}`;
};

/**
 * Gets the backend base URL for document access
 * @returns {string} - The backend base URL
 */
export const getBackendUrl = () => {
    return API_BASE_URL || window.location.origin;
};

/**
 * Checks if a document URL is accessible
 * @param {string} url - The document URL to check
 * @returns {Promise<boolean>} - True if accessible, false otherwise
 */
export const checkDocumentAccess = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Document access check failed:', error);
        return false;
    }
};

/**
 * Formats document data for display
 * @param {object} document - The document object
 * @returns {object} - Formatted document with full URL
 */
export const formatDocumentForDisplay = (document) => {
    if (!document) return null;
    
    return {
        ...document,
        displayUrl: getDocumentUrl(document.filePath || document.url),
        originalPath: document.filePath || document.url
    };
};

/**
 * Batch formats multiple documents
 * @param {array} documents - Array of document objects
 * @returns {array} - Array of formatted documents
 */
export const formatDocumentsForDisplay = (documents) => {
    if (!Array.isArray(documents)) return [];
    return documents.map(formatDocumentForDisplay).filter(Boolean);
};

