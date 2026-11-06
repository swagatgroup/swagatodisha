import { useState, useEffect, useRef, useCallback } from 'react';
import { LuChevronLeft, LuChevronRight, LuMaximize2 } from 'react-icons/lu';
import api from '../../utils/api';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { SectionHeader } from '../site/Layout';
import Icon from '../site/Icon';
import Modal from '../site/Modal';
import { cx } from '../site/cx';
// Bundled posters, built by Redesign/_tools/posters/render.mjs
import osbmeFeeHorizontal from '../../assets/images/posters/osbme-fee-12000-horizontal.webp';
import osbmeFeeVertical from '../../assets/images/posters/osbme-fee-12000-vertical.webp';
import universityHorizontal from '../../assets/images/posters/university-courses-horizontal.webp';
import universityVertical from '../../assets/images/posters/university-courses-vertical.webp';
import freeUgHorizontal from '../../assets/images/posters/free-regular-ug-horizontal.webp';
import freeUgVertical from '../../assets/images/posters/free-regular-ug-vertical.webp';
import freePgHorizontal from '../../assets/images/posters/free-regular-pg-horizontal.webp';
import freePgVertical from '../../assets/images/posters/free-regular-pg-vertical.webp';
import boardsHorizontal from '../../assets/images/posters/boards-2027-28-horizontal.webp';
import boardsVertical from '../../assets/images/posters/boards-2027-28-vertical.webp';
import otherCoursesHorizontal from '../../assets/images/posters/other-courses-horizontal.webp';
import otherCoursesVertical from '../../assets/images/posters/other-courses-vertical.webp';
import degreesHorizontal from '../../assets/images/posters/degrees-2026-27-horizontal.webp';
import degreesVertical from '../../assets/images/posters/degrees-2026-27-vertical.webp';
import coursesHorizontal from '../../assets/images/posters/courses-horizontal.webp';
import coursesVertical from '../../assets/images/posters/courses-vertical.webp';
import bangomundaHorizontal from '../../assets/images/posters/bangomunda-horizontal.webp';
import bangomundaVertical from '../../assets/images/posters/bangomunda-vertical.webp';
import osbmeHorizontal from '../../assets/images/posters/osbme-2026-27-horizontal.webp';
import osbmeVertical from '../../assets/images/posters/osbme-2026-27-vertical.webp';

const POSTER_ALT = [
    'OSBME admission open, April session 2027: 10th and +2 course fee 12,000 rupees only, no hidden charges. Call 9403891555.',
    'Your university degree: BBA, BCA, Hotel Management and Tourism Management from Maharaja Sriram Chandra Bhanja Deo University. Call +91 78559 59544.',
    'Study free with a free DCA: BSc Computer Science, BSc ITM, BSW and BLib regular courses, for SC, ST, and OBC or General students with PM-KISAN or CM-KISAN. Call +91 78559 59544.',
    'Study free with a free PGDCA: MFC, PMIR, MSW and MA in Yoga regular courses, for SC, ST, and OBC or General students with PM-KISAN or CM-KISAN. Call +91 78559 59544.',
    'Admissions open, session 2027 to 2028: 10th and +2 through NIOS, BOSSE and OSBME. Call +91 78559 59544.',
    'Other courses: BBA, BCA, BSW, BHM, BTM, B.Sc Computer Science, B.Sc ITM, B.Lib, MFC, PMIR, MSW and PGDCA. Call 9403891555.',
    'Admission open, session 2026 to 27: BBA, BCA, BSW, BHM and BTM. Call +91 78559 59544.',
    'Build your future: BBA, BCA, BHM, BTM and MFC. Call +91 78559 59544.',
    'Shaping your future at Bangomunda: BBA, BSW and B.Sc. Computer Science. Call +91 78559 59544.',
    'Admissions open, academic session 2026 to 27: 10th and +2 through OSBME. Call +91 78559 59544.',
];

const withAlt = (images) => images.map((src, index) => ({ src, alt: POSTER_ALT[index] }));

