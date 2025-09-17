import {useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion'

const ApprovalsRecognitions = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    // University data with their respective approvals
    const universities = [
        {
            id: 1,
            name: "Kalinga University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 2,
            name: "Utkal University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 3,
            name: "Sikkim Alpine University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 4,
            name: "Sikkim Professional University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 5,
            name: "Sikkim Skill University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" }
            ]
        },
        {
            id: 6,
            name: "Asian International University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 7,
            name: "MATS University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 8,
            name: "Capital University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        }
    ]

    // Function to handle PDF download
    const handleApprovalClick = (approval) => {
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

    return (
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 py-4 md:py-8">
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
                            className="backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 bg-gradient-to-br from-purple-600 to-blue-600"
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
                                {universities[currentSlide].approvals.map((approval, index) => (
                                    <motion.div
                                        key={approval.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="group cursor-pointer flex flex-col items-center"
                                        onClick={() => handleApprovalClick(approval)}
                                        title={`Click to download ${approval.name} approval PDF`}
                                    >
                                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-purple-100 w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
                                            <img
                                                src={approval.logo}
                                                alt={approval.name}
                                                className="w-8 h-8 md:w-12 md:h-12 object-contain rounded-full"
                                            />
                                        </div>
                                        {/* Fixed height container for consistent vertical spacing */}
                                        <div className="h-10 md:h-12 flex items-center justify-center mt-2 w-20 md:w-24">
                                            <p className="text-[8px] md:text-[10px] font-semibold text-white text-center leading-tight group-hover:text-purple-300 transition-colors duration-300">
                                                {approval.name.split(' ').map((word, wordIndex) => (
                                                    <span key={wordIndex}>
                                                        {word}
                                                        {wordIndex < approval.name.split(' ').length - 1 && <br />}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
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

                    {/* Slide Indicators */}
                    <div className="flex justify-center mt-3 md:mt-6 space-x-2 md:space-x-3">
                        {universities.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? 'bg-white scale-125'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Slide Counter */}
                    <div className="text-center mt-2 md:mt-3 text-white/80">
                        <span className="text-sm md:text-lg font-medium">
                            {currentSlide + 1} of {universities.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApprovalsRecognitions
