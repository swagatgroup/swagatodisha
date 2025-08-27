import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToContact } from '../utils/helpers'
import { NAV_ITEMS } from '../utils/constants'

gsap.registerPlugin(ScrollTrigger)

const Header = ({ isNavOpen, setIsNavOpen }) => {
    const [scrolled, setScrolled] = useState(false)
    const [activeHover, setActiveHover] = useState(null)
    const headerRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (scrolled) {
            gsap.to(headerRef.current, {
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                duration: 0.3
            })
        } else {
            gsap.to(headerRef.current, {
                backdropFilter: 'blur(0px)',
                backgroundColor: 'rgba(255, 255, 255, 1)',
                duration: 0.3
            })
        }
    }, [scrolled])

    // Removed logo rotation animation - keeping it clean and professional

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen)
    }

    const navItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    }

    const sidebarVariants = {
        closed: {
            x: '-100%',
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        },
        open: {
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        }
    }

    const overlayVariants = {
        closed: {
            opacity: 0,
            transition: {
                duration: 0.3
            }
        },
        open: {
            opacity: 1,
            transition: {
                duration: 0.3
            }
        }
    }

    const hamburgerLineVariants = {
        closed: {
            rotate: 0,
            y: 0,
            opacity: 1
        },
        open: (i) => ({
            rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
            y: i === 0 ? 8 : i === 2 ? -8 : 0,
            opacity: i === 1 ? 0 : 1,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        })
    }

    return (
        <>
            <motion.header
                ref={headerRef}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-sm'
                    }`}
                style={{
                    backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
                    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)'
                }}
            >
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo/Brand Section */}
                        <div className="flex items-center">
                            {/* Logo Icon */}
                            <div className="relative w-36 h-auto flex items-center justify-center">
                                <img
                                    src="/Swagat Logo.png"
                                    alt="Swagat Group of Institutions"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            {NAV_ITEMS.map((item, index) => (
                                <motion.div
                                    key={index}
                                    custom={index}
                                    variants={navItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    onHoverStart={() => setActiveHover(index)}
                                    onHoverEnd={() => setActiveHover(null)}
                                    className="relative"
                                >
                                    <motion.a
                                        href={item.href}
                                        className="relative px-4 py-2 text-gray-800 font-medium transition-colors duration-300 group"
                                        whileHover={{ y: -2 }}
                                    >
                                        {item.name}

                                        {/* Hover Underline Effect */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: activeHover === index ? "100%" : 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.a>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Apply Now Button */}
                        <motion.div
                            className="hidden lg:block"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.button
                                onClick={scrollToContact}
                                className="relative px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg overflow-hidden group cursor-pointer"
                                whileHover={{
                                    boxShadow: "0 20px 40px -12px rgba(147, 51, 234, 0.5)",
                                    y: -2
                                }}
                            >
                                <span className="relative z-10">Apply Now</span>

                                {/* Button Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.6 }}
                                />
                            </motion.button>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={toggleNav}
                            className="lg:hidden w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg relative"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Animated Hamburger Lines */}
                            <div className="flex flex-col items-center justify-center w-6 h-6">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        custom={i}
                                        variants={hamburgerLineVariants}
                                        animate={isNavOpen ? "open" : "closed"}
                                        className="w-6 h-0.5 bg-white rounded-full mb-1 last:mb-0 origin-center"
                                    />
                                ))}
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isNavOpen && (
                    <>
                        {/* Blurred Background Overlay */}
                        <motion.div
                            variants={overlayVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                            onClick={toggleNav}
                        />

                        {/* Left Sidebar */}
                        <motion.div
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-[70vw] max-w-sm bg-white/95 backdrop-blur-xl border-r border-gray-200/50 z-50 lg:hidden shadow-2xl"
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                                <div className="flex items-center">
                                    <img
                                        src="/Swagat Logo.png"
                                        alt="Swagat Group of Institutions"
                                        className="w-32 h-auto object-contain"
                                    />
                                </div>
                                <button
                                    onClick={toggleNav}
                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
                                >
                                    <i className="fa-solid fa-times text-gray-600"></i>
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {NAV_ITEMS.map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            className="block py-4 px-4 text-gray-800 font-medium rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 text-lg"
                                            whileHover={{ x: 10 }}
                                            onClick={() => setIsNavOpen(false)}
                                        >
                                            {item.name}
                                        </motion.a>
                                    ))}

                                    <motion.button
                                        onClick={() => {
                                            scrollToContact()
                                            setIsNavOpen(false)
                                        }}
                                        className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg cursor-pointer text-lg"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Apply Now
                                    </motion.button>
                                </div>

                                {/* Sidebar Footer */}
                                <div className="mt-12 pt-6 border-t border-gray-200/50">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-4">Connect with us</p>
                                        <div className="flex justify-center space-x-3">
                                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                                <i className="fa-brands fa-facebook-f text-sm"></i>
                                            </a>
                                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                                <i className="fa-brands fa-twitter text-sm"></i>
                                            </a>
                                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                                <i className="fa-brands fa-instagram text-sm"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Header