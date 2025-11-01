import { useState, useEffect } from 'react';
import { CAROUSEL_IMAGES } from '../utils/constants';
import api from '../utils/api';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState(CAROUSEL_IMAGES); // Fallback to constants
    const [loading, setLoading] = useState(true);

    // Fetch sliders from API
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const response = await api.get('/api/admin/sliders/public?isActive=true');
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    // Map API response to image URLs
                    const apiSlides = response.data.data
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(slider => {
                            // Handle both absolute and relative paths
                            if (slider.image.startsWith('http')) {
                                return slider.image;
                            } else if (slider.image.startsWith('/')) {
                                return slider.image;
                            } else {
                                return `/api${slider.image}`;
                            }
                        });
                    setSlides(apiSlides);
                }
                // If API fails or returns empty, keep using constants as fallback
            } catch (error) {
                console.error('Error fetching sliders:', error);
                // Keep using constants as fallback
            } finally {
                setLoading(false);
            }
        };

        fetchSliders();
    }, []);

    // Auto-advance slides every 3 seconds
    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [slides.length])

    // Go to specific slide
    const goToSlide = (index) => {
        if (index === currentSlide) return
        setCurrentSlide(index)
    }

    return (
        <section id="hero" className="relative w-full h-[18vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[65vh] mt-20 sm:mt-16 md:mt-16 overflow-hidden isolate">
            {/* Image Carousel */}
            <div className="relative w-full h-full">
                <img
                    src={slides[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
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
