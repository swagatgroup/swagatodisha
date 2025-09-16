import React, { useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion'

const PremiumFloatingElements = () => {
    const containerRef = useRef(null)
    const controls = useAnimation()

    // Advanced motion values for premium effects
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8])
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8])
    const springConfig = { damping: 30, stiffness: 500 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)

    // Mouse tracking for subtle interactive effects
    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            mouseX.set(x)
            mouseY.set(y)
        }
    }

    // Subtle animation sequences
    useEffect(() => {
        const sequence = async () => {
            await controls.start({
                scale: [1, 1.05, 1],
                transition: { duration: 12, ease: "easeInOut" }
            })
        }
        sequence()
    }, [controls])

    // Elegant floating bubbles - small and subtle
    const ElegantBubbles = () => (
        <>
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${4 + Math.random() * 6}px`,
                        height: `${4 + Math.random() * 6}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `rgba(${139 + i * 8}, ${92 + i * 6}, ${246 - i * 10}, ${0.15 + Math.random() * 0.1})`,
                        boxShadow: `0 0 ${8 + Math.random() * 4}px rgba(${139 + i * 8}, ${92 + i * 6}, ${246 - i * 10}, 0.3)`
                    }}
                />
            ))}
        </>
    )

    // Gentle cloud-like structures
    const GentleClouds = () => (
        <>
            {/* Cloud 1 - Top Right */}
            <motion.div
                className="absolute top-1/6 right-1/8 w-32 h-20 opacity-8"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0],
                    scale: [1, 1.02, 1]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg viewBox="0 0 200 120" className="w-full h-full">
                    <path d="M20,60 Q40,40 60,60 T100,60 Q120,40 140,60 T180,60 L180,80 L20,80 Z"
                        fill="rgba(139, 92, 246, 0.08)" />
                </svg>
            </motion.div>

            {/* Cloud 2 - Bottom Left */}
            <motion.div
                className="absolute bottom-1/6 left-1/8 w-28 h-16 opacity-6"
                animate={{
                    y: [0, 12, 0],
                    x: [0, -8, 0],
                    scale: [1, 0.98, 1]
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
            >
                <svg viewBox="0 0 200 120" className="w-full h-full">
                    <path d="M15,70 Q35,50 55,70 T95,70 Q115,50 135,70 T175,70 L175,90 L15,90 Z"
                        fill="rgba(59, 130, 246, 0.06)" />
                </svg>
            </motion.div>

            {/* Cloud 3 - Center */}
            <motion.div
                className="absolute top-1/2 left-1/3 w-24 h-14 opacity-5"
                animate={{
                    y: [0, -8, 0],
                    x: [0, 6, 0],
                    scale: [1, 1.01, 1]
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 10
                }}
            >
                <svg viewBox="0 0 200 120" className="w-full h-full">
                    <path d="M25,65 Q45,45 65,65 T105,65 Q125,45 145,65 T185,65 L185,85 L25,85 Z"
                        fill="rgba(236, 72, 153, 0.05)" />
                </svg>
            </motion.div>
        </>
    )

    // Subtle geometric accents
    const SubtleAccents = () => (
        <>
            {/* Small diamond accent */}
            <motion.div
                className="absolute top-1/4 right-1/4 w-8 h-8 opacity-12"
                animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,20 80,50 50,80 20,50" fill="rgba(139, 92, 246, 0.12)" />
                </svg>
            </motion.div>

            {/* Small star accent */}
            <motion.div
                className="absolute bottom-1/3 left-1/4 w-6 h-6 opacity-10"
                animate={{
                    rotate: [0, -180, -360],
                    scale: [1, 0.9, 1]
                }}
                transition={{
                    duration: 45,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 8
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,15 61,40 90,40 68,62 79,87 50,75 21,87 32,62 10,40 39,40"
                        fill="rgba(245, 158, 11, 0.1)" />
                </svg>
            </motion.div>
        </>
    )

    // Gentle floating particles
    const GentleParticles = () => (
        <>
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        left: `${15 + (i * 12)}%`,
                        top: `${20 + (i * 10)}%`,
                        background: `rgba(${139 + i * 15}, ${92 + i * 12}, ${246 - i * 15}, ${0.2 + Math.random() * 0.15})`,
                        boxShadow: `0 0 ${4 + Math.random() * 3}px rgba(${139 + i * 15}, ${92 + i * 12}, ${246 - i * 15}, 0.4)`
                    }}
                    animate={{
                        y: [0, -15 - Math.random() * 10, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 8 + i * 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 1.2
                    }}
                />
            ))}
        </>
    )

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            onMouseMove={handleMouseMove}
            style={{
                // Exclude the hero section (top 100vh) from floating elements
                clipPath: 'polygon(0 100vh, 100% 100vh, 100% 100%, 0 100%)'
            }}
        >
            {/* Elegant Floating Bubbles */}
            <ElegantBubbles />

            {/* Gentle Cloud Structures */}
            <GentleClouds />

            {/* Subtle Geometric Accents */}
            <SubtleAccents />

            {/* Gentle Floating Particles */}
            <GentleParticles />

            {/* Clean Interactive Background */}
            <div className="absolute inset-0">
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
            </div>
        </div>
    )
}

export default PremiumFloatingElements
