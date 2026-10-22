import { useState, useEffect } from 'react';
import {
    RiMailFill,
    RiFacebookBoxFill,
    RiTwitterXFill,
    RiInstagramFill,
    RiLinkedinBoxFill,
    RiYoutubeFill
} from '@remixicon/react';
import { LuMail, LuPaperclip, LuPhone } from 'react-icons/lu'
import { SOCIAL_LINKS, CONTACT_INFO } from '../utils/constants'
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../utils/sweetAlert'
import api from '../utils/api'
import { Container, SectionHeader } from './site/Layout'
import Button from './site/Button'
import Card from './site/Card'
import Icon from './site/Icon'
import { Input, Textarea } from './site/Field'
import { LOGO_COLOR, LOGO_SIZE } from './site/siteConfig'

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

    const SOCIAL_ICON_MAP = {
        'Facebook': RiFacebookBoxFill,
        'Twitter': RiTwitterXFill,
        'Instagram': RiInstagramFill,
        'YouTube': RiYoutubeFill,
        'LinkedIn': RiLinkedinBoxFill
    };

    return (
        <div className="sw-section relative">
            <Container>
                <SectionHeader
                    title="Get in touch with us"
                    subtitle="Have a question about a course or admission? Send us a message and our team will guide you, step by step."
                />
            </Container>

            <Container wide>
                <Card variant="panel" className="grid grid-cols-1 gap-10 p-5 md:p-6 lg:grid-cols-[minmax(0,368px)_minmax(0,1fr)] lg:gap-24">
                    {/* Contact Form */}
                    <div>
                        <h3 className="sr-only">Send Us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                label="Full Name *"
                                hideLabel
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                            />
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                label="Email Address *"
                                hideLabel
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                            />
                            <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                label="Phone Number *"
                                hideLabel
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                maxLength="10"
                                pattern="[6-9]\d{9}"
                                required
                            />
                            <Input
                                type="text"
                                id="subject"
                                name="subject"
                                label="Subject *"
                                hideLabel
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="What is this about?"
                            />
                            <Textarea
                                id="message"
                                name="message"
                                label="Message *"
                                hideLabel
                                rows="5"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Tell us more about your inquiry..."
                            />

                            <div>
                                <label htmlFor="documents" className="mb-1.5 block text-sw-small font-semibold">
                                    Upload Documents (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="documents"
                                    name="documents"
                                    onChange={handleFileChange}
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                    className="block min-h-11 w-full rounded-sw-sm bg-sw-white px-2 py-2 text-sw-small text-sw-text shadow-sw-input file:mr-3 file:min-h-9 file:rounded-sw-pill file:border-0 file:bg-sw-black file:px-4 file:text-sw-small file:font-semibold file:text-sw-white hover:file:bg-sw-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sw-focus"
                                />
                                <p className="mt-2 text-sw-caption text-sw-text-muted">
                                    Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                                </p>
                                {formData.documents && formData.documents.length > 0 && (
                                    <div className="mt-2">
                                        <p className="mb-1 text-sw-small font-normal text-sw-text-secondary">Selected files:</p>
                                        <ul className="space-y-1 text-sw-caption text-sw-text-muted">
                                            {Array.from(formData.documents).map((file, index) => (
                                                <li key={index} className="flex items-center">
                                                    <Icon icon={LuPaperclip} size="xs" className="mr-2 shrink-0" />
                                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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

                            <Button type="submit" shape="rounded" fullWidth loading={isSubmitting}>
                                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                            </Button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="text-sw-body">
                        <h3 className="mb-4 text-sw-label font-semibold lg:text-sw-small">
                            Let&apos;s Start a Conversation
                        </h3>
                        <p className="mb-6">
                            Ready to take the next step in your educational journey? We're here to guide you through every process, from admissions to career guidance. Our team of experts is committed to providing you with the information and support you need.
                        </p>
                        <p className="mb-8">
                            Whether you have questions about our programs, want to schedule a campus visit, or need assistance with the application process, don't hesitate to reach out. We believe in building lasting relationships with our students and their families.
                        </p>

                        {/* Logo & Company Info */}
                        <img
                            src={LOGO_COLOR}
                            alt="Swagat Group of Institutions"
                            width={LOGO_SIZE.width}
                            height={LOGO_SIZE.height}
                            loading="lazy"
                            className="mb-3 h-12 w-auto"
                        />
                        <p className="mb-8 text-sw-small font-normal text-sw-text-secondary">
                            Empowering students with quality education, innovative learning methods, and holistic development.
                        </p>

                        {/* Direct Contact Information */}
                        <h4 className="mb-3 font-semibold">Get In Touch Directly</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                    <Icon icon={LuPhone} size="sm" />
                                </span>
                                <span>
                                    <span className="block text-sw-small font-normal text-sw-text-muted">Call Us</span>
                                    <a href={`tel:${CONTACT_INFO.phone}`} className="font-semibold underline-offset-4 hover:underline">
                                        {CONTACT_INFO.phone}
                                    </a>
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                    <Icon icon={LuMail} size="sm" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sw-small font-normal text-sw-text-muted">Email Us</span>
                                    <a href={`mailto:${CONTACT_INFO.email}`} className="break-all font-semibold underline-offset-4 hover:underline">
                                        {CONTACT_INFO.email}
                                    </a>
                                </span>
                            </li>
                        </ul>
                    </div>
                </Card>
            </Container>

            {/* Social Media */}
            <Container className="mt-10 text-center md:text-left">
                <h3 className="mb-4 text-sw-h3 font-semibold">Connect With Us</h3>
                <ul className="flex flex-wrap justify-center gap-4 md:justify-start">
                    {SOCIAL_LINKS.map((social, index) => {
                        const SocialIcon = SOCIAL_ICON_MAP[social.name] || RiMailFill;
                        return (
                            <li key={index}>
                                <a
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`sw-social-${social.name.toLowerCase()} flex h-[54px] w-[54px] items-center justify-center rounded-sw-md shadow-sw-soft ring-1 ring-sw-border-light transition-transform duration-sw-fast motion-safe:hover:-translate-y-0.5`}
                                    title={social.name}
                                    aria-label={social.name}
                                >
                                    <SocialIcon size={30} aria-hidden="true" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </Container>
        </div>
    )
}

export default ContactUs