// Shown whenever Super Admin → Sliders has no active poster for this screen size
const DEFAULT_SLIDES = {
    horizontal: withAlt([osbmeFeeHorizontal, universityHorizontal, freeUgHorizontal, freePgHorizontal, boardsHorizontal, otherCoursesHorizontal, degreesHorizontal, coursesHorizontal, bangomundaHorizontal, osbmeHorizontal]),
    vertical: withAlt([osbmeFeeVertical, universityVertical, freeUgVertical, freePgVertical, boardsVertical, otherCoursesVertical, degreesVertical, coursesVertical, bangomundaVertical, osbmeVertical]),
};

// 900px matches the side-by-side layout, including a phone's desktop mode (about 980px wide)
const getSliderType = (width) => (width >= 900 ? 'horizontal' : 'vertical');
const sameSlides = (a, b) => a.length === b.length && a.every((slide, index) => slide.src === b[index].src);
const SWIPE_DISTANCE = 50;

// Previous / dots / next, used by both the page carousel and the full-screen view
const SliderControls = ({ count, current, onSelect, tone }) => {
    const arrowClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-glass/90 text-sw-white ring-1 ring-inset ring-sw-white/15 transition-colors duration-sw-fast hover:bg-sw-glass-hover';
    return (
        <div className={cx('flex items-center justify-between gap-1', tone)}>
            <button type="button" onClick={() => onSelect((current - 1 + count) % count)} aria-label="Previous poster" className={arrowClass}>
                <Icon icon={LuChevronLeft} size="sm" />
            </button>
            <div className="flex min-w-0 justify-center">
                {Array.from({ length: count }, (_, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => onSelect(index)}
                        aria-label={`Go to poster ${index + 1}`}
                        aria-current={index === current ? 'true' : undefined}
                        className="flex h-11 w-6 min-w-0 items-center justify-center"
                    >
                        <span
                            className={cx(
                                'block h-2 max-w-full rounded-sw-pill transition-all duration-sw',
                                index === current ? 'w-5 bg-sw-white' : 'w-2 bg-sw-white/40 hover:bg-sw-white/70'
                            )}
                        />
                    </button>
                ))}
            </div>
            <button type="button" onClick={() => onSelect((current + 1) % count)} aria-label="Next poster" className={arrowClass}>
                <Icon icon={LuChevronRight} size="sm" />
            </button>
        </div>
    );
};

