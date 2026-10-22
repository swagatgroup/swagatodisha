import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DarkModeContext = createContext();

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};

export const DarkModeProvider = ({ children }) => {
    // Dark mode only applies to the dashboards; the public site is always light
    const { pathname } = useLocation();
    const isDashboard = pathname.startsWith('/dashboard');

    // Initialize from the saved preference (same rule as the index.html script)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return saved === 'true';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // Update localStorage
                localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

                // Update DOM class
                if (isDarkMode && isDashboard) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        } catch (error) {
            console.warn('Error updating dark mode:', error);
        }
    }, [isDarkMode, isDashboard]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const value = {
        isDarkMode,
        toggleDarkMode
    };

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
};
