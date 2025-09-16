import React, { useState, useEffect, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { scrollToContact, scrollToSection } from '../utils/helpers'
import { NAV_ITEMS } from '../utils/constants'
import DarkModeToggle from './shared/DarkModeToggle'

gsap.registerPlugin(ScrollTrigger)

const Header = ({ isNavOpen, setIsNavOpen }) => {
    const [scrolled, setScrolled] = useState(false)
    const headerRef = useRef(null)

    // Disabled scroll-based navbar changes to keep it simple and consistent
    // useEffect(() => {
    //     const handleScroll = () => {
    //         setScrolled(window.scrollY > 50)
    //     }

    //     window.addEventListener('scroll', handleScroll)
    //     return () => window.removeEventListener('scroll', handleScroll)
    // }, [])

    // useEffect(() => {
    //     if (scrolled) {
    //         gsap.to(headerRef.current, {
    //             backdropFilter: 'blur(20px)',
    //             backgroundColor: 'rgba(255, 255, 255, 0.95)',
    //             duration: 0.3
    //         })
    //     } else {
    //         gsap.to(headerRef.current, {
    //             backdropFilter: 'blur(0px)',
    //             backgroundColor: 'rgba(255, 255, 255, 1)',
    //             duration: 0.3
    //         })
    //     }
    // }, [scrolled])

    // Removed logo rotation animation - keeping it clean and professional

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen)
    }

    const handleNavClick = (href) => {
        if (href.startsWith('#')) {
            // Smooth scroll to section
            const sectionId = href.substring(1)
            scrollToSection(sectionId)
            setIsNavOpen(false) // Close mobile menu
        }
        // For regular links, let the Link component handle navigation
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
            <header
                ref={headerRef}
                className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
            >
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo/Brand Section */}
                        <div className="flex items-center">
                            {/* Logo Icon */}
                            <div className="relative w-36 h-auto flex items-center justify-center">
                                <img
                                    src="/Swagat_Logo.png"
                                    alt="Swagat Group of Institutions"
                                    className="w-full h-full object-contain dark:brightness-0 dark:invert"
                                />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            {NAV_ITEMS.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative"
                                >
                                    <div
                                        className="relative px-4 py-2 text-gray-800 dark:text-gray-200 font-medium group cursor-pointer"
                                        onClick={() => handleNavClick(item.href)}
                                    >
                                        {item.href.startsWith('#') ? (
                                            <span>{item.name}</span>
                                        ) : (
                                            <Link to={item.href}>
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {/* Dark Mode Toggle */}
                            <DarkModeToggle />
                            <button className="px-6 py-2 text-purple-600 border-2 border-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white">
                                <Link to="/login">Login</Link>
                            </button>

                            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl">
                                <Link to="/register">Register</Link>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleNav}
                            className="lg:hidden w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg relative"
                        >
                            {/* Hamburger Lines */}
                            <div className="flex flex-col items-center justify-center w-6 h-6">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-0.5 bg-white rounded-full mb-1 last:mb-0"
                                    />
                                ))}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Navigation */}
            {isNavOpen && (
                <>
                    {/* Blurred Background Overlay */}
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                        onClick={toggleNav}
                    />

                    {/* Left Sidebar */}
                    <div
                        className="fixed top-0 left-0 h-full w-[70vw] max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 lg:hidden shadow-2xl"
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center">
                                <img
                                    src="/Swagat Logo.png"
                                    alt="Swagat Group of Institutions"
                                    className="w-32 h-auto object-contain dark:brightness-0 dark:invert"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <DarkModeToggle />
                                <button
                                    onClick={toggleNav}
                                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-300"
                                >
                                    <i className="fa-solid fa-times text-gray-600 dark:text-gray-300"></i>
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {NAV_ITEMS.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="block py-4 px-4 text-gray-800 dark:text-gray-200 font-medium rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 text-lg cursor-pointer"
                                        whileHover={{ x: 10 }}
                                        onClick={() => {
                                            handleNavClick(item.href)
                                            setIsNavOpen(false)
                                        }}
                                    >
                                        {item.href.startsWith('#') ? (
                                            <span>{item.name}</span>
                                        ) : (
                                            <Link to={item.href}>
                                                {item.name}
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}

                                <div className="space-y-3 mt-8">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold cursor-pointer text-lg hover:bg-purple-600 hover:text-white transition-all duration-300"
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <Link to="/login">Login</Link>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg cursor-pointer text-lg"
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <Link to="/register">Register</Link>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="mt-12 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect with us</p>
                                    <div className="flex justify-center space-x-3">
                                        <button type="button" aria-label="Facebook" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                            <i className="fa-brands fa-facebook-f text-sm"></i>
                                        </button>
                                        <button type="button" aria-label="Twitter" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                            <i className="fa-brands fa-twitter text-sm"></i>
                                        </button>
                                        <button type="button" aria-label="Instagram" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                            <i className="fa-brands fa-instagram text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            )}
        </>
    )
}

export default Header