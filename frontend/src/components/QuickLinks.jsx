import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONTACT_INFO } from '../utils/constants'

// Register ScrollTrigger only on client side
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

const QuickLinks = () => {
    const containerRef = useRef(null)
    const cardsRef = useRef([])
    const [activeOverlay, setActiveOverlay] = useState(null)
    const [blinkingLinks, setBlinkingLinks] = useState(new Set())
    const [pdfViewer, setPdfViewer] = useState({ isOpen: false, file: null, name: null })
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const [careerModal, setCareerModal] = useState({ isOpen: false })
    const [expandedBranches, setExpandedBranches] = useState(new Set())
    const [expandedPaths, setExpandedPaths] = useState(new Set())
    const [showAllCareers, setShowAllCareers] = useState(new Set())
    const scrollContainerRef = useRef(null)
    const careerModalTimeoutRef = useRef(null)

    // Document categories with multiple links for each category
    const documentSections = {
        timetable: {
            title: "📅 Time Tables & Schedules",
            description: "Academic schedules from different universities",
            documents: [
                {
                    name: "Main University Time Table",
                    file: "Date-Sheet.pdf",
                    type: "pdf",
                    description: "Primary academic schedule"
                },
                {
                    name: "OSBME Information Booklet",
                    file: "OSBME-Information-Booklet.pdf",
                    type: "pdf",
                    description: "Complete OSBME program schedule"
                },
                {
                    name: "Semester Schedule",
                    file: "Date-Sheet.pdf",
                    type: "pdf",
                    description: "Detailed semester-wise schedule"
                }
            ]
        },
        notifications: {
            title: "📢 Important Notifications",
            description: "Latest updates and announcements",
            documents: [
                {
                    name: "Declaration for No Minimum Qualification",
                    file: "Declaration for no  minimum qualification.pdf",
                    type: "pdf",
                    description: "Important declaration regarding admission criteria"
                },
                {
                    name: "Declaration for Document Genuineness",
                    file: "Declaration For The Genuineness of Documents.pdf",
                    type: "pdf",
                    description: "Document verification requirements"
                },
                {
                    name: "NOC for New Institution",
                    file: "NOC for opening of new institution to impart DMLT.pdf",
                    type: "pdf",
                    description: "No Objection Certificate for new programs"
                },
                {
                    name: "Board Affiliation DMLT",
                    file: "Board affiliation concerning the DMLTDMRT.pdf",
                    type: "pdf",
                    description: "Board affiliation details for DMLT program"
                }
            ]
        },
        results: {
            title: "📊 Results & Admissions",
            description: "Academic results and admission information",
            documents: [
                {
                    name: "OSBME DEP Admission Form",
                    file: "OSBME-DEP-Admission-Form.pdf",
                    type: "pdf",
                    description: "Admission form for OSBME DEP program"
                },
                {
                    name: "AI Center Affiliation",
                    file: "Affilation of AI center of Patrachar Siksha Parishad.jpg",
                    type: "jpg",
                    description: "Affiliation certificate for AI center"
                },
                {
                    name: "University Results Portal",
                    file: "OSBME-Information-Booklet.pdf",
                    type: "pdf",
                    description: "Access to results and grades"
                }
            ]
        }
    }

    // Blinking animation for links
    const startBlinking = (documentName) => {
        setBlinkingLinks(prev => new Set([...prev, documentName]))
        setTimeout(() => {
            setBlinkingLinks(prev => {
                const newSet = new Set(prev)
                newSet.delete(documentName)
                return newSet
            })
        }, 3000) // Blink for 3 seconds
    }

    const handleDocumentClick = (documentName, fileName) => {
        console.log('Document clicked:', { documentName, fileName })
        startBlinking(documentName)

        // Open PDF viewer
        setPdfViewer({
            isOpen: true,
            file: fileName,
            name: documentName
        })
    }

    const handleDocumentHover = (documentName) => {
        startBlinking(documentName)
    }

    // Career modal hover handlers with delay
    const handleCareerHover = () => {
        // Clear any existing timeout
        if (careerModalTimeoutRef.current) {
            clearTimeout(careerModalTimeoutRef.current)
        }

        // Set a short delay before opening modal (300ms)
        careerModalTimeoutRef.current = setTimeout(() => {
            setCareerModal({ isOpen: true })
        }, 300)
    }

    const handleCareerLeave = () => {
        // Clear timeout if user leaves before delay completes
        if (careerModalTimeoutRef.current) {
            clearTimeout(careerModalTimeoutRef.current)
        }
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (careerModalTimeoutRef.current) {
                clearTimeout(careerModalTimeoutRef.current)
            }
        }
    }, [])

    // Handle mouse enter/leave for scroll control
    const handleMouseEnter = () => {
        setIsUserScrolling(true)
    }

    const handleMouseLeave = () => {
        setIsUserScrolling(false)
    }

    // Handle wheel scroll
    const handleWheelScroll = (e) => {
        if (scrollContainerRef.current) {
            e.preventDefault()
            const container = scrollContainerRef.current
            const scrollAmount = e.deltaY * 0.5 // Adjust scroll sensitivity
            container.scrollTop += scrollAmount
        }
    }

    // Tree interaction handlers
    const toggleBranch = (branchKey) => {
        setExpandedBranches(prev => {
            const newSet = new Set(prev)
            if (newSet.has(branchKey)) {
                newSet.delete(branchKey)
            } else {
                newSet.add(branchKey)
            }
            return newSet
        })
    }

    const togglePath = (pathKey) => {
        setExpandedPaths(prev => {
            const newSet = new Set(prev)
            if (newSet.has(pathKey)) {
                newSet.delete(pathKey)
            } else {
                newSet.add(pathKey)
            }
            return newSet
        })
    }

    const toggleShowAllCareers = (pathKey) => {
        setShowAllCareers(prev => {
            const newSet = new Set(prev)
            if (newSet.has(pathKey)) {
                newSet.delete(pathKey)
            } else {
                newSet.add(pathKey)
            }
            return newSet
        })
    }

    const handleCareerCounselingCall = () => {
        window.open(`tel:${CONTACT_INFO.phone}`, '_self')
    }

    // Comprehensive Career Options After 10th
    const careerOptions = {
        science: {
            title: "🔬 Science Stream",
            description: "Explore the world of science and technology",
            icon: "fa-solid fa-flask",
            color: "from-blue-500 to-cyan-500",
            paths: [
                {
                    name: "Engineering",
                    icon: "fa-solid fa-cogs",
                    description: "Build the future with technology",
                    careers: [
                        { name: "Computer Science Engineering", duration: "4 years", scope: "Software Development, AI, Cybersecurity" },
                        { name: "Mechanical Engineering", duration: "4 years", scope: "Manufacturing, Automotive, Aerospace" },
                        { name: "Civil Engineering", duration: "4 years", scope: "Infrastructure, Construction, Urban Planning" },
                        { name: "Electrical Engineering", duration: "4 years", scope: "Power Systems, Electronics, Telecommunications" },
                        { name: "Biotechnology Engineering", duration: "4 years", scope: "Pharmaceuticals, Research, Healthcare" },
                        { name: "Chemical Engineering", duration: "4 years", scope: "Chemical Industry, Petrochemicals, Pharmaceuticals" },
                        { name: "Aerospace Engineering", duration: "4 years", scope: "Aircraft Design, Space Technology, Defense" },
                        { name: "Environmental Engineering", duration: "4 years", scope: "Pollution Control, Sustainability, Green Technology" },
                        { name: "Marine Engineering", duration: "4 years", scope: "Ship Design, Offshore Technology, Naval Architecture" },
                        { name: "Mining Engineering", duration: "4 years", scope: "Mineral Extraction, Mining Technology, Safety" }
                    ]
                },
                {
                    name: "Medical",
                    icon: "fa-solid fa-stethoscope",
                    description: "Heal and save lives",
                    careers: [
                        { name: "MBBS (Doctor)", duration: "5.5 years", scope: "Hospitals, Clinics, Research" },
                        { name: "BDS (Dentist)", duration: "5 years", scope: "Dental Clinics, Hospitals, Private Practice" },
                        { name: "B.Pharm (Pharmacist)", duration: "4 years", scope: "Pharmaceuticals, Hospitals, Research" },
                        { name: "B.Sc Nursing", duration: "4 years", scope: "Hospitals, Healthcare, Community Health" },
                        { name: "Physiotherapy", duration: "4.5 years", scope: "Rehabilitation Centers, Sports Medicine" },
                        { name: "Veterinary Science", duration: "5 years", scope: "Animal Healthcare, Research, Agriculture" },
                        { name: "Ayurveda", duration: "5.5 years", scope: "Traditional Medicine, Wellness Centers, Research" },
                        { name: "Homeopathy", duration: "5.5 years", scope: "Alternative Medicine, Private Practice, Research" },
                        { name: "Occupational Therapy", duration: "4 years", scope: "Rehabilitation, Mental Health, Community Care" },
                        { name: "Speech Therapy", duration: "4 years", scope: "Communication Disorders, Special Education, Healthcare" }
                    ]
                },
                {
                    name: "Pure Sciences",
                    icon: "fa-solid fa-atom",
                    description: "Discover the mysteries of nature",
                    careers: [
                        { name: "B.Sc Physics", duration: "3 years", scope: "Research, Teaching, Technology" },
                        { name: "B.Sc Chemistry", duration: "3 years", scope: "Chemical Industry, Research, Quality Control" },
                        { name: "B.Sc Mathematics", duration: "3 years", scope: "Data Science, Finance, Research" },
                        { name: "B.Sc Biology", duration: "3 years", scope: "Biotechnology, Environmental Science" },
                        { name: "B.Sc Computer Science", duration: "3 years", scope: "Software Development, IT, Data Analysis" },
                        { name: "B.Sc Statistics", duration: "3 years", scope: "Data Analysis, Research, Actuarial Science" },
                        { name: "B.Sc Geology", duration: "3 years", scope: "Mining, Environmental Studies, Research" },
                        { name: "B.Sc Environmental Science", duration: "3 years", scope: "Conservation, Research, Policy Making" },
                        { name: "B.Sc Agriculture", duration: "4 years", scope: "Farming, Research, Agribusiness" },
                        { name: "B.Sc Forensic Science", duration: "3 years", scope: "Crime Investigation, Law Enforcement, Research" }
                    ]
                }
            ]
        },
        commerce: {
            title: "💼 Commerce Stream",
            description: "Master the world of business and finance",
            icon: "fa-solid fa-chart-line",
            color: "from-green-500 to-emerald-500",
            paths: [
                {
                    name: "Business & Management",
                    icon: "fa-solid fa-briefcase",
                    description: "Lead organizations to success",
                    careers: [
                        { name: "BBA (Business Administration)", duration: "3 years", scope: "Management, Entrepreneurship, Consulting" },
                        { name: "B.Com (Commerce)", duration: "3 years", scope: "Accounting, Finance, Banking" },
                        { name: "CA (Chartered Accountant)", duration: "4-5 years", scope: "Auditing, Taxation, Financial Advisory" },
                        { name: "CS (Company Secretary)", duration: "3-4 years", scope: "Corporate Governance, Legal Compliance" },
                        { name: "CMA (Cost Management)", duration: "3-4 years", scope: "Cost Analysis, Budgeting, Financial Planning" },
                        { name: "BBA in Finance", duration: "3 years", scope: "Investment Banking, Financial Analysis, Risk Management" },
                        { name: "BBA in Marketing", duration: "3 years", scope: "Brand Management, Digital Marketing, Sales" },
                        { name: "BBA in HR", duration: "3 years", scope: "Human Resources, Recruitment, Training" },
                        { name: "BBA in Operations", duration: "3 years", scope: "Supply Chain, Logistics, Process Management" },
                        { name: "BBA in International Business", duration: "3 years", scope: "Global Trade, Export-Import, International Marketing" }
                    ]
                },
                {
                    name: "Finance & Banking",
                    icon: "fa-solid fa-coins",
                    description: "Navigate the financial world",
                    careers: [
                        { name: "Banking & Insurance", duration: "3 years", scope: "Banks, Insurance Companies, Financial Services" },
                        { name: "Investment Banking", duration: "3-4 years", scope: "Investment Firms, Stock Markets, Portfolio Management" },
                        { name: "Financial Planning", duration: "3 years", scope: "Financial Advisory, Wealth Management" },
                        { name: "Actuarial Science", duration: "3-4 years", scope: "Risk Assessment, Insurance, Pension Funds" },
                        { name: "Economics", duration: "3 years", scope: "Policy Making, Research, Economic Analysis" }
                    ]
                },
                {
                    name: "Marketing & Sales",
                    icon: "fa-solid fa-bullhorn",
                    description: "Connect products with people",
                    careers: [
                        { name: "Digital Marketing", duration: "3 years", scope: "Social Media, SEO, Content Marketing" },
                        { name: "Sales Management", duration: "3 years", scope: "Sales Teams, Business Development" },
                        { name: "Advertising", duration: "3 years", scope: "Creative Agencies, Brand Management" },
                        { name: "Retail Management", duration: "3 years", scope: "Retail Chains, E-commerce, Supply Chain" },
                        { name: "Public Relations", duration: "3 years", scope: "Corporate Communications, Media Relations" }
                    ]
                }
            ]
        },
        arts: {
            title: "🎨 Arts & Humanities",
            description: "Express creativity and understand society",
            icon: "fa-solid fa-palette",
            color: "from-purple-500 to-pink-500",
            paths: [
                {
                    name: "Literature & Languages",
                    icon: "fa-solid fa-book",
                    description: "Master the power of words",
                    careers: [
                        { name: "English Literature", duration: "3 years", scope: "Teaching, Writing, Publishing, Media" },
                        { name: "Journalism & Mass Communication", duration: "3 years", scope: "News Media, Broadcasting, Digital Media" },
                        { name: "Foreign Languages", duration: "3 years", scope: "Translation, Diplomacy, International Business" },
                        { name: "Creative Writing", duration: "3 years", scope: "Content Creation, Scriptwriting, Publishing" },
                        { name: "Linguistics", duration: "3 years", scope: "Research, Language Technology, Education" }
                    ]
                },
                {
                    name: "Social Sciences",
                    icon: "fa-solid fa-users",
                    description: "Understand human society",
                    careers: [
                        { name: "Psychology", duration: "3 years", scope: "Counseling, HR, Research, Clinical Practice" },
                        { name: "Sociology", duration: "3 years", scope: "Social Work, Research, Policy Making" },
                        { name: "Political Science", duration: "3 years", scope: "Government, Public Administration, Law" },
                        { name: "History", duration: "3 years", scope: "Teaching, Research, Museums, Archives" },
                        { name: "Geography", duration: "3 years", scope: "Urban Planning, Environmental Studies, GIS" }
                    ]
                },
                {
                    name: "Fine Arts & Design",
                    icon: "fa-solid fa-paintbrush",
                    description: "Create visual masterpieces",
                    careers: [
                        { name: "Fine Arts", duration: "4 years", scope: "Artist, Art Teacher, Gallery Curator" },
                        { name: "Graphic Design", duration: "3-4 years", scope: "Advertising, Web Design, Branding" },
                        { name: "Fashion Design", duration: "4 years", scope: "Fashion Industry, Textile Design, Styling" },
                        { name: "Interior Design", duration: "4 years", scope: "Architecture, Real Estate, Event Design" },
                        { name: "Animation & Multimedia", duration: "3-4 years", scope: "Film Industry, Gaming, Advertising" }
                    ]
                }
            ]
        },
        vocational: {
            title: "🔧 Vocational & Technical",
            description: "Learn practical skills for immediate employment",
            icon: "fa-solid fa-tools",
            color: "from-orange-500 to-red-500",
            paths: [
                {
                    name: "IT & Computer",
                    icon: "fa-solid fa-laptop-code",
                    description: "Master digital technology",
                    careers: [
                        { name: "Diploma in Computer Engineering", duration: "3 years", scope: "Software Development, IT Support, Networking" },
                        { name: "Web Development", duration: "1-2 years", scope: "Frontend/Backend Development, Freelancing" },
                        { name: "Cybersecurity", duration: "2-3 years", scope: "Information Security, Ethical Hacking" },
                        { name: "Data Analytics", duration: "1-2 years", scope: "Business Intelligence, Data Science" },
                        { name: "Digital Marketing", duration: "1-2 years", scope: "Social Media, SEO, Content Marketing" }
                    ]
                },
                {
                    name: "Healthcare & Paramedical",
                    icon: "fa-solid fa-heart-pulse",
                    description: "Support healthcare professionals",
                    careers: [
                        { name: "Medical Lab Technology", duration: "2-3 years", scope: "Hospitals, Diagnostic Centers, Research" },
                        { name: "Radiology Technology", duration: "2-3 years", scope: "Hospitals, Imaging Centers, Equipment Operation" },
                        { name: "Physiotherapy Assistant", duration: "2 years", scope: "Rehabilitation Centers, Sports Medicine" },
                        { name: "Pharmacy Assistant", duration: "2 years", scope: "Pharmacies, Hospitals, Pharmaceutical Companies" },
                        { name: "Emergency Medical Services", duration: "1-2 years", scope: "Ambulance Services, Emergency Response" }
                    ]
                },
                {
                    name: "Skilled Trades",
                    icon: "fa-solid fa-hammer",
                    description: "Master hands-on skills",
                    careers: [
                        { name: "Electrician", duration: "2-3 years", scope: "Construction, Maintenance, Industrial" },
                        { name: "Plumber", duration: "2 years", scope: "Construction, Maintenance, Service Industry" },
                        { name: "Welder", duration: "1-2 years", scope: "Manufacturing, Construction, Automotive" },
                        { name: "Automobile Mechanic", duration: "2-3 years", scope: "Auto Repair, Service Centers, Dealerships" },
                        { name: "Carpenter", duration: "2-3 years", scope: "Construction, Furniture Making, Interior Design" }
                    ]
                }
            ]
        }
    }

    const quickLinks = [
        {
            id: 1,
            title: "Time Tables",
            description: "View schedules from different universities",
            icon: "fa-solid fa-calendar-days",
            color: "#8B5CF6",
            bgColor: "from-purple-500 to-purple-600",
            category: "timetable"
        },
        {
            id: 2,
            title: "Career Roadmaps",
            description: "Explore career paths and opportunities",
            icon: "fa-solid fa-route",
            color: "#3B82F6",
            bgColor: "from-blue-500 to-blue-600",
            category: "career"
        },
        {
            id: 3,
            title: "Notifications",
            description: "Stay updated with latest news",
            icon: "fa-solid fa-newspaper",
            color: "#10B981",
            bgColor: "from-emerald-500 to-emerald-600",
            category: "notifications"
        },
        {
            id: 4,
            title: "Results",
            description: "Check academic performance",
            icon: "fa-solid fa-chart-line",
            color: "#F59E0B",
            bgColor: "from-amber-500 to-amber-600",
            category: "results"
        }
    ]

    useEffect(() => {
        // Ensure we're on the client side and DOM is available
        if (typeof window === 'undefined' || !document) return

        try {
            // GSAP animations for cards
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    gsap.fromTo(card,
                        {
                            y: 60,
                            opacity: 0,
                            scale: 0.9
                        },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.6,
                            ease: "back.out(1.7)",
                            delay: index * 0.1,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%",
                                end: "bottom 15%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    )
                }
            })
        } catch (error) {
            console.error('GSAP animation error:', error)
        }

        // Cleanup function to kill ScrollTrigger instances
        return () => {
            try {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill())
            } catch (error) {
                console.error('ScrollTrigger cleanup error:', error)
            }
        }
    }, [])

    return (
        <section className="relative py-20 overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Access</span>
                    </motion.h2>

                    <motion.p
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Hover over cards to see available documents with blinking links
                    </motion.p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickLinks.map((link, index) => (
                        <motion.div
                            key={link.id}
                            ref={el => cardsRef.current[index] = el}
                            className="group cursor-pointer relative"
                            whileHover={{ y: -8 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onMouseEnter={() => {
                                if (link.category === 'career') {
                                    handleCareerHover()
                                } else if (link.category) {
                                    setActiveOverlay(link.category)
                                }
                            }}
                            onMouseLeave={() => {
                                if (link.category === 'career') {
                                    handleCareerLeave()
                                } else {
                                    setActiveOverlay(null)
                                }
                            }}
                            onClick={() => {
                                if (link.category === 'career') {
                                    setCareerModal({ isOpen: true })
                                }
                            }}
                        >
                            {/* Card */}
                            <div className="relative h-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group-hover:shadow-2xl transition-all duration-300 hover:border-gray-200">
                                {/* Icon Container */}
                                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${link.bgColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                        <i className={`${link.icon} text-white text-2xl`}></i>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {link.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {link.description}
                                    </p>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Overlay - Absolute positioned, appears on hover */}
                            <AnimatePresence>
                                {activeOverlay === link.category && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-200 overflow-hidden"
                                        style={{ height: '400px' }}
                                    >
                                        {/* Overlay Header */}
                                        <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                            <h4 className="font-bold text-lg">
                                                {documentSections[link.category].title}
                                            </h4>
                                            <p className="text-sm opacity-90">
                                                {documentSections[link.category].description}
                                            </p>
                                        </div>

                                        {/* Auto-scrolling Content - Negative Y scroll in loop */}
                                        <div
                                            ref={scrollContainerRef}
                                            className="p-4 overflow-y-auto h-full relative scrollbar-hide"
                                            style={{
                                                height: 'calc(100% - 80px)',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none'
                                            }}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                            onWheel={handleWheelScroll}
                                        >
                                            {/* Auto-scrolling container */}
                                            <div
                                                className={`space-y-2 ${!isUserScrolling ? 'animate-scroll-up' : ''}`}
                                                style={{
                                                    animationDuration: '15s',
                                                    animationPlayState: isUserScrolling ? 'paused' : 'running'
                                                }}
                                            >
                                                {/* First set of documents */}
                                                {documentSections[link.category].documents.map((doc, docIndex) => (
                                                    <motion.div
                                                        key={doc.name}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: docIndex * 0.1 }}
                                                        className="group"
                                                    >
                                                        <motion.button
                                                            onClick={() => handleDocumentClick(doc.name, doc.file)}
                                                            onMouseEnter={() => handleDocumentHover(doc.name)}
                                                            className={`w-full p-2 rounded-lg border-2 transition-all duration-300 text-left ${blinkingLinks.has(doc.name)
                                                                ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg'
                                                                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                                                                }`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center mr-2">
                                                                    <i className={`fa-solid ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-image'} text-white text-sm`}></i>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className={`font-semibold text-xs ${blinkingLinks.has(doc.name)
                                                                        ? 'text-purple-700 animate-pulse'
                                                                        : 'text-gray-800'
                                                                        }`}>
                                                                        {blinkingLinks.has(doc.name) ? '🔗 ' : ''}{doc.name}
                                                                    </h5>
                                                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                                                        {doc.description}
                                                                    </p>
                                                                </div>
                                                                <div className={`text-lg ${blinkingLinks.has(doc.name)
                                                                    ? 'animate-bounce text-purple-600'
                                                                    : 'text-gray-400 group-hover:text-purple-500'
                                                                    }`}>
                                                                    <i className="fa-solid fa-download"></i>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    </motion.div>
                                                ))}

                                                {/* Duplicate set for seamless loop */}
                                                {documentSections[link.category].documents.map((doc, docIndex) => (
                                                    <motion.div
                                                        key={`${doc.name}-duplicate`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: docIndex * 0.1 }}
                                                        className="group"
                                                    >
                                                        <motion.button
                                                            onClick={() => handleDocumentClick(doc.name, doc.file)}
                                                            onMouseEnter={() => handleDocumentHover(doc.name)}
                                                            className={`w-full p-2 rounded-lg border-2 transition-all duration-300 text-left ${blinkingLinks.has(doc.name)
                                                                ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg'
                                                                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                                                                }`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center mr-2">
                                                                    <i className={`fa-solid ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-image'} text-white text-sm`}></i>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className={`font-semibold text-xs ${blinkingLinks.has(doc.name)
                                                                        ? 'text-purple-700 animate-pulse'
                                                                        : 'text-gray-800'
                                                                        }`}>
                                                                        {blinkingLinks.has(doc.name) ? '🔗 ' : ''}{doc.name}
                                                                    </h5>
                                                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                                                        {doc.description}
                                                                    </p>
                                                                </div>
                                                                <div className={`text-lg ${blinkingLinks.has(doc.name)
                                                                    ? 'animate-bounce text-purple-600'
                                                                    : 'text-gray-400 group-hover:text-purple-500'
                                                                    }`}>
                                                                    <i className="fa-solid fa-download"></i>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <motion.button
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        View All Resources
                    </motion.button>
                </motion.div>
            </div>

            {/* Career Roadmap Modal */}
            <AnimatePresence>
                {careerModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setCareerModal({ isOpen: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">🎯 Career Roadmap After 10th</h3>
                                        <p className="text-sm opacity-90">Explore diverse career paths and opportunities</p>
                                    </div>
                                    <motion.button
                                        onClick={() => setCareerModal({ isOpen: false })}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Tree Diagram Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="relative">
                                    {/* Root Node */}
                                    <div className="flex justify-center mb-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 shadow-2xl border-4 border-white"
                                        >
                                            <div className="text-center">
                                                <i className="fa-solid fa-graduation-cap text-4xl mb-3"></i>
                                                <h3 className="text-2xl font-bold">Career Tree</h3>
                                                <p className="text-sm opacity-90">Choose Your Path After 10th</p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Main Branches */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {Object.entries(careerOptions).map(([key, stream], streamIndex) => (
                                            <motion.div
                                                key={key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + (streamIndex * 0.1) }}
                                                className="relative"
                                            >
                                                {/* Branch Line */}
                                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-purple-600 to-transparent"></div>

                                                {/* Main Branch Node */}
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => toggleBranch(key)}
                                                    className={`relative cursor-pointer bg-gradient-to-br ${stream.color} text-white rounded-2xl p-6 shadow-xl border-4 border-white hover:shadow-2xl transition-all duration-300 ${expandedBranches.has(key) ? 'ring-4 ring-yellow-300 ring-opacity-50' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                                                                <i className={`${stream.icon} text-white text-2xl`}></i>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xl font-bold">{stream.title}</h4>
                                                                <p className="text-sm opacity-90">{stream.description}</p>
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            animate={{ rotate: expandedBranches.has(key) ? 180 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
                                                        >
                                                            <i className="fa-solid fa-chevron-down text-white"></i>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>

                                                {/* Sub-branches (Paths) */}
                                                <AnimatePresence>
                                                    {expandedBranches.has(key) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="mt-6 space-y-4"
                                                        >
                                                            {/* Branch Lines */}
                                                            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                                                            {stream.paths.map((path, pathIndex) => (
                                                                <motion.div
                                                                    key={pathIndex}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: pathIndex * 0.1 }}
                                                                    className="relative ml-8"
                                                                >
                                                                    {/* Path Line */}
                                                                    <div className="absolute -left-8 top-6 w-6 h-1 bg-gray-300"></div>
                                                                    <div className="absolute -left-8 top-5 w-2 h-2 bg-gray-400 rounded-full"></div>

                                                                    {/* Path Node */}
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => togglePath(`${key}-${pathIndex}`)}
                                                                        className={`cursor-pointer bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${expandedPaths.has(`${key}-${pathIndex}`) ? 'border-blue-400 bg-blue-50' : ''
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center">
                                                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                                                                    <i className={`${path.icon} text-white text-sm`}></i>
                                                                                </div>
                                                                                <div>
                                                                                    <h5 className="font-semibold text-gray-800">{path.name}</h5>
                                                                                    <p className="text-xs text-gray-600">{path.description}</p>
                                                                                </div>
                                                                            </div>
                                                                            <motion.div
                                                                                animate={{ rotate: expandedPaths.has(`${key}-${pathIndex}`) ? 90 : 0 }}
                                                                                transition={{ duration: 0.3 }}
                                                                                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"
                                                                            >
                                                                                <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                                                                            </motion.div>
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* Career Options (Leaves) */}
                                                                    <AnimatePresence>
                                                                        {expandedPaths.has(`${key}-${pathIndex}`) && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                animate={{ opacity: 1, height: "auto" }}
                                                                                exit={{ opacity: 0, height: 0 }}
                                                                                transition={{ duration: 0.3 }}
                                                                                className="mt-3 ml-4 space-y-2"
                                                                            >
                                                                                {(showAllCareers.has(`${key}-${pathIndex}`) ? path.careers : path.careers.slice(0, 3)).map((career, careerIndex) => (
                                                                                    <motion.div
                                                                                        key={careerIndex}
                                                                                        initial={{ opacity: 0, x: -10 }}
                                                                                        animate={{ opacity: 1, x: 0 }}
                                                                                        transition={{ delay: careerIndex * 0.05 }}
                                                                                        className="relative"
                                                                                    >
                                                                                        {/* Leaf Line */}
                                                                                        <div className="absolute -left-4 top-3 w-3 h-1 bg-gray-200"></div>
                                                                                        <div className="absolute -left-4 top-2 w-1 h-1 bg-gray-300 rounded-full"></div>

                                                                                        {/* Career Leaf */}
                                                                                        <motion.div
                                                                                            whileHover={{ scale: 1.02, x: 5 }}
                                                                                            className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all duration-300"
                                                                                        >
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex-1">
                                                                                                    <h6 className="font-medium text-sm text-gray-800">{career.name}</h6>
                                                                                                    <p className="text-xs text-gray-600 mt-1">{career.scope}</p>
                                                                                                </div>
                                                                                                <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                                                                                    {career.duration}
                                                                                                </div>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    </motion.div>
                                                                                ))}

                                                                                {/* View More Button */}
                                                                                {path.careers.length > 3 && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0 }}
                                                                                        animate={{ opacity: 1 }}
                                                                                        transition={{ delay: 0.2 }}
                                                                                        className="mt-3 ml-4"
                                                                                    >
                                                                                        <motion.button
                                                                                            onClick={() => toggleShowAllCareers(`${key}-${pathIndex}`)}
                                                                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300"
                                                                                            whileHover={{ scale: 1.05 }}
                                                                                            whileTap={{ scale: 0.95 }}
                                                                                        >
                                                                                            <i className={`fa-solid ${showAllCareers.has(`${key}-${pathIndex}`) ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
                                                                                            {showAllCareers.has(`${key}-${pathIndex}`)
                                                                                                ? 'Show Less'
                                                                                                : `View ${path.careers.length - 3} More Options`
                                                                                            }
                                                                                        </motion.button>
                                                                                    </motion.div>
                                                                                )}
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-8 text-center"
                                >
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Need Career Guidance?</h4>
                                        <p className="text-gray-600 text-sm mb-4">Our counselors are here to help you choose the right path</p>
                                        <motion.button
                                            onClick={handleCareerCounselingCall}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="fa-solid fa-phone mr-2"></i>
                                            Call for Career Counseling
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PDF Viewer Modal */}
            <AnimatePresence>
                {pdfViewer.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setPdfViewer({ isOpen: false, file: null, name: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* PDF Viewer Header */}
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                <div>
                                    <h3 className="text-xl font-bold">{pdfViewer.name}</h3>
                                    <p className="text-sm opacity-90">Document Viewer</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {/* Download Button */}
                                    <motion.button
                                        onClick={() => {
                                            const fileUrl = `/${pdfViewer.file}`
                                            const link = document.createElement('a')
                                            link.href = fileUrl
                                            link.download = pdfViewer.file
                                            link.target = '_blank'
                                            link.style.display = 'none'
                                            document.body.appendChild(link)
                                            link.click()
                                            document.body.removeChild(link)
                                        }}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <i className="fa-solid fa-download mr-2"></i>
                                        Download
                                    </motion.button>

                                    {/* Close Button */}
                                    <motion.button
                                        onClick={() => setPdfViewer({ isOpen: false, file: null, name: null })}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </motion.button>
                                </div>
                            </div>

                            {/* PDF Content */}
                            <div className="h-[calc(90vh-120px)] overflow-hidden">
                                {pdfViewer.file.endsWith('.pdf') ? (
                                    <iframe
                                        src={`/${pdfViewer.file}#toolbar=1&navpanes=1&scrollbar=1`}
                                        className="w-full h-full border-0"
                                        title={pdfViewer.name}
                                        onError={(e) => {
                                            console.error('PDF loading error:', e)
                                        }}
                                        onLoad={() => {
                                            console.log('PDF loaded successfully:', pdfViewer.file)
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={`/${pdfViewer.file}`}
                                            alt={pdfViewer.name}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                console.error('Image loading error:', e)
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully:', pdfViewer.file)
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default QuickLinks