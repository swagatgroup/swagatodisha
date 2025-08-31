import React, { useState } from 'react'
import Swal from 'sweetalert2'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [isSubscribing, setIsSubscribing] = useState(false)

    const footerData = {
        quickLinks: [
            { name: "About Us", url: "#about" },
            { name: "Programs", url: "#programs" },
            { name: "Admissions", url: "#admissions" },
            { name: "Gallery", url: "#gallery" },
            { name: "Contact", url: "#contact" }
        ],
        programs: [
            { name: "School Education", url: "#" },
            { name: "Higher Secondary", url: "#" },
            { name: "Degree College", url: "#" },
            { name: "Engineering", url: "#" },
            { name: "Management", url: "#" }
        ],
        support: [
            { name: "Student Portal", url: "#" },
            { name: "Parent Portal", url: "#" },
            { name: "Career Guidance", url: "#" },
            { name: "Scholarships", url: "#" },
            { name: "FAQs", url: "#" }
        ],
        contact: {
            address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, 767039",
            phone: "+91 9403891555", // Sargiguda main number
            email: "contact@swagatodisha.com"
        },
        socialLinks: [
            { name: "Facebook", icon: "fa-brands fa-facebook-f", url: "#" },
            { name: "Twitter", icon: "fa-brands fa-twitter", url: "#" },
            { name: "LinkedIn", icon: "fa-brands fa-linkedin-in", url: "#" },
            { name: "Instagram", icon: "fa-brands fa-instagram", url: "#" },
            { name: "YouTube", icon: "fa-brands fa-youtube", url: "#" }
        ]
    }

    const validateNewsletterEmail = (email) => {
        if (!email.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Email Required',
                text: 'Please enter your email address',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        if (!email.includes('@')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        return true
    }

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault()

        if (!validateNewsletterEmail(newsletterEmail)) return

        setIsSubscribing(true)

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '9ec47c5e-26a9-46b3-8845-210426d38985', // Replace with your actual access key
                    subject: 'Newsletter Subscription - Swagat Group of Institutions',
                    email: newsletterEmail,
                    message: `New newsletter subscription from: ${newsletterEmail}`,
                    from_name: 'Newsletter Subscriber',
                    replyto: newsletterEmail
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully Subscribed!',
                    text: 'Thank you for subscribing to our newsletter. You will receive updates about our latest news, events, and educational insights!',
                    confirmButtonColor: '#8B5CF6',
                    confirmButtonText: 'Great!'
                })

                // Reset form
                setNewsletterEmail('')
            } else {
                throw new Error('Failed to subscribe')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again later.',
                confirmButtonColor: '#8B5CF6'
            })
        } finally {
            setIsSubscribing(false)
        }
    }

    return (
        <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl"></div>
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10 pt-12 pb-8">
                <div className="container mx-auto px-6">
                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Quick Links */}
                        <div>
                            <h4 className="text-base font-bold text-white mb-4 flex items-center">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                                    <i className="fa-solid fa-link text-white text-xs"></i>
                                </div>
                                Quick Links
                            </h4>
                            <ul className="space-y-2">
                                {footerData.quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.url}
                                            className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:bg-purple-300 transition-colors duration-300"></div>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Programs */}
                        <div>
                            <h4 className="text-base font-bold text-white mb-4 flex items-center">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                                    <i className="fa-solid fa-graduation-cap text-white text-xs"></i>
                                </div>
                                Our Programs
                            </h4>
                            <ul className="space-y-2">
                                {footerData.programs.map((program, index) => (
                                    <li key={index}>
                                        <a
                                            href={program.url}
                                            className="text-gray-300 hover:text-blue-300 transition-colors duration-300 flex items-center group text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover:bg-blue-300 transition-colors duration-300"></div>
                                            {program.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-base font-bold text-white mb-4 flex items-center">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                                    <i className="fa-solid fa-headset text-white text-xs"></i>
                                </div>
                                Support
                            </h4>
                            <ul className="space-y-2">
                                {footerData.support.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.url}
                                            className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:bg-purple-300 transition-colors duration-300"></div>
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Subscribe */}
                        <div>
                            <h4 className="text-base font-bold text-white mb-4 flex items-center">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                                    <i className="fa-solid fa-envelope text-white text-xs"></i>
                                </div>
                                Stay Updated
                            </h4>
                            <p className="text-gray-300 mb-4 text-sm">
                                Subscribe to our newsletter for the latest updates, events, and educational insights.
                            </p>
                            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubscribing ? (
                                        <span className="flex items-center justify-center">
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                            Subscribing...
                                        </span>
                                    ) : (
                                        'Subscribe'
                                    )}
                                </button>
                            </form>
                        </div>


                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/20 pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="text-gray-400 text-xs mb-3 md:mb-0 text-center md:text-left">
                                © {currentYear} Swagat Group of Institutions. All rights reserved.
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3 md:mb-0">
                                <a href="#" className="hover:text-purple-300 transition-colors duration-300">Privacy Policy</a>
                                <a href="#" className="hover:text-purple-300 transition-colors duration-300">Terms of Service</a>
                                <a href="#" className="hover:text-purple-300 transition-colors duration-300">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
