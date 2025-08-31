import React, { useState, useEffect } from 'react'

const ApprovalsRecognitions = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    // University data with their respective approvals
    const universities = [
        {
            id: 1,
            name: "Kalinga University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/src/assets/approvals/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 2,
            name: "Utkal University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 3,
            name: "Sikkim Alpine University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/src/assets/approvals/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 4,
            name: "Sikkim Professional University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/src/assets/approvals/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 5,
            name: "Sikkim Skill University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" }
            ]
        },
        {
            id: 6,
            name: "Asian International University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/src/assets/approvals/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 7,
            name: "MATS University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
            ]
        },
        {
            id: 8,
            name: "Capital University",
            approvals: [
                { id: "ugc", name: "UGC", logo: "/src/assets/approvals/UGC.png", pdf: "/src/assets/documents/UGC-Letter-Copy-to-SAU.pdf" },
                { id: "aicte", name: "AICTE", logo: "/src/assets/approvals/AICTE.png", pdf: "/src/assets/documents/Common-AICTE-Approval-Letter-for-All-Universities.pdf" },
                { id: "bar", name: "Bar Council", logo: "/src/assets/approvals/bar-council-of-india.png", pdf: "/src/assets/documents/BCI_Approval_2024-25-1.pdf" },
                { id: "pharmacy", name: "Pharmacy Council", logo: "/src/assets/approvals/Pharmacy-Council-of-India.jpg", pdf: "/src/assets/documents/School-of-Pharmacy_Approval-Letter_2023-24.pdf" },
                { id: "rci", name: "RCI", logo: "/src/assets/approvals/RCI.png", pdf: "/src/assets/documents/RCI-Approval-SAU.pdf" },
                { id: "nursing", name: "Nursing Council", logo: "/src/assets/approvals/sikkim-nursing-council.png", pdf: "/src/assets/documents/Nursing-Approval-Letter.jpeg" },
                { id: "aiu", name: "AIU", logo: "/src/assets/approvals/association-of-indian-universities.png", pdf: "/src/assets/documents/AIU-Membership-Letter-SAU.pdf" },
                { id: "govt", name: "Govt Approval", logo: "/src/assets/approvals/Govt-of-Sikkim.png", pdf: "/src/assets/documents/SAU-Gazette-Notification-Copy.pdf" }
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
        <>
            <style>
                {`
                    @keyframes slideInFromLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-100px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                `}
            </style>
            <div className="min-h-screen bg-gradient-to-br from-green-400 to-orange-500 relative overflow-hidden">
                {/* Background SAU Logo */}
                <div className="absolute top-0 left-0 w-96 h-96 opacity-10">
                    <div className="text-green-200 text-9xl font-bold transform -rotate-12">SAU</div>
                </div>

                <div className="container mx-auto px-6 py-20">

                    {/* Slider Section */}
                    <div className="relative max-w-6xl mx-auto">
                        {/* Main Slider */}
                        <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="p-12 text-center">
                                {/* University Name */}
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-500 transform">
                                    {universities[currentSlide].name}
                                </h3>

                                {/* Section Title */}
                                <h4 className="text-2xl md:text-3xl font-semibold text-white mb-8 transition-all duration-500 transform">
                                    Approvals and Recognitions
                                </h4>

                                {/* Approvals Grid - Single Line with Slide Animation */}
                                <div className="flex justify-center items-center space-x-8 overflow-hidden">
                                    {universities[currentSlide].approvals.map((approval, index) => (
                                        <div
                                            key={approval.id}
                                            className="group cursor-pointer transform hover:scale-110 transition-all duration-700 flex-shrink-0"
                                            style={{
                                                animationDelay: `${index * 150}ms`,
                                                animation: 'slideInFromLeft 0.8s ease-out forwards'
                                            }}
                                            onClick={() => handleApprovalClick(approval)}
                                            title={`Click to download ${approval.name} approval PDF`}
                                        >
                                            <div className="bg-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 w-20 h-20 flex items-center justify-center">
                                                <img
                                                    src={approval.logo}
                                                    alt={approval.name}
                                                    className="w-12 h-12 object-contain"
                                                />
                                            </div>
                                            <p className="text-white text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                                                {approval.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Slide Indicators */}
                        <div className="flex justify-center mt-8 space-x-3">
                            {universities.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'bg-white scale-125'
                                        : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Slide Counter */}
                        <div className="text-center mt-4 text-white/80">
                            <span className="text-lg font-medium">
                                {currentSlide + 1} of {universities.length}
                            </span>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="text-center mt-16 text-white/90">
                        <p className="text-lg max-w-3xl mx-auto">
                            Click on any approval logo to download the respective approval document.
                            All our universities maintain the highest standards of quality and compliance.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ApprovalsRecognitions
