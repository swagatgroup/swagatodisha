import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        guardianName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        course: '',
        referralCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [customCourse, setCustomCourse] = useState('');
    const [showCustomCourse, setShowCustomCourse] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Comprehensive course list (alphabetically arranged)
    const courseList = [
        'B.A. (Bachelor of Arts)',
        'B.A. Economics',
        'B.A. English',
        'B.A. History',
        'B.A. Political Science',
        'B.A. Psychology',
        'B.A. Sociology',
        'B.Arch (Bachelor of Architecture)',
        'B.B.A. (Bachelor of Business Administration)',
        'B.C.A. (Bachelor of Computer Applications)',
        'B.Com (Bachelor of Commerce)',
        'B.Com (Hons)',
        'B.D.S. (Bachelor of Dental Surgery)',
        'B.Ed (Bachelor of Education)',
        'B.El.Ed (Bachelor of Elementary Education)',
        'B.F.Sc (Bachelor of Fisheries Science)',
        'B.H.M.S. (Bachelor of Homeopathic Medicine)',
        'B.Lib.I.Sc (Bachelor of Library and Information Science)',
        'B.M.S. (Bachelor of Management Studies)',
        'B.Pharm (Bachelor of Pharmacy)',
        'B.P.T. (Bachelor of Physiotherapy)',
        'B.Sc (Bachelor of Science)',
        'B.Sc Agriculture',
        'B.Sc Biotechnology',
        'B.Sc Chemistry',
        'B.Sc Computer Science',
        'B.Sc Electronics',
        'B.Sc Mathematics',
        'B.Sc Physics',
        'B.Sc Zoology',
        'B.Tech (Bachelor of Technology)',
        'B.Tech Aerospace Engineering',
        'B.Tech Agricultural Engineering',
        'B.Tech Automobile Engineering',
        'B.Tech Biotechnology',
        'B.Tech Chemical Engineering',
        'B.Tech Civil Engineering',
        'B.Tech Computer Science and Engineering',
        'B.Tech Electrical Engineering',
        'B.Tech Electronics and Communication Engineering',
        'B.Tech Information Technology',
        'B.Tech Mechanical Engineering',
        'B.Tech Mining Engineering',
        'B.Tech Petroleum Engineering',
        'B.V.Sc (Bachelor of Veterinary Science)',
        'B.Voc (Bachelor of Vocation)',
        'Certificate Course in Digital Marketing',
        'Certificate Course in Web Development',
        'Certificate Course in Data Science',
        'Certificate Course in Graphic Design',
        'Certificate Course in Photography',
        'Certificate Course in Language',
        'Diploma in Computer Applications',
        'Diploma in Engineering',
        'Diploma in Hotel Management',
        'Diploma in Pharmacy',
        'Diploma in Tourism',
        'LL.B (Bachelor of Laws)',
        'M.A. (Master of Arts)',
        'M.A. Economics',
        'M.A. English',
        'M.A. History',
        'M.A. Political Science',
        'M.A. Psychology',
        'M.A. Sociology',
        'M.Arch (Master of Architecture)',
        'M.B.A. (Master of Business Administration)',
        'M.B.A. Finance',
        'M.B.A. Marketing',
        'M.B.A. Human Resources',
        'M.B.A. Operations',
        'M.C.A. (Master of Computer Applications)',
        'M.Com (Master of Commerce)',
        'M.D. (Doctor of Medicine)',
        'M.Ed (Master of Education)',
        'M.Lib.I.Sc (Master of Library and Information Science)',
        'M.Pharm (Master of Pharmacy)',
        'M.Sc (Master of Science)',
        'M.Sc Agriculture',
        'M.Sc Biotechnology',
        'M.Sc Chemistry',
        'M.Sc Computer Science',
        'M.Sc Mathematics',
        'M.Sc Physics',
        'M.Sc Zoology',
        'M.Tech (Master of Technology)',
        'M.Tech Computer Science',
        'M.Tech Civil Engineering',
        'M.Tech Mechanical Engineering',
        'M.Tech Electronics',
        'M.Tech Information Technology',
        'M.V.Sc (Master of Veterinary Science)',
        'M.B.B.S. (Bachelor of Medicine and Bachelor of Surgery)',
        'M.D.S. (Master of Dental Surgery)',
        'M.S. (Master of Surgery)',
        'Ph.D (Doctor of Philosophy)',
        'Post Graduate Diploma',
        'PGDM (Post Graduate Diploma in Management)',
        'PGDCA (Post Graduate Diploma in Computer Applications)',
        'PGDBA (Post Graduate Diploma in Business Administration)',
        'Other (Please specify)'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleCourseSearch = (e) => {
        setCourseSearch(e.target.value);
        setShowCourseDropdown(true);
    };

    const handleCourseSelect = (course) => {
        if (course === 'Other (Please specify)') {
            setShowCustomCourse(true);
            setFormData({ ...formData, course: '' });
        } else {
            setFormData({ ...formData, course });
            setShowCustomCourse(false);
        }
        setCourseSearch('');
        setShowCourseDropdown(false);
    };

    const handleCustomCourseChange = (e) => {
        setCustomCourse(e.target.value);
        setFormData({ ...formData, course: e.target.value });
    };

    const filteredCourses = courseList.filter(course =>
        course.toLowerCase().includes(courseSearch.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCourseDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setError('Phone number must be 10 digits');
            return false;
        }
        if (!formData.course) {
            setError('Please select a course');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Remove confirmPassword from the data sent to backend
            const { confirmPassword, ...registrationData } = formData;

            const result = await register(registrationData);

            if (result.success) {
                if (result.requiresProfileCompletion) {
                    setSuccess('Registration successful! Please complete your profile to continue.');
                    setTimeout(() => {
                        navigate('/complete-profile');
                    }, 2000);
                } else {
                    setSuccess('Registration successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        navigate('/dashboard/student');
                    }, 2000);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
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
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            Create Your Account
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-gray-600"
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
                        {/* Messages */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian's Name *
                                </label>
                                <input
                                    id="guardianName"
                                    name="guardianName"
                                    type="text"
                                    required
                                    value={formData.guardianName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter guardian's full name"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter 10-digit phone number"
                                />
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password (min 6 characters)"
                                required
                                autoComplete="new-password"
                                label="Password *"
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

                        {/* Course Selection with Search */}
                        <div className="relative" ref={dropdownRef}>
                            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                                Course *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search and select course..."
                                    value={courseSearch || formData.course}
                                    onChange={handleCourseSearch}
                                    onFocus={() => setShowCourseDropdown(true)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-10"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Dropdown */}
                                {showCourseDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCourses.length > 0 ? (
                                            filteredCourses.map((course, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleCourseSelect(course)}
                                                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                >
                                                    {course}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">
                                                No courses found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Custom Course Input */}
                            {showCustomCourse && (
                                <div className="mt-3">
                                    <label htmlFor="customCourse" className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="customCourse"
                                        value={customCourse}
                                        onChange={handleCustomCourseChange}
                                        placeholder="Enter your course name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Referral Code */}
                        <div>
                            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Referral Code (Optional)
                            </label>
                            <input
                                id="referralCode"
                                name="referralCode"
                                type="text"
                                value={formData.referralCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter agent referral code if you have one"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                If you were referred by an agent, enter their referral code here
                            </p>
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
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </motion.button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
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
        </div>
    );
};

export default Register;
