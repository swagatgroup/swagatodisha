import Swal from 'sweetalert2';

// Custom SweetAlert configurations
const defaultConfig = {
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#ef4444',
    denyButtonColor: '#6b7280',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    denyButtonText: 'No',
    allowOutsideClick: false,
    allowEscapeKey: true,
    showCloseButton: true,
    showConfirmButton: true,
    showCancelButton: false,
    showDenyButton: false,
    timer: null,
    timerProgressBar: false,
    backdrop: true,
    focusConfirm: true,
    reverseButtons: false,
    heightAuto: true,
    width: 'auto',
    padding: '2rem',
    customClass: {
        popup: 'rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        title: 'text-xl font-semibold text-gray-900 dark:text-gray-100',
        content: 'text-gray-700 dark:text-gray-300',
        confirmButton: 'px-6 py-2 rounded-md font-medium transition-colors duration-200 bg-purple-600 hover:bg-purple-700 text-white',
        cancelButton: 'px-6 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white',
        denyButton: 'px-6 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white',
        closeButton: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200'
    }
};

// Success alerts
export const showSuccess = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'success',
        title,
        text,
        ...options
    });
};

// Error alerts
export const showError = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title,
        text,
        ...options
    });
};

// Warning alerts
export const showWarning = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title,
        text,
        ...options
    });
};

// Info alerts
export const showInfo = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'info',
        title,
        text,
        ...options
    });
};

// Question alerts
export const showQuestion = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'question',
        title,
        text,
        ...options
    });
};

// Loading alerts
export const showLoading = (title = 'Loading...', text = 'Please wait', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        showCancelButton: false,
        showDenyButton: false,
        showCloseButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        ...options
    });
};

// Close loading
export const closeLoading = () => {
    Swal.close();
};

// Confirmation dialogs
export const showConfirm = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        showDenyButton: false,
        confirmButtonText: options.confirmButtonText || 'Yes',
        cancelButtonText: options.cancelButtonText || 'No',
        ...options
    });
};

// Delete confirmation
export const showDeleteConfirm = (title = 'Are you sure?', text = 'This action cannot be undone!', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        showDenyButton: false,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        ...options
    });
};

// Form validation alerts
export const showValidationError = (errors) => {
    let errorMessage = 'Please fix the following errors:\n\n';
    if (Array.isArray(errors)) {
        errorMessage += errors.map(error => `• ${error}`).join('\n');
    } else if (typeof errors === 'object') {
        errorMessage += Object.entries(errors)
            .map(([field, message]) => `• ${field}: ${message}`)
            .join('\n');
    } else {
        errorMessage += errors;
    }

    return showError('Validation Error', errorMessage);
};

// File upload alerts
export const showFileUploadError = (error) => {
    let message = 'File upload failed. ';

    if (error.includes('size')) {
        message += 'File size must be less than 10MB.';
    } else if (error.includes('type')) {
        message += 'Please select a valid file type (PDF, JPEG, PNG, WebP).';
    } else if (error.includes('network')) {
        message += 'Network error. Please check your connection.';
    } else {
        message += 'Please try again.';
    }

    return showError('Upload Failed', message);
};

// Success with auto-close
export const showSuccessWithTimer = (title, text = '', timer = 3000) => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'success',
        title,
        text,
        timer,
        timerProgressBar: true,
        showConfirmButton: false
    });
};

// Custom HTML content
export const showCustomHTML = (title, html, options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        title,
        html,
        ...options
    });
};

// Input prompt
export const showInputPrompt = (title, text = '', inputType = 'text', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        title,
        text,
        input: inputType,
        inputPlaceholder: options.placeholder || 'Enter value',
        inputValidator: options.validator || ((value) => {
            if (!value) {
                return 'This field is required!';
            }
            return null;
        }),
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        ...options
    });
};

// File selection prompt
export const showFilePrompt = (title, text = '', options = {}) => {
    return Swal.fire({
        ...defaultConfig,
        title,
        text,
        input: 'file',
        inputAttributes: {
            accept: options.accept || '.pdf,.jpg,.jpeg,.png,.webp',
            'aria-label': 'Select file'
        },
        showCancelButton: true,
        confirmButtonText: 'Select',
        cancelButtonText: 'Cancel',
        ...options
    });
};

// Toast notifications
export const showToast = (type, title, text = '', timer = 3000) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon: type,
        title,
        text
    });
};

// Success toast
export const showSuccessToast = (title, text = '', timer = 3000) => {
    return showToast('success', title, text, timer);
};

// Error toast
export const showErrorToast = (title, text = '', timer = 3000) => {
    return showToast('error', title, text, timer);
};

// Warning toast
export const showWarningToast = (title, text = '', timer = 3000) => {
    return showToast('warning', title, text, timer);
};

// Info toast
export const showInfoToast = (title, text = '', timer = 3000) => {
    return showToast('info', title, text, timer);
};

// Progress bar
export const showProgress = (title, text = '') => {
    return Swal.fire({
        ...defaultConfig,
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        showCancelButton: false,
        showDenyButton: false,
        showCloseButton: false,
        html: `
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div id="progress-bar" class="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
            <div id="progress-text" class="text-sm text-gray-600 dark:text-gray-300">0%</div>
        `,
        didOpen: () => {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');

            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }, 200);
        }
    });
};

// Update progress
export const updateProgress = (progress) => {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }
};

// Close progress
export const closeProgress = () => {
    Swal.close();
};

// API error handler
export const handleApiError = (error) => {
    console.error('API Error:', error);

    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
            case 400:
                return showError('Bad Request', data.message || 'Invalid request data');
            case 401:
                return showError('Unauthorized', 'Please log in to continue');
            case 403:
                return showError('Forbidden', 'You do not have permission to perform this action');
            case 404:
                return showError('Not Found', 'The requested resource was not found');
            case 409:
                return showError('Conflict', data.message || 'Resource already exists');
            case 422:
                return showValidationError(data.errors || data.message);
            case 429:
                return showError('Too Many Requests', 'Please wait before trying again');
            case 500:
                return showError('Server Error', 'Something went wrong on our end. Please try again later');
            default:
                return showError('Error', data.message || 'An unexpected error occurred');
        }
    } else if (error.request) {
        // Network error
        return showError('Network Error', 'Please check your internet connection and try again');
    } else {
        // Other error
        return showError('Error', error.message || 'An unexpected error occurred');
    }
};

// Success handler
export const handleApiSuccess = (message, data = null) => {
    return showSuccess('Success!', message);
};

// Form submission handler
export const handleFormSubmission = async (submitFunction, successMessage = 'Operation completed successfully!') => {
    try {
        const result = showLoading('Processing...', 'Please wait while we process your request');

        const response = await submitFunction();

        closeLoading();

        if (response.success) {
            await showSuccess('Success!', successMessage);
            return response;
        } else {
            await showError('Error', response.message || 'Operation failed');
            return null;
        }
    } catch (error) {
        closeLoading();
        await handleApiError(error);
        return null;
    }
};

export default {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showQuestion,
    showLoading,
    closeLoading,
    showConfirm,
    showDeleteConfirm,
    showValidationError,
    showFileUploadError,
    showSuccessWithTimer,
    showCustomHTML,
    showInputPrompt,
    showFilePrompt,
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showProgress,
    updateProgress,
    closeProgress,
    handleApiError,
    handleApiSuccess,
    handleFormSubmission
};
