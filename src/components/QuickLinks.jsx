import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QuickLinks = () => {
    const containerRef = useRef(null)
    const cardsRef = useRef([])

    const quickLinks = [
        {
            id: 1,
            title: "Time Table",
            description: "View class schedules and academic timings",
            icon: "fa-solid fa-calendar-days",
            color: "#8B5CF6",
            bgColor: "from-purple-500 to-purple-600"
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
            bgColor: "from-emerald-500 to-emerald-600"
        },
        {
            id: 4,
            title: "Results",
            description: "Check your academic performance",
            icon: "fa-solid fa-chart-line",
            color: "#F59E0B",
            bgColor: "from-amber-500 to-amber-600"
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
        <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
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
        </section>
    )
}

export default QuickLinks
