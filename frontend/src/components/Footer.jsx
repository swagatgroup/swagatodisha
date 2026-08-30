import {useState} from 'react';
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
            phone: "+91 7855959544", // Sargiguda main number
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
        <footer className="relative bg-[#1D4B5E] overflow-hidden pattern-bg-dark">
            {/* Main Footer Content */}
            <div className="relative z-10 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {/* Quick Links */}
                        <div>
                            <h4 className="text-xl font-baloo font-bold text-[#FAF7F2] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-[#387B95] rounded-xl flex items-center justify-center mr-3 shadow-sm border border-white/10">
                                    <i className="fa-solid fa-link text-[#FAF7F2] text-sm"></i>
                                </div>
                                Quick Links
                            </h4>
                            <ul className="space-y-3">
                                {footerData.quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.url}
                                            className="text-[#D0E8F0] hover:text-[#F5A623] transition-colors duration-300 flex items-center group font-lato text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-[#387B95] rounded-full mr-3 group-hover:bg-[#F5A623] transition-colors duration-300"></div>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Programs */}
                        <div>
                            <h4 className="text-xl font-baloo font-bold text-[#FAF7F2] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-[#387B95] rounded-xl flex items-center justify-center mr-3 shadow-sm border border-white/10">
                                    <i className="fa-solid fa-graduation-cap text-[#FAF7F2] text-sm"></i>
                                </div>
                                Our Programs
                            </h4>
                            <ul className="space-y-3">
                                {footerData.programs.map((program, index) => (
                                    <li key={index}>
                                        <a
                                            href={program.url}
                                            className="text-[#D0E8F0] hover:text-[#F5A623] transition-colors duration-300 flex items-center group font-lato text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-[#387B95] rounded-full mr-3 group-hover:bg-[#F5A623] transition-colors duration-300"></div>
                                            {program.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-xl font-baloo font-bold text-[#FAF7F2] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-[#387B95] rounded-xl flex items-center justify-center mr-3 shadow-sm border border-white/10">
                                    <i className="fa-solid fa-headset text-[#FAF7F2] text-sm"></i>
                                </div>
                                Support
                            </h4>
                            <ul className="space-y-3">
                                {footerData.support.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.url}
                                            className="text-[#D0E8F0] hover:text-[#F5A623] transition-colors duration-300 flex items-center group font-lato text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 bg-[#387B95] rounded-full mr-3 group-hover:bg-[#F5A623] transition-colors duration-300"></div>
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Subscribe */}
                        <div>
                            <h4 className="text-xl font-baloo font-bold text-[#FAF7F2] mb-6 flex items-center">
                                <div className="w-8 h-8 bg-[#387B95] rounded-xl flex items-center justify-center mr-3 shadow-sm border border-white/10">
                                    <i className="fa-solid fa-envelope text-[#FAF7F2] text-sm"></i>
                                </div>
                                Stay Updated
                            </h4>
                            <p className="text-[#D0E8F0] mb-5 font-lato text-sm">
                                Subscribe to our newsletter for the latest updates, events, and educational insights.
                            </p>
                            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2.5 bg-[#1A3545]/60 border border-white/10 rounded-xl text-[#FAF7F2] placeholder-[#387B95] focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all duration-300 text-sm font-lato"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="w-full px-4 py-2.5 bg-[#F5A623] text-[#1A1A1A] rounded-xl font-baloo font-bold hover:bg-[#D4880B] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="border-t border-white/10 pt-8 mt-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-[#387B95] text-sm text-center md:text-left font-lato">
                                © {currentYear} Swagat Group of Institutions. All rights reserved.
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-[#387B95] font-lato">
                                <a href="#" className="hover:text-[#F5A623] transition-colors duration-300">Privacy Policy</a>
                                <a href="#" className="hover:text-[#F5A623] transition-colors duration-300">Terms of Service</a>
                                <a href="#" className="hover:text-[#F5A623] transition-colors duration-300">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
