import { useState, useEffect, useRef, useCallback } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import api from '../../utils/api';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { Container, SectionHeader } from '../site/Layout';
import Icon from '../site/Icon';
import { cx } from '../site/cx';
// Import vertical slider images
import verticalSlider1 from '../../assets/images/vertical slider.png';
import verticalSlider2 from '../../assets/images/vertical slider 2.png';
import verticalSlider3 from '../../assets/images/vertical slider 3.png';

// Default vertical slider images
const DEFAULT_VERTICAL_SLIDES = [
    verticalSlider1,
    verticalSlider2,
    verticalSlider3
];

// Admin-uploaded posters (Super Admin → Sliders), formerly the homepage banner.
// Data loading is unchanged from the old HeroCarousel; only the presentation moved.
const PosterCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState(DEFAULT_VERTICAL_SLIDES);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
    const [sliderType, setSliderType] = useState(viewportWidth > 1000 ? 'horizontal' : 'vertical');
    const timerRef = useRef(null);

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

    const startAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (slides.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
        }
    }, [slides.length]);

    const stopAutoplay = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Auto-advance slides with proper cleanup
    useEffect(() => {
        if (slides.length === 0 || slides.length === 1) return;

        // Set up new timer (5 seconds for smoother experience)
        startAutoplay();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [slides.length, startAutoplay]);

    if (slides.length === 0) {
        return null;
    }

    const isVertical = sliderType === 'vertical';
    const arrowClass = 'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sw-pill bg-sw-glass/90 text-sw-white ring-1 ring-inset ring-sw-white/15 backdrop-blur-sw-glass transition-colors duration-sw-fast hover:bg-sw-glass-hover';

    return (
        <section aria-labelledby="posters-title" className="pb-sw-section">
            <Container>
                <SectionHeader
                    id="posters-title"
                    title="Admissions & updates"
                    subtitle="The latest admission openings and announcements from Swagat, all in one place."
                />

                <div
                    className={cx('relative mx-auto rounded-sw-md bg-sw-black p-3 md:p-4', isVertical ? 'max-w-sm' : 'max-w-none')}
                    onMouseEnter={stopAutoplay}
                    onMouseLeave={startAutoplay}
                    onFocus={stopAutoplay}
                    onBlur={startAutoplay}
                >
                    <div
                        aria-roledescription="carousel"
                        aria-label="Admission posters"
                        className={cx('relative w-full overflow-hidden rounded-sw-sm bg-sw-ink', isVertical ? 'aspect-[9/16]' : 'aspect-[1920/820]')}
                    >
                        {/* Slides: opacity crossfade; posters are shown whole (contain), never cropped */}
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${index + 1} of ${slides.length}`}
                                aria-hidden={index !== currentSlide}
                                className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out"
                                style={{
                                    opacity: index === currentSlide ? 1 : 0,
                                    visibility: index === currentSlide ? 'visible' : 'hidden',
                                }}
                            >
                                <img
                                    src={slide}
                                    alt={`Slide ${index + 1}`}
                                    className="h-full w-full object-contain"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    draggable="false"
                                />
                            </div>
                        ))}

                        {slides.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
                                    aria-label="Previous poster"
                                    className={`${arrowClass} left-2 md:left-4`}
                                >
                                    <Icon icon={LuChevronLeft} size="sm" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goToSlide((currentSlide + 1) % slides.length)}
                                    aria-label="Next poster"
                                    className={`${arrowClass} right-2 md:right-4`}
                                >
                                    <Icon icon={LuChevronRight} size="sm" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Slide Indicators */}
                    {slides.length > 1 && (
                        <div className="mt-2 flex justify-center">
                            {slides.map((_, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={index === currentSlide ? 'true' : undefined}
                                    className="flex h-11 w-8 items-center justify-center"
                                >
                                    <span
                                        className={cx(
                                            'block h-2 rounded-sw-pill transition-all duration-sw',
                                            index === currentSlide ? 'w-6 bg-sw-white' : 'w-2 bg-sw-white/40 hover:bg-sw-white/70'
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default PosterCarousel;
