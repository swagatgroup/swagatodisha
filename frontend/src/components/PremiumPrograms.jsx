import {useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion'

const PremiumPrograms = () => {
    const [hoveredCard, setHoveredCard] = useState(null)

    const programs = [
        {
            title: "Swagat Public School",
            subtitle: "Primary & Secondary Education",
            description: "Excellence in foundational learning and holistic development approach.",
            features: ["CBSE Curriculum", "Smart Classrooms"],
            duration: "12 Years",
            students: "1000+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            title: "Higher Secondary",
            subtitle: "Science, Commerce & Arts",
            description: "Specialized streams preparing students for higher education and career success.",
            features: ["Science Stream", "Commerce Stream"],
            duration: "2 Years",
            students: "500+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.591a1 1 0 00.941.054l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9 12a1 1 0 01-1-1V9.301l5.5-2.357v2.656a1 1 0 01-.5.866L9 12z" />
                    <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v1H4V3z" />
                </svg>
            ),
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Degree College",
            subtitle: "Bachelor's Programs",
            description: "Comprehensive undergraduate education with industry-aligned curriculum.",
            features: ["B.Com", "B.Sc"],
            duration: "3 Years",
            students: "300+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-green-500 to-emerald-500"
        },
        {
            title: "Engineering College",
            subtitle: "Technical Excellence",
            description: "State-of-the-art engineering programs with industry partnerships and modern labs.",
            features: ["Computer Science", "Mechanical"],
            duration: "4 Years",
            students: "400+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-orange-500 to-red-500"
        },
        {
            title: "Management Institute",
            subtitle: "Business Leadership",
            description: "Developing future business leaders with practical knowledge and industry exposure.",
            features: ["MBA", "BBA"],
            duration: "2-3 Years",
            students: "200+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h6v4H7V6zm8 8v2a1 1 0 11-2 0v-2a1 1 0 112 0zM5 16a1 1 0 11-2 0v-2a1 1 0 112 0v2z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-indigo-500 to-blue-500"
        },
        {
            title: "Research Center",
            subtitle: "Innovation Hub",
            description: "Cutting-edge research facilities fostering innovation and academic excellence.",
            features: ["PhD Programs", "Research Projects"],
            duration: "3-5 Years",
            students: "50+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-teal-500 to-cyan-500"
        },
        {
            title: "Vocational Training",
            subtitle: "Skill Development",
            description: "Practical skill-based programs designed for immediate employment and career growth.",
            features: ["Technical Skills", "Soft Skills"],
            duration: "6-12 Months",
            students: "150+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-yellow-500 to-orange-500"
        },
        {
            title: "International Programs",
            subtitle: "Global Education",
            description: "International collaborations and exchange programs for global exposure and learning.",
            features: ["Study Abroad", "Exchange Programs"],
            duration: "1-2 Years",
            students: "100+",
            icon: (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            ),
            gradient: "from-pink-500 to-purple-500"
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    }

    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-red-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Academic Excellence
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Premium Programs
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover our comprehensive range of educational programs designed to shape future leaders,
                        innovators, and professionals in every field.
                    </p>
                </motion.div>

                {/* Programs Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            className="group relative"
                            variants={cardVariants}
                            onHoverStart={() => setHoveredCard(index)}
                            onHoverEnd={() => setHoveredCard(null)}
                        >
                            <motion.div
                                className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col"
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    rotateY: 5
                                }}
                                style={{
                                    transformStyle: "preserve-3d",
                                    perspective: "1000px"
                                }}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                {/* Icon */}
                                <motion.div
                                    className={`w-12 h-12 bg-gradient-to-br ${program.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {program.icon}
                                </motion.div>

                                {/* Content */}
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">
                                        {program.title}
                                    </h3>
                                    <p className="text-purple-600 font-semibold mb-3 text-sm">
                                        {program.subtitle}
                                    </p>
                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm flex-1">
                                        {program.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-2 mb-4">
                                        {program.features.slice(0, 2).map((feature, featureIndex) => (
                                            <motion.div
                                                key={featureIndex}
                                                className="flex items-center gap-2 text-xs text-gray-600"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: featureIndex * 0.1 }}
                                            >
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                {feature}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Duration</div>
                                            <div className="font-semibold text-gray-900 text-sm">{program.duration}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Students</div>
                                            <div className="font-semibold text-gray-900 text-sm">{program.students}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    initial={false}
                                    animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                                />

                                {/* Floating Elements */}
                                <AnimatePresence>
                                    {hoveredCard === index && (
                                        <>
                                            <motion.div
                                                className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                                                initial={{ scale: 0, rotate: 0 }}
                                                animate={{ scale: 1, rotate: 360 }}
                                                exit={{ scale: 0, rotate: 0 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                            <motion.div
                                                className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full"
                                                initial={{ scale: 0, rotate: 0 }}
                                                animate={{ scale: 1, rotate: -360 }}
                                                exit={{ scale: 0, rotate: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                            />
                                        </>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <motion.button
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Explore All Programs
                    </motion.button>
                    <p className="text-gray-600 mt-4">
                        Ready to start your educational journey? Contact our admissions team today!
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default PremiumPrograms
