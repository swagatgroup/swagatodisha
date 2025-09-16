import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../contexts/DarkModeContext';

const DarkModeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative w-6 h-6"
            >
                {/* Sun Icon */}
                <motion.svg
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={false}
                    animate={{
                        opacity: isDarkMode ? 0 : 1,
                        scale: isDarkMode ? 0.8 : 1
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </motion.svg>

                {/* Moon Icon */}
                <motion.svg
                    className={`absolute inset-0 w-6 h-6 text-blue-400 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={false}
                    animate={{
                        opacity: isDarkMode ? 1 : 0,
                        scale: isDarkMode ? 1 : 0.8
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </motion.svg>
            </motion.div>
        </button>
    );
};

export default DarkModeToggle;
