import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTACT_INFO } from '../utils/constants';

const FloatingContact = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Hide on dashboard pages
    if (location.pathname.startsWith('/dashboard')) {
        return null;
    }

    // Get the phone number without spaces for the links
    const cleanPhone = CONTACT_INFO.phone.replace(/[^0-9+]/g, '');

    const toggleOpen = () => setIsOpen(!isOpen);

    const whatsappChannelUrl = 'https://whatsapp.com/channel/0029VbCS3Uh6buMNVnhzD10y';
    // Format for wa.me should not have the plus symbol typically, but having country code is needed.
    const whatsappDmUrl = `https://wa.me/${cleanPhone.replace('+', '')}`; 

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3 mb-4 items-end"
                    >
                        {/* Call Button */}
                        <a 
                            href={`tel:${cleanPhone}`}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                            title="Call Us"
                        >
                            <span className="font-medium text-sm pr-2 pl-2 hidden sm:block text-gray-700 dark:text-gray-300">Call Us</span>
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-phone"></i>
                            </div>
                        </a>

                        {/* WhatsApp Channel */}
                        <a 
                            href={whatsappChannelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                            title="WhatsApp Channel"
                        >
                            <span className="font-medium text-sm pr-2 pl-2 hidden sm:block text-gray-700 dark:text-gray-300">Join Channel</span>
                            <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-bullhorn"></i>
                            </div>
                        </a>

                        {/* WhatsApp DM */}
                        <a 
                            href={whatsappDmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                            title="Chat on WhatsApp"
                        >
                            <span className="font-medium text-sm pr-2 pl-2 hidden sm:block text-gray-700 dark:text-gray-300">WhatsApp Chat</span>
                            <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full group-hover:scale-110 transition-transform">
                                <i className="fa-brands fa-whatsapp text-xl"></i>
                            </div>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <button
                onClick={toggleOpen}
                className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                title="Contact Us"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <i className={`fa-solid ${isOpen ? 'fa-plus text-2xl' : 'fa-headset text-2xl'}`}></i>
                </motion.div>
            </button>
        </div>
    );
};

export default FloatingContact;
