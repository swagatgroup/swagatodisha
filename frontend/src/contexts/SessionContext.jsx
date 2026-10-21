import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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

    // Course filters (category / BOARD session / UNIVERSITY semester) live in the URL so a refresh keeps them.
    // Cascading: changing the category drops the session/semester of the other category.
    const [searchParams, setSearchParams] = useSearchParams();
    const courseCategory = ['BOARD', 'UNIVERSITY'].includes(searchParams.get('courseCategory')) ? searchParams.get('courseCategory') : 'ALL';
    const courseFilters = {
        courseCategory,
        courseSession: courseCategory === 'BOARD' ? (searchParams.get('courseSession') || '') : '',
        semester: courseCategory === 'UNIVERSITY' ? (searchParams.get('semester') || '') : ''
    };
    const setCourseFilters = (changes) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const merged = { ...courseFilters, ...changes };
            if ('courseCategory' in changes && changes.courseCategory !== courseFilters.courseCategory) {
                merged.courseSession = '';
                merged.semester = '';
            }
            next.delete('courseCategory');
            next.delete('courseSession');
            next.delete('semester');
            if (merged.courseCategory !== 'ALL') next.set('courseCategory', merged.courseCategory);
            if (merged.courseCategory === 'BOARD' && merged.courseSession) next.set('courseSession', merged.courseSession);
            if (merged.courseCategory === 'UNIVERSITY' && merged.semester) next.set('semester', merged.semester);
            return next;
        }, { replace: true });
    };
    const clearCourseFilters = () => setCourseFilters({ courseCategory: 'ALL' });
    // Only the active filters, ready to spread into request params
    const courseFilterParams = Object.fromEntries(Object.entries(courseFilters).filter(([k, v]) => v && !(k === 'courseCategory' && v === 'ALL')));
    // Stable key for effect dependencies
    const courseFilterKey = new URLSearchParams(courseFilterParams).toString();

    const value = {
        selectedSession,
        setSelectedSession,
        availableSessions,
        getCurrentSession,
        courseFilters,
        setCourseFilters,
        clearCourseFilters,
        courseFilterParams,
        courseFilterKey
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

