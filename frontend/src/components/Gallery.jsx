import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [filter, setFilter] = useState('all')
    const containerRef = useRef(null)
    const imagesRef = useRef([])

    const galleryImages = [
        '/slider001 SO.jpg',
        '/slider002 SO.jpg',
        '/slider003 SO.jpg',
        '/slider004 SO.jpg',
        '/Milestone 001.jpg',
        '/chairman.jpg',
        '/mnt 002.jpg',
        '/mnt 003.jpg',
        '/mnt 004.jpg',
        '/chairman-rk.jpg',
        '/mnt 006.jpg',
        '/cmsg img 01.jpg'
    ]

    const categories = [
        { id: 'all', name: 'All', icon: 'fa-images' },
        { id: 'campus', name: 'Campus', icon: 'fa-building' },
        { id: 'events', name: 'Events', icon: 'fa-calendar' },
        { id: 'people', name: 'People', icon: 'fa-users' }
    ]

    useEffect(() => {
        // GSAP animations for gallery items
        imagesRef.current.forEach((item, index) => {
            gsap.fromTo(item,
                {
                    y: 100,
                    opacity: 0,
                    scale: 0.8,
                    rotationY: -45
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            )
        })
    }, [])

    const openModal = (image) => {
        setSelectedImage(image)
    }

    const closeModal = () => {
        setSelectedImage(null)
    }

    const filteredImages = filter === 'all' ? galleryImages : galleryImages

    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
        hover: {
            y: -10,
            scale: 1.05,
            rotateY: 5,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    }

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "back.out(1.7)"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: {
                duration: 0.3
            }
        }
    }

    const filterVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    return (
        <>
            <section id="gallery" className="relative py-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h2
                            className="text-4xl md:text-6xl font-bold text-gray-800 mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Our <span className="text-purple-600">Gallery</span>
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Explore the vibrant life and beautiful moments at Swagat Group of Institutions
                        </motion.p>
                    </motion.div>

                    {/* Filter Tabs */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-4 mb-12"
                        variants={filterVariants}
                        initial="hidden"
                        whileInView="visible"
                    >
                        {categories.map((category) => (
                            <motion.button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${filter === category.id
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <i className={`fa-solid ${category.icon}`}></i>
                                {category.name}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={index}
                                ref={el => imagesRef.current[index] = el}
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="visible"
                                whileHover="hover"
                                className="relative group cursor-pointer"
                                onClick={() => openModal(image)}
                            >
                                {/* Image Container */}
                                <motion.div
                                    className="relative aspect-square rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500"
                                    whileHover={{
                                        boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.4)"
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`Gallery Image ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Overlay */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    />

                                    {/* Hover Icon */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileHover={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <i className="fa-solid fa-expand text-purple-600 text-2xl"></i>
                                        </div>
                                    </motion.div>

                                    {/* Image Info */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        initial={{ y: 20 }}
                                        whileHover={{ y: 0 }}
                                    >
                                    </motion.div>
                                </motion.div>

                                {/* Glow Effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ backgroundColor: "#8b5cf6" }}
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 0.3 }}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <motion.div
                        className="text-center mt-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <motion.button
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View More Photos
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Gallery Image</h3>
                                <motion.button
                                    onClick={closeModal}
                                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <i className="fa-solid fa-times text-white text-xl"></i>
                                </motion.button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="relative">
                                    <img
                                        src={selectedImage}
                                        alt="Gallery Image"
                                        className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
                                    />

                                    {/* Navigation Arrows */}
                                    <motion.button
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                                        whileHover={{ scale: 1.1, x: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <i className="fa-solid fa-chevron-left text-xl"></i>
                                    </motion.button>

                                    <motion.button
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                                        whileHover={{ scale: 1.1, x: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <i className="fa-solid fa-chevron-right text-xl"></i>
                                    </motion.button>
                                </div>

                                {/* Image Info */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-600">Click outside to close</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Gallery
