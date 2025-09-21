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
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Simple initialization - just set to false initially
        // The actual dark mode preference will be loaded after component mounts
        const initializeDarkMode = () => {
            try {
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('darkMode');
                    if (saved !== null) {
                        const parsed = JSON.parse(saved);
                        setIsDarkMode(parsed);
                    } else {
                        // Check system preference
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        setIsDarkMode(prefersDark);
                    }
                }
            } catch (error) {
                console.warn('Error initializing dark mode:', error);
            }
        };

        // Initialize after a short delay to ensure React is fully loaded
        const timer = setTimeout(initializeDarkMode, 100);
        return () => clearTimeout(timer);
    }, []);

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
