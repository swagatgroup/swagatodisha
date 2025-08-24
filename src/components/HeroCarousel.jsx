import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

const HeroCarousel = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)
    const robotRef = useRef(null)

    // Advanced motion values for premium 3D effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useTransform(mouseY, [-300, 300], [15, -15])
    const rotateY = useTransform(mouseX, [-300, 300], [-15, 15])
    const springConfig = { damping: 25, stiffness: 700 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)

    // Robot-specific motion values for realistic interaction
    const robotHeadRotateX = useTransform(mouseY, [-300, 300], [25, -25])
    const robotHeadRotateY = useTransform(mouseX, [-300, 300], [-25, 25])
    const robotEyeRotateX = useTransform(mouseY, [-300, 300], [35, -35])
    const robotEyeRotateY = useTransform(mouseX, [-300, 300], [-35, 35])
    const robotNeckRotateX = useTransform(mouseY, [-300, 300], [15, -15])
    const robotNeckRotateY = useTransform(mouseX, [-300, 300], [-15, 15])

    // Spring animations for smooth robot movement
    const springHeadRotateX = useSpring(robotHeadRotateX, { damping: 30, stiffness: 600 })
    const springHeadRotateY = useSpring(robotHeadRotateY, { damping: 30, stiffness: 600 })
    const springEyeRotateX = useSpring(robotEyeRotateX, { damping: 20, stiffness: 800 })
    const springEyeRotateY = useSpring(robotEyeRotateY, { damping: 20, stiffness: 800 })
    const springNeckRotateX = useSpring(robotNeckRotateX, { damping: 35, stiffness: 500 })
    const springNeckRotateY = useSpring(robotNeckRotateY, { damping: 35, stiffness: 500 })

    // Mouse tracking for premium 3D effect
    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            setMousePosition({ x, y })
            mouseX.set(x)
            mouseY.set(y)
        }
    }

    // Robot breathing animation
    const breathingScale = useSpring(1, {
        damping: 20,
        stiffness: 100,
        mass: 0.5
    })

    useEffect(() => {
        const interval = setInterval(() => {
            breathingScale.set(1.02)
            setTimeout(() => breathingScale.set(1), 1000)
        }, 2000)
        return () => clearInterval(interval)
    }, [breathingScale])

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
            onMouseMove={handleMouseMove}
        >
            {/* Premium Animated Background */}
            <div className="absolute inset-0">
                {/* Sophisticated gradient layers */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.12),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]"></div>

                {/* Subtle mesh pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%)] bg-[length:20px_20px]"></div>
                </div>
            </div>

            {/* Subtle Particle Effects */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-orange-400/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -50],
                            opacity: [0, 0.6, 0],
                            scale: [0, 1, 0]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-20 flex items-center justify-center h-full px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center max-w-7xl w-full">

                    {/* Left Side - Text and Information */}
                    <div className="lg:col-span-2 text-left">
                        {/* Premium Main Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 60, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="mb-8"
                        >
                            <motion.h1
                                className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-4"
                                style={{
                                    filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.5))'
                                }}
                            >
                                <span className="text-white">Welcome to </span>
                                <span
                                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
                                    style={{
                                        filter: 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3))'
                                    }}
                                >
                                    Swagat
                                </span>
                            </motion.h1>
                        </motion.div>

                        {/* Premium Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="mb-6"
                        >
                            <motion.p
                                className="text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-relaxed"
                                style={{
                                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                                    filter: 'drop-shadow(0 2px 10px rgba(59, 130, 246, 0.2))'
                                }}
                            >
                                Group of Institutions
                            </motion.p>
                        </motion.div>

                        {/* Premium Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            className="mb-12"
                        >
                            <motion.p
                                className="text-lg md:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-3xl"
                                style={{
                                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                                    filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.2))'
                                }}
                            >
                                Empowering minds, shaping futures. Join thousands of students who have transformed their lives through excellence in education, innovation, and revolutionary learning approaches.
                            </motion.p>
                        </motion.div>

                        {/* Premium Statistics */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                            className="grid grid-cols-3 gap-8 mb-12 max-w-2xl"
                        >
                            {[
                                { number: "5000+", label: "Students", color: "text-white", dot: "bg-orange-400" },
                                { number: "50+", label: "Faculty", color: "text-white", dot: "bg-white" },
                                { number: "95%", label: "Success Rate", color: "text-green-400", dot: "bg-green-400" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center group"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <div className={`w-2 h-2 ${stat.dot} rounded-full mr-2`}></div>
                                        <div className={`text-3xl md:text-4xl font-bold ${stat.color} group-hover:text-blue-300 transition-colors duration-300`}>
                                            {stat.number}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 text-sm font-medium group-hover:text-gray-200 transition-colors duration-300">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Premium CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-6"
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    y: -3,
                                    boxShadow: "0 25px 50px rgba(251, 191, 36, 0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-500/40 transition-all duration-500 overflow-hidden"
                            >
                                {/* Button shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <span className="relative z-10">Explore Programs</span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    y: -3,
                                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 border-2 border-blue-600 text-white rounded-xl font-bold text-lg backdrop-blur-xl hover:bg-blue-600/10 transition-all duration-500 hover:border-blue-500"
                            >
                                Contact Us
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Right Side - 3D Hyperrealistic Robot */}
                    <motion.div
                        initial={{ opacity: 0, x: 60, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        className="lg:col-span-1 flex justify-center lg:justify-end"
                    >
                        <div className="relative" ref={robotRef}>
                            {/* 3D Robot Container */}
                            <motion.div
                                className="relative w-80 h-80"
                                style={{
                                    transformStyle: "preserve-3d",
                                    perspective: "1000px"
                                }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Robot Body - Main Structure */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-3xl shadow-2xl"
                                    style={{
                                        transform: `rotateX(${springRotateX}deg) rotateY(${springRotateY}deg) scale(${breathingScale})`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    {/* Metallic texture overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 via-transparent to-slate-900/40 rounded-3xl"></div>
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] bg-[length:20px_20px] rounded-3xl"></div>
                                </motion.div>

                                {/* Robot Neck - Connects body to head */}
                                <motion.div
                                    className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springNeckRotateX}deg) rotateY(${springNeckRotateY}deg) translateZ(20px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    {/* Neck metallic texture */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-slate-500/30 to-slate-800/30 rounded-full"></div>
                                </motion.div>

                                {/* Robot Head - Main interactive element */}
                                <motion.div
                                    className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700 rounded-2xl shadow-2xl"
                                    style={{
                                        transform: `rotateX(${springHeadRotateX}deg) rotateY(${springHeadRotateY}deg) translateZ(40px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    {/* Head metallic texture */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/30 via-transparent to-slate-800/40 rounded-2xl"></div>

                                    {/* Robot Eyes - Highly interactive */}
                                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-8">
                                        {/* Left Eye */}
                                        <motion.div
                                            className="relative w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-lg"
                                            style={{
                                                transform: `rotateX(${springEyeRotateX}deg) rotateY(${springEyeRotateY}deg)`,
                                                transformStyle: "preserve-3d"
                                            }}
                                        >
                                            {/* Eye shine */}
                                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/80 rounded-full"></div>
                                            {/* Eye pupil */}
                                            <div className="absolute top-2 left-2 w-4 h-4 bg-black rounded-full"></div>
                                            {/* Eye glow */}
                                            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
                                        </motion.div>

                                        {/* Right Eye */}
                                        <motion.div
                                            className="relative w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-lg"
                                            style={{
                                                transform: `rotateX(${springEyeRotateX}deg) rotateY(${springEyeRotateY}deg)`,
                                                transformStyle: "preserve-3d"
                                            }}
                                        >
                                            {/* Eye shine */}
                                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/80 rounded-full"></div>
                                            {/* Eye pupil */}
                                            <div className="absolute top-2 left-2 w-4 h-4 bg-black rounded-full"></div>
                                            {/* Eye glow */}
                                            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
                                        </motion.div>
                                    </div>

                                    {/* Robot Mouth - Subtle expression */}
                                    <motion.div
                                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full"
                                        animate={{
                                            scaleX: [1, 1.1, 1],
                                            opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>

                                {/* Robot Shoulders */}
                                <motion.div
                                    className="absolute top-20 left-8 w-12 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.5}deg) rotateY(${springRotateY * 0.5}deg) translateZ(15px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-slate-500/30 to-slate-800/30 rounded-full"></div>
                                </motion.div>

                                <motion.div
                                    className="absolute top-20 right-8 w-12 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.5}deg) rotateY(${springRotateY * 0.5}deg) translateZ(15px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-slate-500/30 to-slate-800/30 rounded-full"></div>
                                </motion.div>

                                {/* Robot Arms */}
                                <motion.div
                                    className="absolute top-24 left-4 w-4 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.3}deg) rotateY(${springRotateY * 0.3}deg) translateZ(10px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-slate-500/30 to-slate-800/30 rounded-full"></div>
                                </motion.div>

                                <motion.div
                                    className="absolute top-24 right-4 w-4 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.3}deg) rotateY(${springRotateY * 0.3}deg) translateZ(10px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-slate-500/30 to-slate-800/30 rounded-full"></div>
                                </motion.div>

                                {/* Robot Chest Panel */}
                                <motion.div
                                    className="absolute top-32 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-br from-blue-600/20 via-blue-500/30 to-blue-600/20 rounded-xl border border-blue-400/30"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.2}deg) rotateY(${springRotateY * 0.2}deg) translateZ(25px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    {/* Circuit pattern */}
                                    <div className="absolute inset-2 bg-[linear-gradient(90deg,transparent_30%,rgba(59,130,246,0.3)_50%,transparent_70%)] bg-[length:8px_8px] rounded-lg"></div>
                                    {/* Status indicator */}
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </motion.div>

                                {/* Energy Core Glow */}
                                <motion.div
                                    className="absolute top-36 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full shadow-lg"
                                    style={{
                                        transform: `rotateX(${springRotateX * 0.1}deg) rotateY(${springRotateY * 0.1}deg) translateZ(30px)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.6, 1, 0.6]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                                </motion.div>
                            </motion.div>

                            {/* Robot Status Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                                className="text-center mt-6"
                            >
                                <p className="text-white text-lg font-medium">AI Assistant Active</p>
                                <p className="text-blue-300 text-sm font-light">Tracking cursor movement</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Wave/Cloud Structure */}
            <div className="absolute bottom-0 left-0 w-full h-32 z-10">
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-32 bg-white/10 backdrop-blur-xl"
                    style={{
                        clipPath: "polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 50%, 100% 100%)"
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                />

                {/* Purple Icon on Wave */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                >
                    <span className="text-white font-bold text-lg">S</span>
                </motion.div>
            </div>

            {/* Mouse Control Hint */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.8, ease: "easeOut" }}
                className="absolute bottom-6 right-6 bg-blue-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-blue-600/40"
            >
                <p className="text-white text-sm font-medium">Move your mouse to control the robot</p>
            </motion.div>

            {/* Premium Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1 h-3 bg-white/60 rounded-full mt-2"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}

export default HeroCarousel
