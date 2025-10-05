import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContextSimple';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import Swal from 'sweetalert2';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // Removed course/referral related UI/state for minimal registration
    const { register } = useAuth();
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Course list removed

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    // Course handlers removed

    // Close dropdown when clicking outside
    useEffect(() => {
        // No dropdowns to manage now
        const noop = () => { };
        document.addEventListener('mousedown', noop);
        return () => {
            document.removeEventListener('mousedown', noop);
        };
    }, []);

    const validateForm = () => {
        // Full name validation
        if (!formData.fullName || formData.fullName.length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Full name must be at least 2 characters',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Full name can only contain alphabets and spaces',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Guardian name validation removed

        // Phone number validation (Indian mobile numbers)
        if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Phone number must be a valid 10-digit Indian mobile number',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Email validation
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Course validation removed

        // Password validation
        if (formData.password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Password must be at least 8 characters',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Passwords do not match',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form using SweetAlert
        if (!validateForm()) {
            return;
        }

        // Show loading alert
        Swal.fire({
            title: 'Creating Account...',
            text: 'Please wait while we create your account',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            setLoading(true);
            setError('');

            const result = await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: 'student'
            });

            if (result.success) {

                // Show success alert and redirect to login
                await Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: `Welcome ${formData.fullName}! Your account has been created successfully. Please log in to continue.`,
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Go to Login',
                    timer: 5000,
                    timerProgressBar: true
                });

                // Redirect to login page with success message
                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please log in with your credentials.',
                        email: formData.email
                    }
                });
            } else {
                console.error('❌ Registration failed:', result.error);

                // Show error alert
                await Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: result.error || 'Registration failed. Please try again.',
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Try Again'
                });
            }
        } catch (error) {
            console.error('Registration error:', error);

            // Show error alert
            await Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'An unexpected error occurred. Please try again.',
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Try Again'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6"
                        >
                            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                        >
                            Create Your Account
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-gray-600 dark:text-gray-300"
                        >
                            Join Swagat Group of Institutions
                        </motion.p>
                    </div>

                    {/* Form */}
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="username email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleChange({ target: { name: 'phoneNumber', value: e.target.value.replace(/\D/g, '').slice(0, 10) } })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                />
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-6">
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password (min 8 characters)"
                                required
                                autoComplete="new-password"
                                label="Password *"
                                showStrengthIndicator={true}
                            />

                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                                label="Confirm Password *"
                            />
                        </div>

                        {/* Course selection removed */}

                        {/* Referral code removed */}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </motion.button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </motion.form>

                    {/* Back to Home */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="text-center mt-8"
                    >
                        <Link
                            to="/"
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 flex items-center justify-center"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;