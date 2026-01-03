import { useState, useEffect, useRef, useCallback } from 'react';
import { CAROUSEL_IMAGES } from '../utils/constants';
import api from '../utils/api';
import { normalizeImageUrl } from '../utils/imageUtils';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState(CAROUSEL_IMAGES);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch sliders from API
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                // Use public endpoint (no auth required)
                const response = await api.get('/api/sliders/public');
                console.log('📸 Sliders API Response:', response.data);
                
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    const apiSlides = response.data.data
                        .filter(slider => slider.isActive !== false) // Only active sliders
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(slider => {
                            // Use utility function to normalize image URL
                            if (slider.image) {
                                return normalizeImageUrl(slider.image);
                            }
                            return null;
                        })
                        .filter(Boolean); // Remove null values
                    
                    console.log('📸 Processed slides:', apiSlides);
                    
                    if (apiSlides.length > 0) {
                        setSlides(apiSlides);
                    } else {
                        console.warn('⚠️ No active sliders found, using default images');
                    }
                } else {
                    console.warn('⚠️ No sliders returned from API, using default images');
                }
            } catch (error) {
                console.error('❌ Error fetching sliders:', error);
                console.error('❌ Error details:', error.response?.data || error.message);
                // Fallback to default images if API fails
            }
        };

        fetchSliders();
        
        // Refresh sliders every 30 seconds to pick up new uploads
        const interval = setInterval(fetchSliders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Preload images to prevent glitches
    useEffect(() => {
        slides.forEach((slide) => {
            const img = new Image();
            img.src = slide;
        });
    }, [slides]);

    // Smooth slide transition
    const goToSlide = useCallback((index) => {
        if (index === currentSlide || isTransitioning || slides.length === 0) return;

        setIsTransitioning(true);
        setCurrentSlide(index);

        // Reset transition flag after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    }, [currentSlide, isTransitioning, slides.length]);

    // Auto-advance slides with proper cleanup
    useEffect(() => {
        if (slides.length === 0 || slides.length === 1) return;

        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Set up new timer
        timerRef.current = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % slides.length;
                return next;
            });
        }, 5000); // 5 seconds for smoother experience

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [slides.length]);

    if (slides.length === 0) {
        return null;
    }

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative w-full h-[18vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[65vh] mt-20 sm:mt-16 md:mt-16 overflow-hidden"
            style={{
                isolation: 'isolate',
                transform: 'none',
                willChange: 'auto',
                position: 'relative',
                zIndex: 1
            }}
        >
            {/* Slider Container */}
            <div
                className="relative w-full h-full"
                style={{
                    isolation: 'isolate',
                    transform: 'none',
                    willChange: 'auto'
                }}
            >
                {/* Slides - Using opacity fade instead of transform to prevent affecting navbar */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out"
                        style={{
                            opacity: index === currentSlide ? 1 : 0,
                            zIndex: index === currentSlide ? 1 : 0,
                            pointerEvents: index === currentSlide ? 'auto' : 'none'
                        }}
                    >
                        <img
                            src={slide}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            draggable="false"
                        />
                    </div>
                ))}

                {/* Slide Indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                onMouseEnter={() => {
                                    if (timerRef.current) {
                                        clearInterval(timerRef.current);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (slides.length > 1) {
                                        timerRef.current = setInterval(() => {
                                            setCurrentSlide((prev) => (prev + 1) % slides.length);
                                        }, 5000);
                                    }
                                }}
                                className={`rounded-full transition-all duration-300 ease-in-out ${index === currentSlide
                                    ? 'bg-white w-8 h-3 shadow-lg'
                                    : 'bg-white/50 hover:bg-white/75 w-3 h-3'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroCarousel;
