import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QuickLinks = () => {
    const containerRef = useRef(null)
    const cardsRef = useRef([])
    const [activeOverlay, setActiveOverlay] = useState(null)
    const [blinkingLinks, setBlinkingLinks] = useState(new Set())
    const [pdfViewer, setPdfViewer] = useState({ isOpen: false, file: null, name: null })

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
            bgColor: "from-blue-500 to-blue-600"
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
                            onMouseEnter={() => link.category ? setActiveOverlay(link.category) : null}
                            onMouseLeave={() => setActiveOverlay(null)}
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

                                        {/* Scrollable Content - Negative Y scroll */}
                                        <div
                                            className="p-4 overflow-y-auto h-full"
                                            style={{
                                                height: 'calc(100% - 80px)',
                                                transform: 'translateY(-10px)',
                                                scrollBehavior: 'smooth'
                                            }}
                                        >
                                            <div className="space-y-3">
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
                                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${blinkingLinks.has(doc.name)
                                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg'
                                                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                                                                }`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                                    <i className={`fa-solid ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-image'} text-white text-lg`}></i>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className={`font-semibold text-sm ${blinkingLinks.has(doc.name)
                                                                            ? 'text-purple-700 animate-pulse'
                                                                            : 'text-gray-800'
                                                                        }`}>
                                                                        {blinkingLinks.has(doc.name) ? '🔗 ' : ''}{doc.name}
                                                                    </h5>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {doc.description}
                                                                    </p>
                                                                </div>
                                                                <div className={`text-2xl ${blinkingLinks.has(doc.name)
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
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={`/${pdfViewer.file}`}
                                            alt={pdfViewer.name}
                                            className="max-w-full max-h-full object-contain"
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