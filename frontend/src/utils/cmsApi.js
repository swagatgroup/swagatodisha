import api from './api';

// Website Content API
export const websiteContentApi = {
    // Get website content
    getContent: () => api.get('/api/website-content'),

    // Update website content
    updateContent: (data) => api.put('/api/website-content', data),

    // Update specific section
    updateSection: (section, data) => api.put(`/api/website-content/${section}`, data),

    // Reset to defaults
    resetToDefaults: () => api.post('/api/website-content/reset')
};

// Course Management API
export const courseApi = {
    // Get all courses
    getCourses: (params = {}) => api.get('/api/courses', { params }),

    // Get course by ID
    getCourseById: (courseId) => api.get(`/api/courses/${courseId}`),

    // Create course
    createCourse: (data) => api.post('/api/courses', data),

    // Update course
    updateCourse: (courseId, data) => api.put(`/api/courses/${courseId}`, data),

    // Delete course
    deleteCourse: (courseId) => api.delete(`/api/courses/${courseId}`),

    // Update course status
    updateCourseStatus: (courseId, data) => api.put(`/api/courses/${courseId}/status`, data),

    // Get courses by institution type
    getCoursesByInstitutionType: (institutionType) => api.get(`/api/courses/institution-type/${institutionType}`),

    // Get featured courses
    getFeaturedCourses: () => api.get('/api/courses/featured'),

    // Get popular courses
    getPopularCourses: () => api.get('/api/courses/popular'),

    // Get course statistics
    getCourseStats: () => api.get('/api/courses/stats')
};

// Notification Management API
export const notificationApi = {
    // Get all notifications
    getNotifications: (params = {}) => api.get('/api/notifications', { params }),

    // Get notification by ID
    getNotificationById: (notificationId) => api.get(`/api/notifications/${notificationId}`),

    // Create notification
    createNotification: (data) => api.post('/api/notifications', data),

    // Update notification
    updateNotification: (notificationId, data) => api.put(`/api/notifications/${notificationId}`, data),

    // Delete notification
    deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}`),

    // Update notification status
    updateNotificationStatus: (notificationId, data) => api.put(`/api/notifications/${notificationId}/status`, data),

    // Get public notifications
    getPublicNotifications: (params = {}) => api.get('/api/notifications/public', { params }),

    // Get notification statistics
    getNotificationStats: () => api.get('/api/notifications/stats'),

    // Increment click count
    incrementClickCount: (notificationId) => api.post(`/api/notifications/${notificationId}/click`)
};

// Gallery Management API
export const galleryApi = {
    // Get all gallery items
    getGalleryItems: (params = {}) => api.get('/api/gallery', { params }),

    // Get gallery item by ID
    getGalleryItemById: (itemId) => api.get(`/api/gallery/${itemId}`),

    // Create gallery item
    createGalleryItem: (data) => api.post('/api/gallery', data),

    // Update gallery item
    updateGalleryItem: (itemId, data) => api.put(`/api/gallery/${itemId}`, data),

    // Delete gallery item
    deleteGalleryItem: (itemId) => api.delete(`/api/gallery/${itemId}`),

    // Get public gallery items
    getPublicGalleryItems: (params = {}) => api.get('/api/gallery/public', { params }),

    // Get gallery items by category
    getGalleryItemsByCategory: (category, params = {}) => api.get(`/api/gallery/category/${category}`, { params }),

    // Get featured gallery items
    getFeaturedGalleryItems: (params = {}) => api.get('/api/gallery/featured', { params }),

    // Get gallery statistics
    getGalleryStats: () => api.get('/api/gallery/stats'),

    // Increment download count
    incrementDownloadCount: (itemId) => api.post(`/api/gallery/${itemId}/download`)
};

// Institution Management API
export const institutionApi = {
    // Get all institutions
    getInstitutions: (params = {}) => api.get('/api/institutions', { params }),

    // Get institution by ID
    getInstitutionById: (institutionId) => api.get(`/api/institutions/${institutionId}`),

    // Create institution
    createInstitution: (data) => api.post('/api/institutions', data),

    // Update institution
    updateInstitution: (institutionId, data) => api.put(`/api/institutions/${institutionId}`, data),

    // Delete institution
    deleteInstitution: (institutionId) => api.delete(`/api/institutions/${institutionId}`),

    // Get institutions by type
    getInstitutionsByType: (type) => api.get(`/api/institutions/type/${type}`),

    // Get institution statistics
    getInstitutionStats: () => api.get('/api/institutions/stats')
};

// QR Code Management API
export const qrCodeApi = {
    // Get all QR codes
    getQRCodes: (params = {}) => api.get('/api/qr-codes', { params }),

    // Get QR code by ID
    getQRCodeById: (qrCodeId) => api.get(`/api/qr-codes/${qrCodeId}`),

    // Create QR code
    createQRCode: (data) => api.post('/api/qr-codes', data),

    // Update QR code
    updateQRCode: (qrCodeId, data) => api.put(`/api/qr-codes/${qrCodeId}`, data),

    // Delete QR code
    deleteQRCode: (qrCodeId) => api.delete(`/api/qr-codes/${qrCodeId}`),

    // Get QR code statistics
    getQRCodeStats: () => api.get('/api/qr-codes/stats'),

    // Increment scan count
    incrementScanCount: (qrCodeId) => api.post(`/api/qr-codes/${qrCodeId}/scan`)
};

// Combined CMS API
export const cmsApi = {
    websiteContent: websiteContentApi,
    courses: courseApi,
    notifications: notificationApi,
    gallery: galleryApi,
    institutions: institutionApi,
    qrCodes: qrCodeApi
};

export default cmsApi;
