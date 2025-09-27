// Date utility functions

// Convert ISO date string to yyyy-MM-dd format for date inputs
export const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        return date.toISOString().split('T')[0];
    } catch (error) {
        console.warn('Error formatting date for input:', error);
        return '';
    }
};

// Convert date input value to ISO string
export const formatDateFromInput = (dateInputValue) => {
    if (!dateInputValue) return '';

    try {
        const date = new Date(dateInputValue);
        if (isNaN(date.getTime())) return '';

        return date.toISOString();
    } catch (error) {
        console.warn('Error formatting date from input:', error);
        return '';
    }
};

// Validate date format
export const isValidDate = (dateString) => {
    if (!dateString) return false;

    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
};

// Get current date in yyyy-MM-dd format
export const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Get date N years ago in yyyy-MM-dd format
export const getDateYearsAgo = (years) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split('T')[0];
};
