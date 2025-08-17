import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CAROUSEL_IMAGES } from '../utils/constants'

gsap.registerPlugin(ScrollTrigger)

const HeroCarousel = ({ images = CAROUSEL_IMAGES }) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const containerRef = useRef(null)
    const textRef = useRef(null)

    // GSAP animations on mount
    useEffect(() => {
        const tl = gsap.timeline()

        tl.fromTo(textRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
            .fromTo('.hero-subtitle',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5"
            )
            .fromTo('.hero-cta',
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.3"
            )

        // Parallax effect
        gsap.to('.parallax-bg', {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        })
    }, [])

    // Auto-advance carousel with smooth transitions
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isAnimating) {
                setCurrentSlide((prev) => (prev + 1) % images.length)
            }
        }, 6000)

        return () => clearInterval(timer)
    }, [images.length, isAnimating])

    const goToSlide = (index) => {
        if (isAnimating || index === currentSlide) return
        setIsAnimating(true)
        setCurrentSlide(index)
        setTimeout(() => setIsAnimating(false), 800)
    }

    const goToPrevious = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
        setTimeout(() => setIsAnimating(false), 800)
    }

    const goToNext = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev + 1) % images.length)
        setTimeout(() => setIsAnimating(false), 800)
    }

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotateY: direction < 0 ? 45 : -45
        })
    }

    return (
        <section id="hero" ref={containerRef} className="relative h-screen overflow-hidden bg-black">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
            </div>

            {/* Carousel Container */}
            <div className="relative h-full">
                <AnimatePresence mode="wait" custom={currentSlide}>
                    <motion.div
                        key={currentSlide}
                        custom={currentSlide}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.8 },
                            scale: { duration: 0.8 },
                            rotateY: { duration: 0.8 }
                        }}
                        className="absolute inset-0"
                    >
                        <div className="relative h-full w-full">
                            <img
                                src={images[currentSlide]}
                                alt={`Slide ${currentSlide + 1}`}
                                className="h-full w-full object-cover parallax-bg"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="text-center text-white px-6 max-w-6xl">
                                    <motion.h1
                                        ref={textRef}
                                        className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #3b82f6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        SWAGAT
                                    </motion.h1>

                                    <motion.p
                                        className="hero-subtitle text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed"
                                        style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
                                    >
                                        Group of Institutions
                                    </motion.p>

                                    <motion.p
                                        className="hero-subtitle text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                                        style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
                                    >
                                        Education • Innovation • Revolution
                                    </motion.p>

                                    <motion.div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                                        >
                                            Explore Programs
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                                        >
                                            Watch Video
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Dots */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="flex space-x-3">
                        {images.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <motion.button
                    onClick={goToPrevious}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <i className="fa-solid fa-chevron-left text-xl"></i>
                </motion.button>

                <motion.button
                    onClick={goToNext}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <i className="fa-solid fa-chevron-right text-xl"></i>
                </motion.button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        key={currentSlide}
                    />
                </div>
            </div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full backdrop-blur-sm border border-white/20"
            />

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-white/20"
            />
        </section>
    )
}

export default HeroCarousel
