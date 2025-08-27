import React from 'react'
import { motion } from 'framer-motion'

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    icon: Icon,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-futuristic-black'

    const variants = {
        primary: 'bg-gradient-to-r from-futuristic-blue-500 to-futuristic-blue-600 hover:from-futuristic-blue-600 hover:to-futuristic-blue-700 text-white hover:shadow-glow-blue focus:ring-futuristic-blue-500',
        secondary: 'bg-gradient-to-r from-futuristic-purple-500 to-futuristic-purple-600 hover:from-futuristic-purple-600 hover:to-futuristic-purple-700 text-white hover:shadow-glow-purple focus:ring-futuristic-purple-500',
        outline: 'border-2 border-futuristic-blue-500 text-futuristic-blue-400 hover:bg-futuristic-blue-500 hover:text-white focus:ring-futuristic-blue-500',
        ghost: 'text-futuristic-cyan-300 hover:bg-futuristic-cyan-900/20 hover:text-futuristic-cyan-200 focus:ring-futuristic-cyan-500'
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    }

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
            {...props}
        >
            {Icon && <Icon className="mr-2" />}
            {children}
        </motion.button>
    )
}

export default Button
