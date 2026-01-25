import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../utils/sweetAlert';
import api from '../utils/api';
import BackToMainWebsite from './BackToMainWebsite';
import { CONTACT_INFO } from '../utils/constants';

const SendMessage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        documents: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

    // Load Google reCAPTCHA v3
    useEffect(() => {
        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY';

        if (!recaptchaSiteKey || recaptchaSiteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
            console.warn('reCAPTCHA site key not configured');
            setRecaptchaLoaded(false);
            return;
        }

        const existingScript = document.querySelector(`script[src*="recaptcha"]`);
        if (existingScript) {
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
    }, []);

    // Get reCAPTCHA token with timeout
    const getRecaptchaToken = () => {
        return new Promise((resolve) => {
            const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY';

            if (!recaptchaSiteKey || recaptchaSiteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
                console.log('reCAPTCHA not configured, skipping');
                resolve(null);
                return;
            }

            const timeout = setTimeout(() => {
                console.warn('reCAPTCHA token generation timed out');
                resolve(null);
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
                            resolve(null);
                        });
                    });
                } else {
                    clearTimeout(timeout);
                    const retryTimeout = setTimeout(() => {
                        console.warn('reCAPTCHA not loaded after retry');
                        resolve(null);
                    }, 2000);

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
                        resolve(null);
                    }
                }
            } catch (error) {
                clearTimeout(timeout);
                console.error('reCAPTCHA error:', error);
                resolve(null);
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;

        // Validate file sizes (10MB limit per file)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        const invalidFiles = [];

        if (files && files.length > 0) {
            // Check file count limit
            if (files.length > 5) {
                showError('Too Many Files', 'You can upload maximum 5 files at once.');
                e.target.value = '';
                return;
            }

            for (let i = 0; i < files.length; i++) {
                if (files[i].size > maxSize) {
                    invalidFiles.push(files[i].name);
                }
            }

            if (invalidFiles.length > 0) {
                showError('File Size Too Large', `The following files exceed 10MB limit: ${invalidFiles.join(', ')}`);
                e.target.value = ''; // Clear the input
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            documents: files
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showError('Name Required', 'Please enter your name');
            return false;
        }
        if (!formData.email.trim()) {
            showError('Email Required', 'Please enter your email address');
            return false;
        }
        if (!formData.email.includes('@')) {
            showError('Invalid Email', 'Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim()) {
            showError('Phone Number Required', 'Please enter your phone number');
            return false;
        }
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            showError('Invalid Phone Number', 'Phone number must be exactly 10 digits');
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
            showError('Invalid Phone Number', 'Phone number must start with 6, 7, 8, or 9 (Indian mobile number)');
            return false;
        }
        if (!formData.subject.trim()) {
            showError('Subject Required', 'Please enter a subject for your message');
            return false;
        }
        if (!formData.message.trim()) {
            showError('Message Required', 'Please enter your message');
            return false;
        }
        // Validate message length (10-5000 characters as per backend)
        const messageLength = formData.message.trim().length;
        if (messageLength < 10) {
            showError('Message Too Short', 'Message must be at least 10 characters long');
            return false;
        }
        if (messageLength > 5000) {
            showError('Message Too Long', 'Message must be less than 5000 characters');
            return false;
        }
        // Validate subject length (3-200 characters as per backend)
        const subjectLength = formData.subject.trim().length;
        if (subjectLength < 3) {
            showError('Subject Too Short', 'Subject must be at least 3 characters long');
            return false;
        }
        if (subjectLength > 200) {
            showError('Subject Too Long', 'Subject must be less than 200 characters');
            return false;
        }
        // Validate name (2-100 characters, only letters and spaces as per backend)
        const nameLength = formData.name.trim().length;
        if (nameLength < 2) {
            showError('Name Too Short', 'Name must be at least 2 characters long');
            return false;
        }
        if (nameLength > 100) {
            showError('Name Too Long', 'Name must be less than 100 characters');
            return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
            showError('Invalid Name', 'Name can only contain letters and spaces');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        showLoading('Sending Message...', 'Please wait while we send your message');

        try {
            let recaptchaToken = null;
            try {
                recaptchaToken = await Promise.race([
                    getRecaptchaToken(),
                    new Promise((resolve) => setTimeout(() => resolve(null), 3000))
                ]);
            } catch (error) {
                console.warn('reCAPTCHA token generation error:', error);
            }

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('phone', formData.phone.trim());
            formDataToSend.append('subject', formData.subject.trim());
            formDataToSend.append('message', formData.message.trim());

            // Debug: Log form data (without files)
            console.log('📤 Sending form data:', {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                subject: formData.subject.trim(),
                messageLength: formData.message.trim().length,
                documentsCount: formData.documents ? formData.documents.length : 0
            });

            if (recaptchaToken) {
                formDataToSend.append('recaptcha_token', recaptchaToken);
            }

            // Add documents if any
            if (formData.documents && formData.documents.length > 0) {
                for (let i = 0; i < formData.documents.length; i++) {
                    formDataToSend.append('documents', formData.documents[i]);
                }
            }

            const response = await api.post('/api/contact/submit', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000 // 60 second timeout for file uploads
            });

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
                });

                // Reset file input
                const fileInput = document.getElementById('documents');
                if (fileInput) {
                    fileInput.value = '';
                }
            } else {
                throw new Error(response.data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Validation errors:', error.response?.data?.errors);
            closeLoading();

            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                showError('Timeout Error', 'The request took too long. Please try again with smaller files or check your connection.');
            } else if (error.response) {
                // Server responded with error
                const errorMsg = error.response.data?.message || error.response.data?.error || 'Failed to send message';
                const errorDetails = error.response.data?.errors;
                const statusCode = error.response.status;

                // Handle rate limiting
                if (statusCode === 429) {
                    const retryAfter = error.response.data?.retryAfter || 3600;
                    const hours = Math.ceil(retryAfter / 3600);
                    showError('Too Many Requests', `You have submitted too many messages. Please try again in ${hours} hour${hours > 1 ? 's' : ''}.`);
                } else if (errorDetails && Array.isArray(errorDetails)) {
                    // Check if these are file validation errors or form validation errors
                    const hasFileErrors = errorDetails.some(e => e.filename);
                    
                    if (hasFileErrors) {
                        // File validation errors
                        const fileErrors = errorDetails.map(e =>
                            `${e.filename || 'File'}: ${e.errors?.join(', ') || 'Invalid file'}`
                        ).join('\n');
                        showError('File Validation Failed', fileErrors);
                    } else {
                        // Form validation errors (from express-validator)
                        const formErrors = errorDetails.map(e => {
                            const field = e.param || e.field || 'Field';
                            const msg = e.msg || e.message || 'Invalid value';
                            return `${field}: ${msg}`;
                        }).join('\n');
                        showError('Validation Failed', `Please fix the following errors:\n\n${formErrors}`);
                    }
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
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
            <BackToMainWebsite variant="floating" />
            
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/40 to-transparent dark:from-purple-900/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-blue-200/40 to-transparent dark:from-blue-900/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-purple-100/20 via-blue-100/20 to-purple-100/20 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl"></div>
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
            </div>
            
            <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
                {/* Section Header */}
                <div className="relative z-10 text-center mb-12 md:mb-16 container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        {/* Icon Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-3xl mb-6 shadow-2xl shadow-purple-500/30 relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                            <i className="fa-solid fa-paper-plane text-white text-4xl relative z-10"></i>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
                        </motion.div>
                        
                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 md:mb-6 leading-tight"
                        >
                            Send Us a{' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 animate-gradient bg-[length:200%_auto]">
                                    Message
                                </span>
                                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full opacity-30"></span>
                            </span>
                        </motion.h1>
                        
                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
                        >
                            Have a question or need assistance? We're here to help! Fill out the form below and we'll get back to you as soon as possible.
                        </motion.p>
                        
                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex flex-wrap items-center justify-center gap-4 mt-8"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                                <i className="fa-solid fa-shield-check text-green-600"></i>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                                <i className="fa-solid fa-clock text-blue-600"></i>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Response</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                                <i className="fa-solid fa-headset text-purple-600"></i>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">24/7 Support</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Side - Contact Info Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="lg:col-span-1"
                            >
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                        <i className="fa-solid fa-info-circle text-purple-600"></i>
                                        Quick Contact
                                    </h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/50">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                                                <i className="fa-solid fa-phone text-white text-sm"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                                                <a
                                                    href={`tel:${CONTACT_INFO.phone}`}
                                                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                >
                                                    {CONTACT_INFO.phone}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/50">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                                <i className="fa-solid fa-envelope text-white text-sm"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                                <a
                                                    href={`mailto:${CONTACT_INFO.email}`}
                                                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                                                >
                                                    {CONTACT_INFO.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
                                            <strong>Tip:</strong> Include as much detail as possible in your message to help us assist you better.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            
                            {/* Right Side - Form Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="lg:col-span-2"
                            >
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Get in Touch</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Fill out the form below and we'll respond promptly</p>
                                    </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <i className="fa-solid fa-user text-purple-600 text-xs"></i>
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder="John Doe"
                                                required
                                            />
                                            <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <i className="fa-solid fa-envelope text-blue-600 text-xs"></i>
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                placeholder="john@example.com"
                                                required
                                            />
                                            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-phone text-green-600 text-xs"></i>
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="9876543210"
                                            maxLength="10"
                                            pattern="[6-9]\d{9}"
                                            required
                                        />
                                        <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-tag text-orange-600 text-xs"></i>
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="What is this about?"
                                            required
                                        />
                                        <i className="fa-solid fa-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-message text-purple-600 text-xs"></i>
                                        Message <span className="text-red-500">*</span>
                                        <span className="ml-auto text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {formData.message.trim().length}/5000
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="6"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 pl-11 pt-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="Tell us more about your inquiry... (Minimum 10 characters)"
                                            required
                                        ></textarea>
                                        <i className="fa-solid fa-message absolute left-4 top-4 text-gray-400 text-sm"></i>
                                    </div>
                                    {formData.message.trim().length > 0 && formData.message.trim().length < 10 && (
                                        <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                                            <i className="fa-solid fa-exclamation-triangle"></i>
                                            Message must be at least 10 characters
                                        </p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 }}
                                >
                                    <label htmlFor="documents" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <i className="fa-solid fa-paperclip text-indigo-600 text-xs"></i>
                                        Upload Documents <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 bg-gray-50/50 dark:bg-gray-900/50">
                                            <input
                                                type="file"
                                                id="documents"
                                                name="documents"
                                                onChange={handleFileChange}
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-center">
                                                <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 dark:text-gray-600 mb-2"></i>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file, up to 5 files)
                                                </p>
                                            </div>
                                        </div>
                                        {formData.documents && formData.documents.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 space-y-2"
                                            >
                                                {Array.from(formData.documents).map((file, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                                                <i className="fa-solid fa-file text-white text-sm"></i>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Honeypot field */}
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

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-paper-plane"></i>
                                                Send Message
                                                <i className="fa-solid fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SendMessage;

