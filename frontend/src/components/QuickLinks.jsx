import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QuickLinks = () => {
    const containerRef = useRef(null)
    const cardsRef = useRef([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [blinkingLinks, setBlinkingLinks] = useState(new Set())

    // Document categories based on the files in quickLinks
    const documentSections = {
        timetable: {
            title: "📅 Time Table & Schedules",
            description: "Academic schedules and important dates",
            documents: [
                {
                    name: "Date Sheet",
                    file: "Date-Sheet.pdf",
                    type: "pdf",
                    description: "Examination schedule and important dates"
                },
                {
                    name: "OSBME Information Booklet",
                    file: "OSBME-Information-Booklet.pdf",
                    type: "pdf",
                    description: "Complete information about OSBME programs"
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
                }
            ]
        }
    }

    // Old-school marquee blinking effect
    const startBlinking = (documentName) => {
        setBlinkingLinks(prev => new Set([...prev, documentName]))
        setTimeout(() => {
            setBlinkingLinks(prev => {
                const newSet = new Set(prev)
                newSet.delete(documentName)
                return newSet
            })
        }, 2000) // Blink for 2 seconds
    }

    const handleDocumentClick = (documentName, fileName) => {
        startBlinking(documentName)

        console.log('=== DOWNLOAD ATTEMPT ===')
        console.log('Document:', documentName)
        console.log('File:', fileName)

        // Show alert to confirm function is called
        alert(`Downloading: ${fileName}`)

        // Simple and reliable approach
        const fileUrl = `/${fileName}`
        console.log('File URL:', fileUrl)

        // Method 1: Direct window.open (most reliable)
        try {
            console.log('Opening file in new tab...')
            window.open(fileUrl, '_blank')
            console.log('✅ File opened successfully')
        } catch (error) {
            console.log('❌ Window.open failed:', error)
        }

        // Method 2: Create download link (backup)
        setTimeout(() => {
            try {
                console.log('Creating download link...')
                const link = document.createElement('a')
                link.href = fileUrl
                link.download = fileName
                link.target = '_blank'
                link.style.display = 'none'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                console.log('✅ Download link created and clicked')
            } catch (error) {
                console.log('❌ Download link failed:', error)
            }
        }, 100)
    }

    const handleDocumentHover = (documentName) => {
        startBlinking(documentName)
    }

    const quickLinks = [
        {
            id: 1,
            title: "Time Table",
            description: "View class schedules and academic timings",
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
            title: "Important Notifications",
            description: "Stay updated with latest news and updates",
            icon: "fa-solid fa-newspaper",
            color: "#10B981",
            bgColor: "from-emerald-500 to-emerald-600",
            category: "notifications"
        },
        {
            id: 4,
            title: "Results",
            description: "Check your academic performance",
            icon: "fa-solid fa-chart-line",
            color: "#F59E0B",
            bgColor: "from-amber-500 to-amber-600",
            category: "results"
        }
    ]

    useEffect(() => {
        // GSAP animations for cards
        cardsRef.current.forEach((card, index) => {
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
                        Essential resources and information at your fingertips
                    </motion.p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickLinks.map((link, index) => (
                        <motion.div
                            key={link.id}
                            ref={el => cardsRef.current[index] = el}
                            className="group cursor-pointer"
                            whileHover={{ y: -8 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onClick={() => link.category ? setActiveCategory(link.category) : null}
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

            {/* Documents Section */}
            <AnimatePresence>
                {activeCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className="mt-16"
                    >
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {documentSections[activeCategory].title}
                                </h3>
                                <p className="text-gray-600">
                                    {documentSections[activeCategory].description}
                                </p>
                            </div>

                            {/* Documents Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {documentSections[activeCategory].documents.map((doc, index) => (
                                    <motion.div
                                        key={doc.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group"
                                    >
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                                            {/* Document Icon */}
                                            <div className="flex items-center mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                                                    <i className={`fa-solid ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-image'} text-white text-xl`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 text-lg">
                                                        {doc.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {doc.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Download Button with Marquee Effect */}
                                            <motion.button
                                                onClick={() => handleDocumentClick(doc.name, doc.file)}
                                                onMouseEnter={() => handleDocumentHover(doc.name)}
                                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${blinkingLinks.has(doc.name)
                                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse shadow-lg'
                                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md'
                                                    }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                animate={blinkingLinks.has(doc.name) ? {
                                                    boxShadow: [
                                                        '0 0 0 0 rgba(251, 191, 36, 0.7)',
                                                        '0 0 0 10px rgba(251, 191, 36, 0)',
                                                        '0 0 0 0 rgba(251, 191, 36, 0)'
                                                    ]
                                                } : {}}
                                                transition={{ duration: 0.6, repeat: blinkingLinks.has(doc.name) ? 3 : 0 }}
                                            >
                                                <i className="fa-solid fa-download mr-2"></i>
                                                {blinkingLinks.has(doc.name) ? '📥 Downloading...' : '📥 Download Document'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="text-center mt-8">
                            <motion.button
                                onClick={() => setActiveCategory(null)}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <i className="fa-solid fa-arrow-up mr-2"></i>
                                Back to Quick Links
                            </motion.button>
                        </div>

                        {/* Old School Style Notice */}
                        <motion.div
                            className="mt-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4 inline-block">
                                <p className="text-yellow-800 font-semibold">
                                    <i className="fa-solid fa-star mr-2"></i>
                                    Click on any document to download! Links will blink like the good old days! ✨
                                </p>
                            </div>

                            {/* Debug Test Buttons */}
                            <div className="mt-4 space-x-2">
                                <button
                                    onClick={() => {
                                        console.log('=== COMPREHENSIVE FILE TEST ===')
                                        const testFiles = [
                                            'Date-Sheet.pdf',
                                            'OSBME-Information-Booklet.pdf',
                                            'Declaration for no  minimum qualification.pdf'
                                        ]

                                        testFiles.forEach((file, index) => {
                                            setTimeout(() => {
                                                console.log(`Testing ${file}...`)
                                                const testUrl = `${window.location.origin}/${file}`
                                                console.log('Test URL:', testUrl)

                                                fetch(testUrl, { method: 'HEAD' })
                                                    .then(response => {
                                                        console.log(`${file}: ${response.status} ${response.statusText}`)
                                                        if (response.ok) {
                                                            console.log(`✅ ${file} is accessible`)
                                                        } else {
                                                            console.log(`❌ ${file} not accessible`)
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.log(`❌ ${file} error:`, error)
                                                    })
                                            }, index * 1000)
                                        })

                                        alert('Check console for detailed file access test results!')
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                    🔧 Test All Files
                                </button>

                                <button
                                    onClick={() => {
                                        console.log('=== DIRECT URL TEST ===')
                                        const testUrl = `${window.location.origin}/Date-Sheet.pdf`
                                        console.log('Opening direct URL:', testUrl)
                                        window.open(testUrl, '_blank')
                                    }}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                >
                                    🌐 Test Direct URL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default QuickLinks
