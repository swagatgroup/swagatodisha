import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { CAROUSEL_IMAGES } from '../utils/constants'


// Import images directly to ensure they're loaded
// Note: In Vite, we need to use the public folder path
// Try different approaches for image loading
const slider1 = '/slider001 SO.jpg'
const slider2 = '/slider002 SO.jpg'
const slider3 = '/slider003 SO.jpg'
const slider4 = '/slider004 SO.jpg'

// Alternative paths in case the above don't work
const altSlider1 = './slider001 SO.jpg'
const altSlider2 = './slider002 SO.jpg'
const altSlider3 = './slider003 SO.jpg'
const altSlider4 = './slider004 SO.jpg'



const HeroCarousel = ({ images = CAROUSEL_IMAGES }) => {
    // Use imported images as fallback if constants don't work
    const fallbackImages = [slider1, slider2, slider3, slider4]
    const altFallbackImages = [altSlider1, altSlider2, altSlider3, altSlider4]
    const displayImages = images && images.length > 0 ? images : fallbackImages
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)
    const textRef = useRef(null)

    // Advanced motion values for premium effects
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useTransform(mouseY, [-300, 300], [15, -15])
    const rotateY = useTransform(mouseX, [-300, 300], [-15, 15])
    const springConfig = { damping: 25, stiffness: 700 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)

    // Premium GSAP animations on mount
    useEffect(() => {
        const tl = gsap.timeline()

        // Sophisticated text reveal with staggered characters
        const text = textRef.current
        if (text) {
            const chars = text.textContent.split('')
            text.innerHTML = chars.map(char => `<span class="char">${char}</span>`).join('')

            gsap.set('.char', { y: 100, opacity: 0, rotateX: -90 })

            tl.to('.char', {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 1.2,
                ease: "back.out(1.7)",
                stagger: 0.05
            })
        }

        // Premium subtitle animations
        tl.fromTo('.hero-subtitle',
            { y: 80, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power4.out" }, "-=0.8"
        )
            .fromTo('.hero-cta',
                { y: 60, opacity: 0, scale: 0.6 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.3)" }, "-=0.6"
            )




    }, [])

    // Mouse tracking for premium 3D effect
    const handleMouseMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        setMousePosition({ x, y })
        mouseX.set(x)
        mouseY.set(y)
    }

    // Auto-advance carousel with faster timing (2/5th of original)
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isAnimating) {
                setCurrentSlide((prev) => (prev + 1) % displayImages.length)
            }
        }, 3200)

        return () => clearInterval(timer)
    }, [displayImages, isAnimating])



    const goToSlide = (index) => {
        if (isAnimating || index === currentSlide) return
        setIsAnimating(true)
        setCurrentSlide(index)
        setTimeout(() => setIsAnimating(false), 1200)
    }

    const goToPrevious = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
        setTimeout(() => setIsAnimating(false), 1200)
    }

    const goToNext = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev + 1) % images.length)
        setTimeout(() => setIsAnimating(false), 1200)
    }

    // Premium slide variants with 3D transforms
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1200 : -1200,
            opacity: 0,
            scale: 0.7,
            rotateY: direction > 0 ? 60 : -60,
            rotateX: 20,
            z: -200
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            z: 0
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1200 : -1200,
            opacity: 0,
            scale: 0.7,
            rotateY: direction < 0 ? 60 : -60,
            rotateX: -20,
            z: -200
        })
    }

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            onMouseMove={handleMouseMove}
        >
            {/* Premium Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.08),transparent_70%)]"></div>
            </div>



            {/* Carousel Container with 3D Mouse Effect */}
            <motion.div
                className="relative h-full"
                style={{
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    transformStyle: "preserve-3d"
                }}
            >
                <AnimatePresence mode="wait" custom={currentSlide}>
                    <motion.div
                        key={currentSlide}
                        custom={currentSlide}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 200, damping: 40 },
                            opacity: { duration: 1.2 },
                            scale: { duration: 1.2 },
                            rotateY: { duration: 1.2 },
                            rotateX: { duration: 1.2 }
                        }}
                        className="absolute inset-0"
                    >
                        <div className="relative h-full w-full">
                            {/* Background Image */}
                            <img
                                src={displayImages[currentSlide]}
                                alt={`Swagat Hero Slide ${currentSlide + 1}`}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                                style={{ minHeight: '100vh' }}
                                onError={(e) => {
                                    console.error('Failed to load image:', displayImages[currentSlide])
                                    e.target.style.display = 'none'
                                }}
                            />



                            {/* Fallback background in case image fails to load */}
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-30" />



                            {/* Premium AI-Generated Style Background Overlay */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>



                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                            {/* Premium Content Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="text-center text-white px-6 max-w-6xl">
                                    <motion.h1
                                        ref={textRef}
                                        className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight tracking-tight"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 30%, #3b82f6 70%, #06b6d4 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        SWAGAT
                                    </motion.h1>

                                    <motion.p
                                        className="hero-subtitle text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed font-light"
                                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                                    >
                                        Group of Institutions
                                    </motion.p>

                                    <motion.p
                                        className="hero-subtitle text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light"
                                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                                    >
                                        Education • Innovation • Revolution
                                    </motion.p>

                                    <motion.div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center">
                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                                y: -3,
                                                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 backdrop-blur-sm border border-white/20"
                                        >
                                            Explore Programs
                                        </motion.button>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                                y: -3,
                                                backgroundColor: "rgba(255, 255, 255, 0.15)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-10 py-5 border-2 border-white/40 text-white rounded-full font-semibold text-lg backdrop-blur-md hover:bg-white/15 transition-all duration-500"
                                        >
                                            Watch Video
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Premium Navigation Dots */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="flex space-x-4">
                        {images.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-4 h-4 rounded-full transition-all duration-500 ${index === currentSlide
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-125 shadow-lg shadow-purple-500/50'
                                    : 'bg-white/30 hover:bg-white/60'
                                    }`}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Premium Navigation Arrows */}
                <motion.button
                    onClick={goToPrevious}
                    className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-500 border border-white/20"
                    whileHover={{
                        scale: 1.15,
                        x: -8,
                        backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }}
                    whileTap={{ scale: 0.9 }}
                >
                    <i className="fa-solid fa-chevron-left text-2xl"></i>
                </motion.button>

                <motion.button
                    onClick={goToNext}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-500 border border-white/20"
                    whileHover={{
                        scale: 1.15,
                        x: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }}
                    whileTap={{ scale: 0.9 }}
                >
                    <i className="fa-solid fa-chevron-right text-2xl"></i>
                </motion.button>

                {/* Premium Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-30 backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-r-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        key={currentSlide}
                    />
                </div>
            </motion.div>










        </section>
    )
}

export default HeroCarousel
