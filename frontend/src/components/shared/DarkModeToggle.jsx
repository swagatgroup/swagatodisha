import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../contexts/DarkModeContext';

const DarkModeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <motion.button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                key={isDarkMode ? "dark" : "light"}
                initial={{ y: -20, opacity: 0, rotate: isDarkMode ? 180 : 0 }}
                animate={{ y: 0, opacity: 1, rotate: isDarkMode ? 180 : 0 }}
                exit={{ y: 20, opacity: 0, rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative w-6 h-6"
            >
                {isDarkMode ? (
                    /* Moon Icon - Rotated 180 degrees */
                    <svg
                        className="w-6 h-6 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: 'rotate(180deg)' }}
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                ) : (
                    /* Sun Icon */
                    <svg
                        className="w-6 h-6 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                )}
            </motion.div>
        </motion.button>
    );
};

export default DarkModeToggle;