// Admin-uploaded posters (Super Admin → Sliders), with the bundled posters as the default.
const PosterCarousel = () => {
    const [sliderType, setSliderType] = useState(() => getSliderType(typeof window !== 'undefined' ? window.innerWidth : 1920));
    const [slides, setSlides] = useState(() => DEFAULT_SLIDES[sliderType]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fullScreen, setFullScreen] = useState(false);
    const timerRef = useRef(null);
    const touchStartX = useRef(null);

    // Monitor viewport width changes
    useEffect(() => {
        const handleResize = () => setSliderType(getSliderType(window.innerWidth));
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch sliders from API based on sliderType
    useEffect(() => {
        const fetchSliders = async () => {
            let next = [];
            try {
                // Use public endpoint with sliderType query parameter
                const response = await api.get(`/api/sliders/public?sliderType=${sliderType}`);
                if (response.data.success && response.data.data) {
                    next = response.data.data
                        .filter(slider => slider.isActive !== false && slider.image) // Only active sliders with images
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(slider => normalizeImageUrl(slider.image))
                        .filter(Boolean) // Remove null/empty values
                        .map((src, index) => ({ src, alt: `Admission poster ${index + 1}` }));
                }
            } catch (error) {
                console.error('Error fetching sliders:', error);
            }
            if (next.length === 0) next = DEFAULT_SLIDES[sliderType];
            // The refresh below must not jump back to the first poster unless the list really changed
            setSlides((previous) => (sameSlides(previous, next) ? previous : next));
        };

        fetchSliders();

        // Refresh sliders every 30 seconds to pick up new uploads
        const interval = setInterval(fetchSliders, 30000);
        return () => clearInterval(interval);
    }, [sliderType]);

    useEffect(() => {
        setCurrentSlide(0);
    }, [slides]);

    // Preload images to prevent glitches
    useEffect(() => {
        slides.forEach((slide) => {
            const img = new Image();
            img.src = slide.src;
        });
    }, [slides]);

    const stopAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const startAutoplay = useCallback(() => {
        stopAutoplay();
        // The full-screen view only moves when asked, so people can read the poster
        if (slides.length > 1 && !fullScreen) {
            timerRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
        }
    }, [slides.length, fullScreen, stopAutoplay]);

    useEffect(() => {
        startAutoplay();
        return stopAutoplay;
    }, [startAutoplay, stopAutoplay]);

    // Arrow keys move the full-screen view; a swipe must not trigger the browser's back gesture
    useEffect(() => {
        if (!fullScreen) return undefined;
        const root = document.documentElement;
        const previousOverscroll = root.style.overscrollBehaviorX;
        root.style.overscrollBehaviorX = 'none';
        const onKeyDown = (event) => {
            if (event.key === 'ArrowLeft') setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
            if (event.key === 'ArrowRight') setCurrentSlide((prev) => (prev + 1) % slides.length);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            root.style.overscrollBehaviorX = previousOverscroll;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [fullScreen, slides.length]);

    const handleTouchEnd = (event) => {
        if (touchStartX.current === null || event.touches.length > 0) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < SWIPE_DISTANCE) return;
        setCurrentSlide((prev) => (prev + (distance < 0 ? 1 : -1) + slides.length) % slides.length);
    };

    const isVertical = sliderType === 'vertical';

    return (
        <section aria-labelledby="posters-title" className="flex h-full flex-col">
            <SectionHeader
                id="posters-title"
                title="Admissions & updates"
                subtitle="Latest openings and announcements."
                className="min-[900px]:!mb-5"
                subtitleClassName="min-[900px]:!text-sw-body"
            />

            <div
                className={cx('relative mx-auto flex w-full flex-1 flex-col rounded-sw-md bg-sw-black p-3 md:p-4', isVertical ? 'max-w-sm' : 'max-w-none')}
                onMouseEnter={stopAutoplay}
                onMouseLeave={startAutoplay}
                onFocus={stopAutoplay}
                onBlur={startAutoplay}
            >
                <div
                    aria-roledescription="carousel"
                    aria-label="Admission posters"
                    className={cx('relative w-full flex-1 overflow-hidden rounded-sw-sm', isVertical ? 'aspect-[4/5]' : 'aspect-[4/3]')}
                >
                    {/* Slides: opacity crossfade; posters are shown whole (contain), never cropped */}
                    {slides.map((slide, index) => (
                        <div
                            key={slide.src}
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
                            <button
                                type="button"
                                onClick={() => setFullScreen(true)}
                                aria-label={`View poster ${index + 1} of ${slides.length} full screen`}
                                aria-haspopup="dialog"
                                className="block h-full w-full cursor-zoom-in"
                            >
                                <img
                                    src={slide.src}
                                    alt={slide.alt}
                                    className="h-full w-full object-contain"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    draggable="false"
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-sw-caption text-sw-text-on-dark-muted">
                    <Icon icon={LuMaximize2} size={14} className="shrink-0" />
                    Tap a poster to see it full screen
                </p>

                {slides.length > 1 && (
                    <SliderControls count={slides.length} current={currentSlide} onSelect={setCurrentSlide} />
                )}
            </div>

            <Modal
                open={fullScreen}
                onClose={() => setFullScreen(false)}
                title={`Poster ${currentSlide + 1} of ${slides.length}`}
                tone="dark"
                fullScreen
                bodyClassName="!overflow-hidden !p-0"
            >
                <div className="flex h-full flex-col" aria-roledescription="carousel" aria-label="Admission posters">
                    <div
                        className="min-h-0 flex-1 overflow-hidden"
                        onTouchStart={(event) => {
                            touchStartX.current = event.touches.length === 1 ? event.touches[0].clientX : null;
                        }}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className="flex h-full transition-transform duration-500 ease-in-out motion-reduce:transition-none"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.src}
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${index + 1} of ${slides.length}`}
                                    aria-hidden={index !== currentSlide}
                                    className="h-full w-full shrink-0 p-2 sm:p-4"
                                >
                                    <img src={slide.src} alt={slide.alt} className="h-full w-full object-contain" draggable="false" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {slides.length > 1 && (
                        <SliderControls count={slides.length} current={currentSlide} onSelect={setCurrentSlide} tone="mx-auto w-full max-w-md px-3 pb-3" />
                    )}
                </div>
            </Modal>
        </section>
    );
};

export default PosterCarousel;
