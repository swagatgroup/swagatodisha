import { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    // Generate current session
    const getCurrentSession = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth();
        if (month < 3) {
            const startYear = currentYear - 1;
            const endYearShort = currentYear.toString().slice(-2);
            return `${startYear}-${endYearShort}`;
        } else {
            const endYearShort = (currentYear + 1).toString().slice(-2);
            return `${currentYear}-${endYearShort}`;
        }
    };

    // Generate available sessions (current year and last 5 years)
    const getAvailableSessions = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth();
        const sessions = [];

        // Determine current session
        let currentStartYear;
        if (month < 3) {
            currentStartYear = currentYear - 1;
        } else {
            currentStartYear = currentYear;
        }

        // Generate last 6 sessions
        for (let i = 0; i < 6; i++) {
            const startYear = currentStartYear - i;
            const endYearShort = (startYear + 1).toString().slice(-2);
            sessions.push(`${startYear}-${endYearShort}`);
        }

        return sessions;
    };

    const [selectedSession, setSelectedSession] = useState(getCurrentSession());
    const availableSessions = getAvailableSessions();

    const value = {
        selectedSession,
        setSelectedSession,
        availableSessions,
        getCurrentSession
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

