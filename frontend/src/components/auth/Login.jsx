import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import Swal from 'sweetalert2';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const validateForm = () => {
        // Email validation
        if (!formData.email) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter your email address',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Password validation
        if (!formData.password) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter your password',
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
            title: 'Signing In...',
            text: 'Please wait while we authenticate you',
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

            console.log('Attempting login with email:', formData.email);
            const result = await login(formData.email, formData.password);
            console.log('Login result:', result);

            if (result.success) {
                const userRole = result.user.role;
                const userName = result.user.fullName || result.user.email;
                console.log('Login successful, user role:', userRole);

                // Show success alert
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: `Welcome back, ${userName}!`,
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Continue',
                    timer: 2000,
                    timerProgressBar: true
                });

                // Redirect based on user role
                setTimeout(() => {
                    switch (userRole) {
                        case 'student':
                            console.log('Navigating to student dashboard...');
                            navigate('/dashboard/student');
                            break;
                        case 'agent':
                            console.log('Navigating to agent dashboard...');
                            navigate('/dashboard/agent');
                            break;
                        case 'staff':
                            console.log('Navigating to staff dashboard...');
                            navigate('/dashboard/staff');
                            break;
                        case 'super_admin':
                            console.log('Navigating to admin dashboard...');
                            navigate('/dashboard/admin');
                            break;
                        default:
                            console.log('Unknown role, defaulting to student dashboard...');
                            navigate('/dashboard/student');
                    }
                }, 100);
            } else {
                console.error('❌ Login failed:', result.message);

                // Show error alert
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message || 'Invalid credentials. Please try again.',
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Try Again'
                });
            }
        } catch (err) {
            console.error('Login error:', err);

            // Show error alert
            await Swal.fire({
                icon: 'error',
                title: 'Login Error',
                text: err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.',
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Try Again'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                {/* Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6"
                    >
                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        Welcome Back
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-gray-600"
                    >
                        Sign in to your account
                    </motion.p>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit}
                >

                    <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password Field */}
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            label="Password"
                        />
                    </div>

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
                                Signing in...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>

                    {/* Links */}
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <Link
                                to="/forgot-password"
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                            >
                                Forgot your password?
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="text-sm text-gray-600"
                        >
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                            >
                                Sign up here
                            </Link>
                        </motion.div>
                    </div>
                </motion.form>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-center"
                >
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
