import React, { useState } from 'react'
import Swal from 'sweetalert2'
import { SOCIAL_LINKS } from '../utils/constants'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Name Required',
                text: 'Please enter your name',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        if (!formData.email.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Email Required',
                text: 'Please enter your email address',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        if (!formData.email.includes('@')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        if (!formData.subject.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Subject Required',
                text: 'Please enter a subject for your message',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        if (!formData.message.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Message Required',
                text: 'Please enter your message',
                confirmButtonColor: '#8B5CF6'
            })
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '9ec47c5e-26a9-46b3-8845-210426d38985', // Replace with your actual access key
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    subject: formData.subject,
                    message: formData.message,
                    from_name: formData.name,
                    replyto: formData.email
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent Successfully!',
                    text: 'Thank you for contacting us. We will get back to you soon!',
                    confirmButtonColor: '#8B5CF6',
                    confirmButtonText: 'Great!'
                })

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                })
            } else {
                throw new Error('Failed to send message')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again later.',
                confirmButtonColor: '#8B5CF6'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="relative py-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
            </div>

            {/* Section Header */}
            <div className="relative z-10 text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                    <i className="fa-solid fa-envelope text-white text-3xl"></i>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                    Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Touch</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    We're here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left Side - Contact Information */}
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                                Let's Start a Conversation
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Ready to take the next step in your educational journey? We're here to guide you through every process, from admissions to career guidance. Our team of experts is committed to providing you with the information and support you need.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed mb-12">
                                Whether you have questions about our programs, want to schedule a campus visit, or need assistance with the application process, don't hesitate to reach out. We believe in building lasting relationships with our students and their families.
                            </p>

                            {/* Logo & Company Info */}
                            <div className="lg:col-span-1">
                                <div className="text-center lg:text-left">
                                    <div className="inline-flex items-center justify-center mb-4">
                                        <img
                                            src="/Swagat_Logo.png"
                                            alt="Swagat Group of Institutions"
                                            className="w-48 h-auto object-contain"
                                        />
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                        Empowering students with quality education, innovative learning methods, and holistic development.
                                    </p>
                                </div>
                            </div>



                            {/* Social Media */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Connect With Us</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                        <i className="fa-brands fa-facebook-f text-lg"></i>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                        <i className="fa-brands fa-twitter text-lg"></i>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                        <i className="fa-brands fa-linkedin-in text-lg"></i>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                        <i className="fa-brands fa-instagram text-lg"></i>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                                        <i className="fa-brands fa-youtube text-lg"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div>
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    Send Us a Message
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Enter your phone number (optional)"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                            placeholder="What is this about?"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                Sending Message...
                                            </span>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactUs
