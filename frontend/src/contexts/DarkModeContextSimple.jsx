import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};

export const DarkModeProvider = ({ children }) => {
    // Initialize synchronously from DOM (which was set by index.html script)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // Update localStorage
                localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

                // Update DOM class
                if (isDarkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        } catch (error) {
            console.warn('Error updating dark mode:', error);
        }
    }, [isDarkMode]);

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
