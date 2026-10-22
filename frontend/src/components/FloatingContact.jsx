import React, { useState } from 'react'
import { RiPhoneFill, RiMegaphoneFill, RiWhatsappFill, RiAddLine, RiCustomerService2Fill } from '@remixicon/react';;
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
        <div 
            className="fixed bottom-4 right-4 z-40 flex flex-col items-end font-sw-sans sm:bottom-6 sm:right-6"
            style={{ 
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)'
            }}
        >
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
                            className="group flex items-center gap-2 rounded-sw-pill bg-sw-black/90 p-1.5 text-sw-white shadow-sw-soft ring-1 ring-sw-white/15 backdrop-blur-sw-glass transition-colors duration-sw-fast hover:bg-sw-glass"
                            title="Call Us"
                            aria-label="Call Us"
                        >
                            <span className="hidden px-2 text-sw-small font-semibold sm:block">Call Us</span>
                            <div className="flex h-11 w-11 items-center justify-center rounded-sw-pill bg-sw-white/10">
                                <RiPhoneFill />
                            </div>
                        </a>

                        {/* WhatsApp Channel */}
                        <a 
                            href={whatsappChannelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 rounded-sw-pill bg-sw-black/90 p-1.5 text-sw-white shadow-sw-soft ring-1 ring-sw-white/15 backdrop-blur-sw-glass transition-colors duration-sw-fast hover:bg-sw-glass"
                            title="WhatsApp Channel"
                            aria-label="Join Channel"
                        >
                            <span className="hidden px-2 text-sw-small font-semibold sm:block">Join Channel</span>
                            <div className="flex h-11 w-11 items-center justify-center rounded-sw-pill bg-sw-white/10">
                                <RiMegaphoneFill />
                            </div>
                        </a>

                        {/* WhatsApp DM */}
                        <a 
                            href={whatsappDmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 rounded-sw-pill bg-sw-black/90 p-1.5 text-sw-white shadow-sw-soft ring-1 ring-sw-white/15 backdrop-blur-sw-glass transition-colors duration-sw-fast hover:bg-sw-glass"
                            title="Chat on WhatsApp"
                            aria-label="WhatsApp Chat"
                        >
                            <span className="hidden px-2 text-sw-small font-semibold sm:block">WhatsApp Chat</span>
                            <div className="flex h-11 w-11 items-center justify-center rounded-sw-pill bg-sw-white/10">
                                <RiWhatsappFill className="text-xl" />
                            </div>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <button
                onClick={toggleOpen}
                aria-expanded={isOpen}
                aria-label="Contact Us"
                className="flex h-14 w-14 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white shadow-sw-soft ring-2 ring-sw-white/80 transition-transform duration-sw-fast motion-safe:hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-sw-focus"
                style={{ transform: 'translateZ(0)' }}
                title="Contact Us"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <RiAddLine className="text-2xl" /> : <RiCustomerService2Fill className="text-2xl" />}
                </motion.div>
            </button>
        </div>
    );
};

export default FloatingContact;
