import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../utils/sweetAlert';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { CONTACT_INFO } from '../utils/constants';
import {
    LuArrowLeft,
    LuClock,
    LuFileText,
    LuHeadset,
    LuLightbulb,
    LuMail,
    LuPhone,
    LuSend,
    LuShieldCheck,
    LuTriangleAlert,
    LuUpload,
} from 'react-icons/lu';
import PageHero from './site/PageHero';
import { Container, Section } from './site/Layout';
import Badge from './site/Badge';
import Button from './site/Button';
import Card from './site/Card';
import Icon from './site/Icon';
import { Input, Textarea } from './site/Field';

const SendMessage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
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

    // Get dashboard route based on user role
    const getDashboardRoute = () => {
        if (!user || !user.role) return '/dashboard';
        
        switch (user.role) {
            case 'agent':
                return '/dashboard/agent';
            case 'staff':
                return '/dashboard/staff';
            case 'super_admin':
                return '/dashboard/admin';
            case 'user':
            case 'student':
                return '/dashboard/student';
            default:
                return '/dashboard';
        }
    };

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

            // Log the full request URL for debugging
            const fullUrl = api.defaults.baseURL 
                ? `${api.defaults.baseURL}/api/contact/submit` 
                : '/api/contact/submit';
            console.log('📤 Submitting to:', fullUrl);
            console.log('📤 API Base URL:', api.defaults.baseURL || '(empty - relative)');
            
            // Don't set Content-Type manually - let browser set it with boundary for FormData
            const response = await api.post('/api/contact/submit', formDataToSend, {
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
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
                method: error.config?.method,
                requestMade: !!error.request,
                responseReceived: !!error.response
            });
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
        <div>
            <PageHero
                title="Send Us a Message"
                intro="Have a question or need assistance? We're here to help! Fill out the form below and we'll get back to you as soon as possible."
                eyebrow={isAuthenticated && user ? (
                    // Back to Dashboard (signed-in users)
                    <Button variant="glass" size="sm" iconLeft={LuArrowLeft} onClick={() => navigate(getDashboardRoute())}>
                        Back to Dashboard
                    </Button>
                ) : null}
            >
                {/* Trust Badges */}
                <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <li><Badge tone="blue"><Icon icon={LuShieldCheck} size="xs" />Secure</Badge></li>
                    <li><Badge tone="lavender"><Icon icon={LuClock} size="xs" />Quick Response</Badge></li>
                    <li><Badge tone="peach"><Icon icon={LuHeadset} size="xs" />24/7 Support</Badge></li>
                </ul>
            </PageHero>

            <Section>
                <Container wide className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    {/* Left Side - Contact Info Card */}
                    <Card className="h-full p-6 lg:col-span-1">
                        <h2 className="mb-6 text-sw-h3 font-bold">Quick Contact</h2>
                        <ul className="mb-6 space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-white/10">
                                    <Icon icon={LuPhone} size="sm" />
                                </span>
                                <span>
                                    <span className="block text-sw-caption uppercase tracking-wide text-sw-text-on-dark-muted">Phone</span>
                                    <a href={`tel:${CONTACT_INFO.phone}`} className="font-semibold underline-offset-4 hover:underline">
                                        {CONTACT_INFO.phone}
                                    </a>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-white/10">
                                    <Icon icon={LuMail} size="sm" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sw-caption uppercase tracking-wide text-sw-text-on-dark-muted">Email</span>
                                    <a href={`mailto:${CONTACT_INFO.email}`} className="break-all font-semibold underline-offset-4 hover:underline">
                                        {CONTACT_INFO.email}
                                    </a>
                                </span>
                            </li>
                        </ul>
                        <p className="border-t border-sw-white/10 pt-6 text-sw-small font-normal text-sw-text-on-dark-secondary">
                            <Icon icon={LuLightbulb} size="xs" className="mr-2 inline" />
                            <strong className="text-sw-white">Tip:</strong> Include as much detail as possible in your message to help us assist you better.
                        </p>
                    </Card>

                    {/* Right Side - Form Card */}
                    <Card variant="panel" className="p-5 md:p-8 lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="mb-1 text-sw-h3 font-bold">Get in Touch</h2>
                            <p className="text-sw-body text-sw-text-secondary">Fill out the form below and we'll respond promptly</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    required
                                />
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="9876543210"
                                maxLength="10"
                                pattern="[6-9]\d{9}"
                                required
                            />

                            <Input
                                type="text"
                                id="subject"
                                name="subject"
                                label="Subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="What is this about?"
                                required
                            />

                            <div>
                                <Textarea
                                    id="message"
                                    name="message"
                                    label="Message"
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us more about your inquiry... (Minimum 10 characters)"
                                    required
                                    hint={`${formData.message.trim().length}/5000`}
                                />
                                {formData.message.trim().length > 0 && formData.message.trim().length < 10 && (
                                    <p className="mt-1 flex items-center gap-1 text-sw-small font-normal text-sw-warning">
                                        <Icon icon={LuTriangleAlert} size="xs" />
                                        Message must be at least 10 characters
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="documents" className="mb-1.5 block text-sw-small font-semibold">
                                    Upload Documents <span className="font-normal text-sw-text-muted">(Optional)</span>
                                </label>
                                <div className="relative rounded-sw-sm border-2 border-dashed border-sw-gray-300 bg-sw-white p-6 transition-colors duration-sw-fast focus-within:border-sw-focus hover:border-sw-black">
                                    <input
                                        type="file"
                                        id="documents"
                                        name="documents"
                                        onChange={handleFileChange}
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="text-center">
                                        <Icon icon={LuUpload} size="lg" strokeWidth={1.5} className="mx-auto mb-2 text-sw-text-muted" />
                                        <p className="mb-1 text-sw-small font-semibold">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-sw-caption text-sw-text-muted">
                                            PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file, up to 5 files)
                                        </p>
                                    </div>
                                </div>
                                {formData.documents && formData.documents.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {Array.from(formData.documents).map((file, index) => (
                                            <li key={index} className="flex items-center gap-3 rounded-sw-sm bg-sw-white p-3 shadow-sw-input">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sw-sm bg-sw-black text-sw-white">
                                                    <Icon icon={LuFileText} size="xs" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sw-small font-semibold">{file.name}</span>
                                                    <span className="block text-sw-caption text-sw-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

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

                            <Button type="submit" shape="rounded" size="lg" fullWidth loading={isSubmitting} iconLeft={LuSend}>
                                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                            </Button>
                        </form>
                    </Card>
                </Container>
            </Section>
        </div>
    );
};

export default SendMessage;
