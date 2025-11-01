import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { SOCIAL_LINKS, CONTACT_INFO } from '../utils/constants'
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../utils/sweetAlert'
import api from '../utils/api'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        documents: null
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)

    // Load Google reCAPTCHA v3
    useEffect(() => {
        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY';

        // Skip if no key configured
        if (!recaptchaSiteKey || recaptchaSiteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
            console.warn('reCAPTCHA site key not configured');
            setRecaptchaLoaded(false);
            return;
        }

        // Check if script already exists
        const existingScript = document.querySelector(`script[src*="recaptcha"]`);
        if (existingScript) {
            // Script already loaded
            if (window.grecaptcha) {
                setRecaptchaLoaded(true);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.grecaptcha) {
                window.grecaptcha.ready(() => {
                    setRecaptchaLoaded(true);
                    console.log('✅ reCAPTCHA v3 loaded successfully');
                });
            }
        };
        script.onerror = () => {
            console.error('❌ Failed to load reCAPTCHA');
            setRecaptchaLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup on unmount (but don't remove script as it might be used elsewhere)
        };
    }, [])

    // Get reCAPTCHA token with timeout
    const getRecaptchaToken = () => {
        return new Promise((resolve) => {
            const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY';

            // If no key configured, skip reCAPTCHA
            if (!recaptchaSiteKey || recaptchaSiteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
                console.log('reCAPTCHA not configured, skipping');
                resolve(null);
                return;
            }

            // Set timeout of 5 seconds
            const timeout = setTimeout(() => {
                console.warn('reCAPTCHA token generation timed out');
                resolve(null); // Fail gracefully
            }, 5000);

            try {
                if (window.grecaptcha && recaptchaLoaded) {
                    window.grecaptcha.ready(() => {
                        window.grecaptcha.execute(
                            recaptchaSiteKey,
                            { action: 'contact_form' }
                        ).then((token) => {
                            clearTimeout(timeout);
                            resolve(token);
                        }).catch((error) => {
                            console.warn('reCAPTCHA execution failed:', error);
                            clearTimeout(timeout);
                            resolve(null); // Fail gracefully
                        });
                    });
                } else {
                    clearTimeout(timeout);
                    // If not loaded yet, wait a bit more, but not indefinitely
                    const retryTimeout = setTimeout(() => {
                        console.warn('reCAPTCHA not loaded after retry');
                        resolve(null);
                    }, 2000);

                    // Try to wait for it to load
                    if (window.grecaptcha) {
                        window.grecaptcha.ready(() => {
                            clearTimeout(retryTimeout);
                            window.grecaptcha.execute(
                                recaptchaSiteKey,
                                { action: 'contact_form' }
                            ).then((token) => {
                                resolve(token);
                            }).catch(() => {
                                resolve(null);
                            });
                        });
                    } else {
                        clearTimeout(retryTimeout);
                        resolve(null); // Fail gracefully if not loaded
                    }
                }
            } catch (error) {
                clearTimeout(timeout);
                console.error('reCAPTCHA error:', error);
                resolve(null); // Fail gracefully
            }
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Special handling for phone number - only allow digits, max 10
        if (name === 'phone') {
            // Remove all non-digits and limit to 10 digits
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleFileChange = (e) => {
        const files = e.target.files

        // Validate file sizes (10MB limit per file)
        const maxSize = 10 * 1024 * 1024 // 10MB in bytes
        const invalidFiles = []

        if (files && files.length > 0) {
            // Check file count limit
            if (files.length > 5) {
                showError('Too Many Files', 'You can upload maximum 5 files at once.');
                e.target.value = '';
                return;
            }

            for (let i = 0; i < files.length; i++) {
                if (files[i].size > maxSize) {
                    invalidFiles.push(files[i].name)
                }
            }

            if (invalidFiles.length > 0) {
                showError('File Size Too Large', `The following files exceed 10MB limit: ${invalidFiles.join(', ')}`);
                e.target.value = '' // Clear the input
                return
            }
        }

        setFormData(prev => ({
            ...prev,
            documents: files
        }))
    }

    const validateForm = () => {
        if (!formData.name.trim()) {
            showError('Name Required', 'Please enter your name');
            return false
        }
        if (!formData.email.trim()) {
            showError('Email Required', 'Please enter your email address');
            return false
        }
        if (!formData.email.includes('@')) {
            showError('Invalid Email', 'Please enter a valid email address');
            return false
        }
        if (!formData.phone.trim()) {
            showError('Phone Number Required', 'Please enter your phone number');
            return false
        }
        // Validate 10-digit Indian mobile number (starts with 6-9)
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            showError('Invalid Phone Number', 'Phone number must be exactly 10 digits');
            return false
        }
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
            showError('Invalid Phone Number', 'Phone number must start with 6, 7, 8, or 9 (Indian mobile number)');
            return false
        }
        if (!formData.subject.trim()) {
            showError('Subject Required', 'Please enter a subject for your message');
            return false
        }
        if (!formData.message.trim()) {
            showError('Message Required', 'Please enter your message');
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        showLoading('Sending Message...', 'Please wait while we send your message');

        try {
            // Get reCAPTCHA token (non-blocking with timeout)
            let recaptchaToken = null;
            try {
                recaptchaToken = await Promise.race([
                    getRecaptchaToken(),
                    new Promise((resolve) => setTimeout(() => resolve(null), 3000)) // 3 second max wait
                ]);
            } catch (error) {
                console.warn('reCAPTCHA token generation error:', error);
                // Continue without reCAPTCHA if it fails
            }

            // Create FormData for file uploads
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name.trim())
            formDataToSend.append('email', formData.email.trim())
            formDataToSend.append('phone', formData.phone.trim())
            formDataToSend.append('subject', formData.subject.trim())
            formDataToSend.append('message', formData.message.trim())

            // Add reCAPTCHA token (only if we have one)
            if (recaptchaToken) {
                formDataToSend.append('recaptcha_token', recaptchaToken)
            }

            // Add documents if any
            if (formData.documents && formData.documents.length > 0) {
                for (let i = 0; i < formData.documents.length; i++) {
                    formDataToSend.append('documents', formData.documents[i])
                }
            }

            const response = await api.post('/api/contact/submit', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000 // 60 second timeout for file uploads
            })

            closeLoading();

            if (response.data.success) {
                showSuccess('Message Sent Successfully!', 'Thank you for contacting us. We will get back to you soon!');

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                    documents: null
                })

                // Reset file input
                const fileInput = document.getElementById('documents')
                if (fileInput) {
                    fileInput.value = ''
                }
            } else {
                throw new Error(response.data.message || 'Failed to send message')
            }
        } catch (error) {
            console.error('Form submission error:', error)
            closeLoading();

            // Provide more specific error messages
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                showError('Timeout Error', 'The request took too long. Please try again with smaller files or check your connection.');
            } else if (error.response) {
                // Server responded with error
                const errorMsg = error.response.data?.message || error.response.data?.error || 'Failed to send message';
                const errorDetails = error.response.data?.errors;

                if (errorDetails && Array.isArray(errorDetails)) {
                    // File validation errors
                    const fileErrors = errorDetails.map(e =>
                        `${e.filename || 'File'}: ${e.errors?.join(', ') || 'Invalid file'}`
                    ).join('\n');
                    showError('File Validation Failed', fileErrors);
                } else {
                    showError('Submission Failed', errorMsg);
                }
            } else if (error.request) {
                // Request made but no response
                showError('Network Error', 'Could not reach the server. Please check your internet connection and try again.');
            } else {
                // Something else happened
                handleApiError(error, 'Failed to send message. Please try again later.');
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="relative py-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/10 rounded-full blur-3xl"></div>
            </div>

            {/* Section Header */}
            <div className="relative z-10 text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                    <i className="fa-solid fa-envelope text-white text-3xl"></i>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Touch</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    We're here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left Side - Contact Information */}
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                Let's Start a Conversation
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                Ready to take the next step in your educational journey? We're here to guide you through every process, from admissions to career guidance. Our team of experts is committed to providing you with the information and support you need.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-12">
                                Whether you have questions about our programs, want to schedule a campus visit, or need assistance with the application process, don't hesitate to reach out. We believe in building lasting relationships with our students and their families.
                            </p>

                            {/* Logo & Company Info */}
                            <div className="lg:col-span-1">
                                <div className="text-center lg:text-left">
                                    <div className="inline-flex items-center justify-center mb-4">
                                        <img
                                            src="/Swagat_Logo.png"
                                            alt="Swagat Group of Institutions"
                                            className="w-48 h-auto object-contain dark:brightness-0 dark:invert"
                                        />
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                        Empowering students with quality education, innovative learning methods, and holistic development.
                                    </p>
                                </div>
                            </div>



                            {/* Direct Contact Information */}
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Get In Touch Directly</h4>
                                <div className="space-y-3">
                                    {/* Phone Contact */}
                                    <div className="flex items-center">
                                        <i className="fa-solid fa-phone text-purple-600 mr-3 text-lg"></i>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Call Us</p>
                                            <a
                                                href={`tel:${CONTACT_INFO.phone}`}
                                                className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                                            >
                                                {CONTACT_INFO.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Email Contact */}
                                    <div className="flex items-center">
                                        <i className="fa-solid fa-envelope text-purple-600 mr-3 text-lg"></i>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Email Us</p>
                                            <a
                                                href={`mailto:${CONTACT_INFO.email}`}
                                                className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                                            >
                                                {CONTACT_INFO.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Connect With Us</h4>
                                <div className="flex space-x-4">
                                    {SOCIAL_LINKS.map((social, index) => (
                                        <motion.a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            <i className={`${social.icon} text-lg`}></i>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border dark:border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                                    Send Us a Message
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Enter your phone number"
                                            maxLength="10"
                                            pattern="[6-9]\d{9}"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="What is this about?"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label htmlFor="documents" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Upload Documents (Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="documents"
                                                name="documents"
                                                onChange={handleFileChange}
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                            />
                                            <div className="mt-2 text-xs text-gray-500">
                                                Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                                            </div>
                                            {formData.documents && formData.documents.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600 mb-1">Selected files:</p>
                                                    <ul className="text-xs text-gray-500 space-y-1">
                                                        {Array.from(formData.documents).map((file, index) => (
                                                            <li key={index} className="flex items-center">
                                                                <i className="fa-solid fa-file mr-2 text-purple-600"></i>
                                                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Honeypot field - hidden from users but bots will fill it */}
                                    <div style={{ display: 'none', visibility: 'hidden', position: 'absolute', left: '-9999px' }}>
                                        <label htmlFor="website_url">Website URL (Leave empty)</label>
                                        <input
                                            type="text"
                                            id="website_url"
                                            name="website_url"
                                            tabIndex="-1"
                                            autoComplete="off"
                                            aria-hidden="true"
                                        />
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
