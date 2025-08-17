// Format number with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Capitalize first letter
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

// Check if element is in viewport
export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect()
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

// Smooth scroll to element
export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })
    }
}

// Get CSS variable value
export const getCSSVariable = (variableName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName)
}

// Set CSS variable value
export const setCSSVariable = (variableName, value) => {
    document.documentElement.style.setProperty(variableName, value)
}

// Format date
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    }
    return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

// Check if device is mobile
export const isMobile = () => {
    return window.innerWidth <= 768
}

// Check if device is touch
export const isTouch = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Helper functions for the application

/**
 * Scroll to a specific section by ID
 * @param {string} sectionId - The ID of the section to scroll to
 */
export const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }
}

/**
 * Scroll to contact form
 */
export const scrollToContact = () => {
    scrollToSection('contact')
}

/**
 * Scroll to admissions section
 */
export const scrollToAdmissions = () => {
    scrollToSection('admissions')
}

/**
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3')
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Show success message using SweetAlert
 * @param {string} title - Success title
 * @param {string} message - Success message
 */
export const showSuccessMessage = (title, message) => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonColor: '#8B5CF6',
            confirmButtonText: 'Great!'
        })
    }
}

/**
 * Show error message using SweetAlert
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
export const showErrorMessage = (title, message) => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#8B5CF6'
        })
    }
}
