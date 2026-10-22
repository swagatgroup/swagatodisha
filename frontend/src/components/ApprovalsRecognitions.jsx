import {useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import Icon from './site/Icon'

const ApprovalsRecognitions = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Using standard API endpoint for public content if available, else standard backend endpoint
                // Assuming /api/website-content is available (we can use axios directly)
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/website-content`);
                if (res.data && res.data.data && res.data.data.approvalsRecognitions) {
                    const activeApprovals = res.data.data.approvalsRecognitions
                        .filter(u => u.isActive !== false)
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                    setUniversities(activeApprovals);
                }
            } catch (error) {
                console.error("Error fetching approvals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Function to handle PDF download
    const handleApprovalClick = (approval) => {
        if (!approval.pdf) return;
        // Create a temporary link element to trigger download
        const link = document.createElement('a')
        link.href = approval.pdf
        link.download = `${approval.name}-approval.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Auto-advance slides
    useEffect(() => {
        if (universities.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % universities.length)
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(interval)
    }, [universities.length])

    // Go to next slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % universities.length)
    }

    // Go to previous slide
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + universities.length) % universities.length)
    }

    // Go to specific slide
    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    if (loading) return null;
    if (universities.length === 0) return null; // Don't render section if no approvals

    const arrowClass = 'absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sw-pill bg-sw-glass/90 text-sw-white ring-1 ring-inset ring-sw-white/10 transition-colors duration-sw-fast hover:bg-sw-glass-hover'

    return (
        <div className="sw-section bg-sw-black text-sw-text-on-dark">
            <div className="sw-container relative">
                {/* Card Slider */}
                <div className="relative mx-auto px-12 md:px-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -60, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="rounded-sw-md bg-sw-white/5 p-5 ring-1 ring-sw-white/10 md:p-8"
                        >
                            {/* University Name */}
                            <div className="mb-6 text-center">
                                <h3 className="text-sw-h2 font-bold">
                                    {universities[currentSlide].name}
                                </h3>
                                <h2 className="mt-1 text-sw-subtitle text-sw-text-on-dark-secondary">
                                    Approvals & Recognitions
                                </h2>
                            </div>

                            {/* Approvals Grid */}
                            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                {(universities[currentSlide].approvals || []).map((approval, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className="group flex w-24 flex-col items-center"
                                        onClick={() => handleApprovalClick(approval)}
                                        title={`Click to download ${approval.name} approval PDF`}
                                    >
                                        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-sw-pill bg-sw-white p-2 transition-transform duration-sw-fast group-hover:scale-105 md:h-20 md:w-20">
                                            <img
                                                src={approval.logo}
                                                alt={approval.name}
                                                loading="lazy"
                                                className="h-full w-full rounded-sw-pill object-contain"
                                                onError={(e) => { e.target.src = '/Swagat_Favicon.png'; }}
                                            />
                                        </span>
                                        <span className="mt-2 text-center text-sw-caption font-semibold leading-tight text-sw-text-on-dark-secondary group-hover:text-sw-white">
                                            {approval.name ? approval.name.split(' ').map((word, wordIndex) => (
                                                <span key={wordIndex}>
                                                    {word}
                                                    {wordIndex < approval.name.split(' ').length - 1 && <br />}
                                                </span>
                                            )) : 'Approval'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {universities.length > 1 && (
                        <>
                            <button type="button" onClick={prevSlide} aria-label="Previous" className={`${arrowClass} left-0`}>
                                <Icon icon={LuChevronLeft} size="sm" />
                            </button>
                            <button type="button" onClick={nextSlide} aria-label="Next" className={`${arrowClass} right-0`}>
                                <Icon icon={LuChevronRight} size="sm" />
                            </button>
                        </>
                    )}

                    {/* Slide Indicators */}
                    {universities.length > 1 && (
                        <div className="mt-4 flex justify-center">
                            {universities.map((_, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={index === currentSlide ? 'true' : undefined}
                                    className="flex h-11 w-11 items-center justify-center"
                                >
                                    <span className={`block h-2 rounded-sw-pill transition-all duration-sw ${index === currentSlide ? 'w-6 bg-sw-white' : 'w-2 bg-sw-white/40'}`} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Slide Counter */}
                    {universities.length > 1 && (
                        <div className="text-center text-sw-small font-normal text-sw-text-on-dark-muted">
                            {currentSlide + 1} of {universities.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ApprovalsRecognitions
