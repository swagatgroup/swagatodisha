import React, { useState, useEffect } from 'react'
import { CAROUSEL_IMAGES } from '../utils/constants'

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Use images from constants for consistency
    const slides = CAROUSEL_IMAGES

    // Auto-advance slides every 4000ms
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)

        return () => clearInterval(timer)
    }, [slides.length])

    // Go to specific slide
    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    return (
        <section id="hero" className="relative w-full h-[18vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[65vh] mt-20 sm:mt-16 md:mt-16">
            {/* Image Carousel */}
            <div className="relative w-full h-full">
                <img
                    src={slides[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-contain"
                />

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8 shadow-lg'
                                : 'bg-white/50 hover:bg-white/75'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroCarousel
