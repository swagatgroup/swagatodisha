import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { normalizeImageUrl } from '../utils/imageUtils';
// Import vertical slider images
import verticalSlider1 from '../assets/images/vertical slider.png';
import verticalSlider2 from '../assets/images/vertical slider 2.png';
import verticalSlider3 from '../assets/images/vertical slider 3.png';

// Default vertical slider images
const DEFAULT_VERTICAL_SLIDES = [
    verticalSlider1,
    verticalSlider2,
    verticalSlider3
];

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState(DEFAULT_VERTICAL_SLIDES);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
    const [sliderType, setSliderType] = useState(viewportWidth > 1000 ? 'horizontal' : 'vertical');
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    // Monitor viewport width changes
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setViewportWidth(width);
            setSliderType(width > 1000 ? 'horizontal' : 'vertical');
        };

        window.addEventListener('resize', handleResize);
        // Set initial viewport width
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Fetch sliders from API based on sliderType
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                // Use public endpoint with sliderType query parameter
                const response = await api.get(`/api/sliders/public?sliderType=${sliderType}`);
                console.log(`📸 Sliders API Response (${sliderType}):`, response.data);
                
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    const apiSlides = response.data.data
                        .filter(slider => slider.isActive !== false && slider.image) // Only active sliders with images
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(slider => {
                            // Use utility function to normalize image URL
                            const normalizedUrl = normalizeImageUrl(slider.image);
                            console.log(`📸 Slider "${slider.title}": ${slider.image} -> ${normalizedUrl}`);
                            return normalizedUrl;
                        })
                        .filter(Boolean); // Remove null/empty values
                    
                    console.log(`📸 Processed ${sliderType} slides:`, apiSlides);
                    console.log(`📸 Total active ${sliderType} sliders: ${apiSlides.length}`);
                    
                    if (apiSlides.length > 0) {
                        setSlides(apiSlides);
                        // Reset to first slide when slider type changes
                        setCurrentSlide(0);
                    } else {
                        // If no sliders found for current type, use defaults for vertical only
                        if (sliderType === 'vertical') {
                            console.warn('⚠️ No vertical sliders found, using default vertical slider images');
                            setSlides(DEFAULT_VERTICAL_SLIDES);
                            setCurrentSlide(0);
                        } else {
                            console.warn('⚠️ No horizontal sliders found');
                            setSlides([]);
                        }
                    }
                } else {
                    // If no sliders returned, use defaults for vertical only
                    if (sliderType === 'vertical') {
                        console.warn('⚠️ No sliders returned from API, using default vertical slider images');
                        setSlides(DEFAULT_VERTICAL_SLIDES);
                        setCurrentSlide(0);
                    } else {
                        console.warn('⚠️ No horizontal sliders returned from API');
                        setSlides([]);
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching sliders:', error);
                console.error('❌ Error details:', error.response?.data || error.message);
                // Fallback to default vertical slider images if API fails
                if (sliderType === 'vertical') {
                    setSlides(DEFAULT_VERTICAL_SLIDES);
                    setCurrentSlide(0);
                } else {
                    setSlides([]);
                }
            }
        };

        fetchSliders();
        
        // Refresh sliders every 30 seconds to pick up new uploads
        const interval = setInterval(fetchSliders, 30000);
        return () => clearInterval(interval);
    }, [sliderType]);

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

    // ─── Responsive height logic ──────────────────────────────────────────────
    // Desktop (>768px): fill from navbar bottom to viewport bottom.
    //   The navbar is 64px tall (fixed). We cap at 820px so banners don't
    //   look stretched on ultra-tall monitors — those will show a gap below.
    // Mobile (<768px): full 100vh so the banner is immersive on first load.
    //
    // IMAGE UPLOAD SPECS (tell the owner):
    //   Desktop banner: 1920 × 820 px  (landscape, ~2.34:1)
    //   Mobile  banner: 1080 × 1920 px (portrait, 9:16)
    //
    const NAVBAR_HEIGHT = 64; // px — matches Header fixed height

    const heroStyle =
        sliderType === 'horizontal'
            ? {
                  // Desktop: viewport height minus navbar, max 820px
                  height: `min(calc(100vh - ${NAVBAR_HEIGHT}px), 820px)`,
                  minHeight: '480px',
              }
            : {
                  // Mobile: full 100vh so it feels immersive
                  height: '100vh',
                  minHeight: '500px',
              };

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{
                ...heroStyle,
                marginTop: `${NAVBAR_HEIGHT}px`,
                isolation: 'isolate',
                transform: 'none',
                willChange: 'auto',
                position: 'relative',
                zIndex: 1,
            }}
        >
            {/* Slider Container */}
            <div
                className="relative w-full h-full"
                style={{ isolation: 'isolate', transform: 'none', willChange: 'auto' }}
            >
                {/* Slides — opacity-crossfade so z-index on navbar stays clean */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
                        style={{
                            opacity: index === currentSlide ? 1 : 0,
                            pointerEvents: index === currentSlide ? 'auto' : 'none',
                            visibility: index === currentSlide ? 'visible' : 'hidden',
                        }}
                    >
                        <img
                            src={slide}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            draggable="false"
                        />
                    </div>
                ))}

                {/* Slide Indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                onMouseEnter={() => {
                                    if (timerRef.current) clearInterval(timerRef.current);
                                }}
                                onMouseLeave={() => {
                                    if (slides.length > 1) {
                                        timerRef.current = setInterval(() => {
                                            setCurrentSlide((prev) => (prev + 1) % slides.length);
                                        }, 5000);
                                    }
                                }}
                                className={`rounded-full transition-all duration-300 ease-in-out ${
                                    index === currentSlide
                                        ? 'bg-white w-8 h-2.5 shadow-lg'
                                        : 'bg-white/50 hover:bg-white/75 w-2.5 h-2.5'
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
