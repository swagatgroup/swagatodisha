/**
 * Utility functions for handling image URLs
 * Handles Cloudinary URLs, local paths, and relative paths consistently
 */

/**
 * Normalizes an image URL to ensure it's properly formatted
 * @param {string} imageUrl - The image URL from the database
 * @param {string} basePath - Optional base path for relative URLs (default: '/api')
 * @returns {string} - Properly formatted image URL
 */
export const normalizeImageUrl = (imageUrl, basePath = '/api') => {
    if (!imageUrl) {
        return '';
    }

    // Trim whitespace
    const url = String(imageUrl).trim();

    // If it's already a full URL (Cloudinary or external), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's an absolute path, return as-is
    if (url.startsWith('/')) {
        return url;
    }

    // Otherwise, it's a relative path - prepend base path
    return `${basePath}${url}`;
};

/**
 * Checks if an image URL is a Cloudinary URL
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (imageUrl) => {
    if (!imageUrl) return false;
    return imageUrl.includes('cloudinary.com') || 
           imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
};

/**
 * Gets the image source URL, handling all URL types
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The properly formatted image source URL
 */
export const getImageSrc = (imageUrl) => {
    return normalizeImageUrl(imageUrl);
};

