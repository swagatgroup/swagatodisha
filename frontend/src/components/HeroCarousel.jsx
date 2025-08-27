import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Array of slider images - only the two new ones
    const slides = [
        '/slider1.jpg',
        '/slider2.jpg',
    ]

    // Auto-advance slides every 4000ms
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000) // Change slide every 4 seconds

        return () => clearInterval(timer)
    }, [slides.length])

    // Go to specific slide
    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    // Go to next/previous slide
    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <section id="hero" className="relative w-screen h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[100vh] xl:h-[120vh] overflow-hidden mt-16">
            {/* Image Carousel */}
            <div className="relative w-full h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[100vh] xl:h-[120vh]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-full h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[100vh] xl:h-[120vh] flex items-center justify-center"
                    >
                        <img
                            src={slides[currentSlide]}
                            alt={`Slide ${currentSlide + 1}`}
                            className="w-full h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[100vh] xl:h-[120vh] object-contain"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8 shadow-lg'
                                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroCarousel
