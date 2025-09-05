import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Header from '../Header'
import Footer from '../Footer'

const SchoolPageTemplate = ({
    schoolName,
    location,
    description,
    features,
    programs,
    facilities,
    achievements,
    contactInfo,
    seoData
}) => {
    useEffect(() => {
        // Smooth scroll to top on page load
        window.scrollTo(0, 0)
    }, [])

    return (
        <>
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.url} />
                <meta property="og:image" content={seoData.image} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.image} />
                <link rel="canonical" href={seoData.url} />
                <script type="application/ld+json">
                    {JSON.stringify(seoData.structuredData)}
                </script>
            </Helmet>

            <div className="min-h-screen bg-white">
                <Header />

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-50/20 to-blue-50/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-8 shadow-2xl">
                                <i className="fa-solid fa-school text-white text-4xl"></i>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                                {schoolName}
                            </h1>

                            <p className="text-2xl text-gray-600 mb-4">
                                📍 {location}
                            </p>

                            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                                {description}
                            </p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-4"
                            >
                                <a
                                    href="#programs"
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Explore Programs
                                </a>
                                <a
                                    href="#contact"
                                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Contact Us
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{schoolName}</span>?
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section id="programs" className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Programs</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Comprehensive educational programs designed to nurture young minds and prepare them for the future
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {programs.map((program, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="text-3xl mb-4">{program.icon}</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{program.name}</h3>
                                    <p className="text-gray-600 mb-4">{program.description}</p>
                                    <ul className="space-y-2">
                                        {program.subjects.map((subject, subIndex) => (
                                            <li key={subIndex} className="flex items-center text-gray-600">
                                                <i className="fa-solid fa-check text-purple-600 mr-2"></i>
                                                {subject}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Facilities Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Facilities</span>
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {facilities.map((facility, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                                >
                                    <div className="text-4xl mb-4">{facility.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{facility.name}</h3>
                                    <p className="text-gray-600 text-sm">{facility.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Achievements Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Achievements</span>
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {achievements.map((achievement, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="text-4xl mb-4">{achievement.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{achievement.title}</h3>
                                    <p className="text-gray-600">{achievement.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center text-white"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold mb-6">
                                Get In Touch
                            </h2>
                            <p className="text-xl mb-12 max-w-3xl mx-auto">
                                Ready to join our educational community? Contact us today!
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                                {contactInfo.map((info, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="text-4xl mb-4">{info.icon}</div>
                                        <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                                        <p className="text-lg">{info.value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="mt-12"
                            >
                                <a
                                    href="/"
                                    className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Visit Main Website
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    )
}

export default SchoolPageTemplate
