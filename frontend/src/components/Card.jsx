import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
    children,
    className = '',
    hover = true,
    animation = 'fadeIn',
    delay = 0,
    ...props
}) => {
    const baseClasses = 'relative p-8 rounded-2xl bg-gradient-to-br from-futuristic-blue-900/30 to-futuristic-blue-800/20 border border-futuristic-blue-500/30'
    const hoverClasses = hover ? 'hover:border-futuristic-blue-400/60 hover:shadow-futuristic-lg transition-all duration-300' : ''

    const animations = {
        fadeIn: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
        scaleIn: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
        slideUp: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
        slideLeft: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
        slideRight: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } }
    }

    const selectedAnimation = animations[animation] || animations.fadeIn

    return (
        <motion.div
            initial={selectedAnimation.initial}
            animate={selectedAnimation.animate}
            transition={{ duration: 0.6, delay }}
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-futuristic-blue-500/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

export default Card
