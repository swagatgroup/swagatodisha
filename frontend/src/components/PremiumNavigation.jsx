import {useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion'

const PremiumNavigation = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { name: 'Home', href: '#home' },
        { name: 'Programs', href: '#programs' },
        { name: 'About', href: '#about' },
        { name: 'Institutions', href: '#institutions' },
        { name: 'Admissions', href: '#admissions' },
        { name: 'Contact', href: '#contact' }
    ]

    const smoothScrollTo = (href) => {
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-all duration-300`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Swagat</h1>
                            <p className="text-xs text-gray-600">Group of Institutions</p>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <motion.button
                                key={item.name}
                                onClick={() => smoothScrollTo(item.href)}
                                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300 relative group"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                            </motion.button>
                        ))}

                        {/* CTA Button */}
                        <motion.button
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            whileHover={{ y: -2 }}
                        >
                            Apply Now
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                        onClick={() => setIsOpen(!isOpen)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="lg:hidden bg-white border-t border-gray-200"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 py-4 space-y-4">
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    onClick={() => {
                                        smoothScrollTo(item.href)
                                        setIsOpen(false)
                                    }}
                                    className="block text-gray-700 hover:text-purple-600 font-medium py-2 transition-colors duration-300 w-full text-left"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    {item.name}
                                </motion.button>
                            ))}

                            {/* Mobile CTA Button */}
                            <motion.button
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Apply Now
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default PremiumNavigation
