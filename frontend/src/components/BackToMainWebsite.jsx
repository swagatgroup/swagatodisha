import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const BackToMainWebsite = ({
    position = "top-right",
    variant = "default",
    className = "",
    showText = true
}) => {
    const positionClasses = {
        "top-left": "top-6 left-6",
        "top-right": "top-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "bottom-right": "bottom-6 right-6",
        "top-center": "top-6 left-1/2 transform -translate-x-1/2",
        "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
    }

    const variantStyles = {
        "default": "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
        "outline": "bg-white/90 backdrop-blur-sm text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white",
        "minimal": "bg-gray-100/90 backdrop-blur-sm text-gray-700 hover:bg-gray-200",
        "floating": "bg-white shadow-2xl text-purple-600 hover:shadow-3xl hover:scale-105"
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`fixed z-50 ${positionClasses[position]} ${className}`}
        >
            <Link
                to="/"
                className={`
                    inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-lg
                    transition-all duration-300 shadow-lg hover:shadow-xl
                    ${variantStyles[variant]}
                    group
                `}
            >
                <motion.div
                    whileHover={{ x: -3 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full"
                >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                </motion.div>

                {showText && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="hidden sm:block"
                    >
                        Back to Main Website
                    </motion.span>
                )}

                <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full"
                >
                    <i className="fa-solid fa-home text-sm"></i>
                </motion.div>
            </Link>
        </motion.div>
    )
}

export default BackToMainWebsite
