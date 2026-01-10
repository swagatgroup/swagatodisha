/**
 * Session Helper Utility
 * Handles academic session date range calculations
 * Sessions are in format: "2025-26" (academic year starting April 2025, ending March 2026)
 */

/**
 * Get date range for an academic session
 * @param {string} session - Session string in format "2025-26" or "2024-25"
 * @returns {Object} - { startDate: Date, endDate: Date }
 */
const getSessionDateRange = (session) => {
    if (!session || typeof session !== 'string') {
        // Default to current academic year if invalid
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth(); // 0-11

        // If month is Jan-Mar, session is previous year-current year
        // If month is Apr-Dec, session is current year-next year
        if (month < 3) {
            // Jan-Mar: session is (currentYear-1)-(currentYear)
            return {
                startDate: new Date(currentYear - 1, 3, 1), // April 1, previous year
                endDate: new Date(currentYear, 2, 31, 23, 59, 59, 999) // March 31, current year
            };
        } else {
            // Apr-Dec: session is currentYear-(currentYear+1)
            return {
                startDate: new Date(currentYear, 3, 1), // April 1, current year
                endDate: new Date(currentYear + 1, 2, 31, 23, 59, 59, 999) // March 31, next year
            };
        }
    }

    // Parse session string like "2025-26" or "25-26" (supports both formats)
    const parts = session.split('-');
    if (parts.length !== 2) {
        throw new Error(`Invalid session format: ${session}. Expected format: "YYYY-YY" or "YY-YY"`);
    }

    let startYear = parseInt(parts[0], 10);
    const endYearShort = parseInt(parts[1], 10);

    // Handle 2-digit year format (e.g., "26-27" -> "2026-27")
    // For academic sessions in 2000s, convert 2-digit to 4-digit
    if (startYear < 100) {
        // Convert 2-digit to 4-digit year
        // Assume years 00-99 are 2000-2099 for academic sessions
        startYear = 2000 + startYear;
    }

    // Calculate full end year
    // For academic sessions, end year is always start year + 1
    // If endYearShort was provided (2-digit), it should match (startYear + 1) % 100
    // But we'll just calculate it as startYear + 1 for consistency
    let endYear = startYear + 1;
    
    // Validate that the provided endYearShort matches our calculated endYear (if it was 2-digit)
    if (endYearShort < 100) {
        const expectedEndYearShort = endYear % 100;
        if (endYearShort !== expectedEndYearShort) {
            throw new Error(`Invalid session: end year "${endYearShort}" does not match start year "${parts[0]}" (expected "${expectedEndYearShort}"). Got: ${session}`);
        }
    } else {
        // If endYearShort is 4-digit, use it directly but validate
        endYear = endYearShort;
    }

    // Validate years
    if (isNaN(startYear) || isNaN(endYear) || startYear < 2000 || endYear > 2100) {
        throw new Error(`Invalid session years: ${session}`);
    }

    // Validate that end year is one more than start year
    if (endYear !== startYear + 1) {
        throw new Error(`Invalid session: end year must be start year + 1. Got: ${session} (startYear: ${startYear}, endYear: ${endYear})`);
    }

    return {
        startDate: new Date(startYear, 3, 1, 0, 0, 0, 0), // April 1, start year
        endDate: new Date(endYear, 2, 31, 23, 59, 59, 999) // March 31, end year
    };
};

/**
 * Get current academic session
 * @returns {string} - Current session in format "YYYY-YY"
 */
const getCurrentSession = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth(); // 0-11

    if (month < 3) {
        // Jan-Mar: session is (currentYear-1)-(currentYear)
        const startYear = currentYear - 1;
        const endYearShort = currentYear.toString().slice(-2);
        return `${startYear}-${endYearShort}`;
    } else {
        // Apr-Dec: session is currentYear-(currentYear+1)
        const endYearShort = (currentYear + 1).toString().slice(-2);
        return `${currentYear}-${endYearShort}`;
    }
};

/**
 * Get list of available sessions (default: last 5 years including current, plus 2 years forward)
 * @param {number} yearsBack - Number of years to go back (default: 5)
 * @param {number} yearsForward - Number of years to go forward (default: 2)
 * @returns {Array<string>} - Array of session strings
 */
const getAvailableSessions = (yearsBack = 5, yearsForward = 2) => {
    const currentSession = getCurrentSession();
    const currentStartYear = parseInt(currentSession.split('-')[0], 10);
    const sessions = [];

    // Add future sessions first (newest first)
    for (let i = yearsForward; i > 0; i--) {
        const startYear = currentStartYear + i;
        const endYearShort = (startYear + 1).toString().slice(-2);
        sessions.push(`${startYear}-${endYearShort}`);
    }

    // Add current and past sessions
    for (let i = 0; i < yearsBack; i++) {
        const startYear = currentStartYear - i;
        const endYearShort = (startYear + 1).toString().slice(-2);
        sessions.push(`${startYear}-${endYearShort}`);
    }

    return sessions;
};

module.exports = {
    getSessionDateRange,
    getCurrentSession,
    getAvailableSessions
};

