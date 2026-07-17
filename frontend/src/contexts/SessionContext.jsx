import { createContext, useContext, useState, useEffect } from 'react';

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
        // As requested by the client, always start from 26-27
        return '2026-27';
    };

    // Generate available sessions
    const getAvailableSessions = () => {
        // As requested by the client, no dynamic logic - hardcoded to start from 26-27 and 4 years onward
        return [
            '2029-30',
            '2028-29',
            '2027-28',
            '2026-27'
        ];
    };

    // Load session from localStorage or use current session
    const loadSession = () => {
        const savedSession = localStorage.getItem('selectedSession');
        if (savedSession) {
            return savedSession;
        }
        return getCurrentSession();
    };

    const [selectedSession, setSelectedSession] = useState(loadSession);
    const availableSessions = getAvailableSessions();

    // Persist session to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('selectedSession', selectedSession);
    }, [selectedSession]);

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

