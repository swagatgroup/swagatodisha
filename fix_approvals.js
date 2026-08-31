const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/ApprovalsRecognitions.jsx';

const content = `import {useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios';

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
                const res = await axios.get(\`\${API_URL}/api/website-content\`);
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
        link.download = \`\${approval.name}-approval.pdf\`
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

    return (
        <div className="bg-[#7B3FA0] py-4 md:py-8">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Card Slider */}
                <div className="relative max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: "easeInOut"
                            }}
                            className="backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 bg-[#7B3FA0]"
                        >
                            {/* University Name */}
                            <div className="text-center mb-3 md:mb-6">
                                <h3 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2">
                                    {universities[currentSlide].name}
                                </h3>
                                <h2 className="text-sm md:text-lg font-bold text-white mb-2 md:mb-3">
                                    Approvals & Recognitions
                                </h2>
                                <div className="w-20 md:w-32 h-0.5 md:h-1 bg-white/50 border border-white/10 mx-auto rounded-full"></div>
                            </div>

                            {/* Approvals Grid */}
                            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                                {(universities[currentSlide].approvals || []).map((approval, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="group cursor-pointer flex flex-col items-center"
                                        onClick={() => handleApprovalClick(approval)}
                                        title={\`Click to download \${approval.name} approval PDF\`}
                                    >
                                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-purple-100 w-12 h-12 md:w-20 md:h-20 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={approval.logo}
                                                alt={approval.name}
                                                className="w-8 h-8 md:w-12 md:h-12 object-contain rounded-full"
                                                onError={(e) => { e.target.src = '/Swagat_Favicon.png'; }}
                                            />
                                        </div>
                                        {/* Fixed height container for consistent vertical spacing */}
                                        <div className="h-10 md:h-12 flex items-center justify-center mt-2 w-20 md:w-24">
                                            <p className="text-[8px] md:text-[10px] font-semibold text-white text-center leading-tight group-hover:text-purple-300 transition-colors duration-300">
                                                {approval.name ? approval.name.split(' ').map((word, wordIndex) => (
                                                    <span key={wordIndex}>
                                                        {word}
                                                        {wordIndex < approval.name.split(' ').length - 1 && <br />}
                                                    </span>
                                                )) : 'Approval'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {universities.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-20"
                            >
                                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={nextSlide}
                                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-20"
                            >
                                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Slide Indicators */}
                    {universities.length > 1 && (
                        <div className="flex justify-center mt-3 md:mt-6 space-x-2 md:space-x-3">
                            {universities.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={\`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 \${index === currentSlide
                                        ? 'bg-white scale-125'
                                        : 'bg-white/50 hover:bg-white/75'
                                        }\`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Slide Counter */}
                    {universities.length > 1 && (
                        <div className="text-center mt-2 md:mt-3 text-white/80">
                            <span className="text-sm md:text-lg font-medium">
                                {currentSlide + 1} of {universities.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ApprovalsRecognitions
`;

fs.writeFileSync(path, content, 'utf8');
