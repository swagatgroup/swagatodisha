import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const EnhancedStudentProfile = () => {
    const [profileData, setProfileData] = useState({
        personalDetails: {
            fullName: '',
            fathersName: '',
            mothersName: '',
            dateOfBirth: '',
            gender: '',
            aadharNumber: ''
        },
        contactDetails: {
            primaryPhone: '',
            whatsappNumber: '',
            email: '',
            permanentAddress: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            },
            currentAddress: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            }
        },
        courseDetails: {
            selectedCourse: '',
            customCourse: '',
            stream: '',
            campus: 'Sargiguda'
        },
        financialDetails: {
            bankAccountNumber: '',
            ifscCode: '',
            accountHolderName: '',
            bankName: ''
        },
        guardianDetails: {
            guardianName: '',
            relationship: '',
            guardianPhone: '',
            guardianEmail: '',
            alternativeContact: {
                name: '',
                phone: '',
                relationship: ''
            },
            guardianAddress: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            }
        }
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [errors, setErrors] = useState({});

    const courses = [
        "B.Tech Computer Science", "B.Tech Mechanical Engineering", "B.Tech Electrical Engineering",
        "B.Tech Civil Engineering", "B.Tech Electronics & Communication", "B.Tech Information Technology",
        "MBA", "BCA", "MCA", "B.Com", "M.Com", "BA", "MA English", "BSc Mathematics", "MSc Physics",
        "BSc Chemistry", "MSc Chemistry", "BSc Biology", "MSc Biology", "BBA", "BHM", "BPT", "MPT",
        "B.Pharm", "M.Pharm", "BDS", "MDS", "MBBS", "MD", "B.Sc Nursing", "M.Sc Nursing",
        "Diploma in Engineering", "Diploma in Pharmacy", "Certificate Courses", "Other"
    ];

    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry"
    ];

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/students/profile');
            if (response.data.success) {
                setProfileData(response.data.data);
                calculateCompletion();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = () => {
        const requiredFields = [
            'personalDetails.fullName',
            'personalDetails.fathersName',
            'personalDetails.mothersName',
            'personalDetails.dateOfBirth',
            'personalDetails.gender',
            'personalDetails.aadharNumber',
            'contactDetails.primaryPhone',
            'contactDetails.email',
            'contactDetails.permanentAddress.street',
            'contactDetails.permanentAddress.city',
            'contactDetails.permanentAddress.state',
            'contactDetails.permanentAddress.pincode',
            'guardianDetails.guardianName',
            'guardianDetails.relationship',
            'guardianDetails.guardianPhone',
            'courseDetails.selectedCourse'
        ];

        let completed = 0;
        requiredFields.forEach(field => {
            const value = getNestedValue(profileData, field);
            if (value && value.toString().trim() !== '') {
                completed++;
            }
        });

        const percentage = Math.round((completed / requiredFields.length) * 100);
        setCompletionPercentage(percentage);
    };

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    };

    const handleInputChange = (path, value) => {
        const newData = { ...profileData };
        setNestedValue(newData, path, value);
        setProfileData(newData);

        // Auto-populate WhatsApp number from phone
        if (path === 'contactDetails.primaryPhone' && !profileData.contactDetails.whatsappNumber) {
            setNestedValue(newData, 'contactDetails.whatsappNumber', value);
        }

        // Auto-populate bank name from IFSC
        if (path === 'financialDetails.ifscCode') {
            const bankName = getBankNameFromIFSC(value);
            if (bankName) {
                setNestedValue(newData, 'financialDetails.bankName', bankName);
            }
        }

        // Auto-populate account holder name from student name
        if (path === 'personalDetails.fullName' && !profileData.financialDetails.accountHolderName) {
            setNestedValue(newData, 'financialDetails.accountHolderName', value);
        }

        setProfileData(newData);
        calculateCompletion();
    };

    const getBankNameFromIFSC = (ifsc) => {
        const bankCodes = {
            'SBIN': 'State Bank of India',
            'HDFC': 'HDFC Bank',
            'ICIC': 'ICICI Bank',
            'AXIS': 'Axis Bank',
            'KOTK': 'Kotak Mahindra Bank',
            'PNB': 'Punjab National Bank',
            'BOFA': 'Bank of America',
            'CITI': 'Citibank'
        };
        return bankCodes[ifsc?.substring(0, 4)] || '';
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Details Validation
        if (!profileData.personalDetails.fullName.trim()) {
            newErrors['personalDetails.fullName'] = 'Full name is required';
        }
        if (!profileData.personalDetails.fathersName.trim()) {
            newErrors['personalDetails.fathersName'] = 'Father\'s name is required';
        }
        if (!profileData.personalDetails.mothersName.trim()) {
            newErrors['personalDetails.mothersName'] = 'Mother\'s name is required';
        }
        if (!profileData.personalDetails.dateOfBirth) {
            newErrors['personalDetails.dateOfBirth'] = 'Date of birth is required';
        }
        if (!profileData.personalDetails.gender) {
            newErrors['personalDetails.gender'] = 'Gender is required';
        }
        if (!profileData.personalDetails.aadharNumber || !/^\d{12}$/.test(profileData.personalDetails.aadharNumber)) {
            newErrors['personalDetails.aadharNumber'] = 'Valid 12-digit Aadhaar number is required';
        }

        // Contact Details Validation
        if (!profileData.contactDetails.primaryPhone || !/^[6-9]\d{9}$/.test(profileData.contactDetails.primaryPhone)) {
            newErrors['contactDetails.primaryPhone'] = 'Valid 10-digit Indian mobile number is required';
        }
        if (!profileData.contactDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.contactDetails.email)) {
            newErrors['contactDetails.email'] = 'Valid email address is required';
        }

        // Course Details Validation
        if (!profileData.courseDetails.selectedCourse) {
            newErrors['courseDetails.selectedCourse'] = 'Course selection is required';
        }

        // Guardian Details Validation
        if (!profileData.guardianDetails.guardianName.trim()) {
            newErrors['guardianDetails.guardianName'] = 'Guardian name is required';
        }
        if (!profileData.guardianDetails.relationship) {
            newErrors['guardianDetails.relationship'] = 'Relationship is required';
        }
        if (!profileData.guardianDetails.guardianPhone || !/^[6-9]\d{9}$/.test(profileData.guardianDetails.guardianPhone)) {
            newErrors['guardianDetails.guardianPhone'] = 'Valid guardian phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            const response = await api.put('/api/students/profile', profileData);
            if (response.data.success) {
                calculateCompletion();
                // Show success message
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Completion Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                    <span className="text-sm font-medium text-purple-600">{completionPercentage}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
                {completionPercentage < 100 && (
                    <p className="text-sm text-gray-600 mt-2">
                        Complete all required fields to finish your profile setup.
                    </p>
                )}
            </motion.div>

            {/* Personal Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                            type="text"
                            value={profileData.personalDetails.fullName}
                            onChange={(e) => handleInputChange('personalDetails.fullName', e.target.value.toUpperCase())}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.fullName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter your full name"
                        />
                        {errors['personalDetails.fullName'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.fullName']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
                        <input
                            type="text"
                            value={profileData.personalDetails.fathersName}
                            onChange={(e) => handleInputChange('personalDetails.fathersName', e.target.value.toUpperCase())}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.fathersName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter father's name"
                        />
                        {errors['personalDetails.fathersName'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.fathersName']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name *</label>
                        <input
                            type="text"
                            value={profileData.personalDetails.mothersName}
                            onChange={(e) => handleInputChange('personalDetails.mothersName', e.target.value.toUpperCase())}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.mothersName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter mother's name"
                        />
                        {errors['personalDetails.mothersName'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.mothersName']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                        <input
                            type="date"
                            value={profileData.personalDetails.dateOfBirth}
                            onChange={(e) => handleInputChange('personalDetails.dateOfBirth', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors['personalDetails.dateOfBirth'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.dateOfBirth']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                        <select
                            value={profileData.personalDetails.gender}
                            onChange={(e) => handleInputChange('personalDetails.gender', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.gender'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        {errors['personalDetails.gender'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.gender']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                        <input
                            type="text"
                            value={profileData.personalDetails.aadharNumber}
                            onChange={(e) => handleInputChange('personalDetails.aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['personalDetails.aadharNumber'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter 12-digit Aadhaar number"
                            maxLength="12"
                        />
                        {errors['personalDetails.aadharNumber'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['personalDetails.aadharNumber']}</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <input
                            type="tel"
                            value={profileData.contactDetails.primaryPhone}
                            onChange={(e) => handleInputChange('contactDetails.primaryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['contactDetails.primaryPhone'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                        />
                        {errors['contactDetails.primaryPhone'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['contactDetails.primaryPhone']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                        <input
                            type="tel"
                            value={profileData.contactDetails.whatsappNumber}
                            onChange={(e) => handleInputChange('contactDetails.whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter WhatsApp number (optional)"
                            maxLength="10"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                            type="email"
                            value={profileData.contactDetails.email}
                            onChange={(e) => handleInputChange('contactDetails.email', e.target.value.toLowerCase())}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['contactDetails.email'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter email address"
                        />
                        {errors['contactDetails.email'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['contactDetails.email']}</p>
                        )}
                    </div>
                </div>

                {/* Permanent Address */}
                <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Permanent Address *</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                            <input
                                type="text"
                                value={profileData.contactDetails.permanentAddress.street}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.street', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter street address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                                type="text"
                                value={profileData.contactDetails.permanentAddress.city}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter city"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <select
                                value={profileData.contactDetails.permanentAddress.state}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.state', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select State</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                            <input
                                type="text"
                                value={profileData.contactDetails.permanentAddress.pincode}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter 6-digit pincode"
                                maxLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                value={profileData.contactDetails.permanentAddress.country}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Course Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course *</label>
                        <select
                            value={profileData.courseDetails.selectedCourse}
                            onChange={(e) => handleInputChange('courseDetails.selectedCourse', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['courseDetails.selectedCourse'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select a course</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                        {errors['courseDetails.selectedCourse'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['courseDetails.selectedCourse']}</p>
                        )}
                    </div>

                    {profileData.courseDetails.selectedCourse === 'Other' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Course</label>
                            <input
                                type="text"
                                value={profileData.courseDetails.customCourse}
                                onChange={(e) => handleInputChange('courseDetails.customCourse', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter custom course name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stream/Subject</label>
                        <input
                            type="text"
                            value={profileData.courseDetails.stream}
                            onChange={(e) => handleInputChange('courseDetails.stream', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter stream or subject"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
                        <select
                            value={profileData.courseDetails.campus}
                            onChange={(e) => handleInputChange('courseDetails.campus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="Sargiguda">Sargiguda</option>
                            <option value="Ghantiguda">Ghantiguda</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Guardian Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Guardian/Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name *</label>
                        <input
                            type="text"
                            value={profileData.guardianDetails.guardianName}
                            onChange={(e) => handleInputChange('guardianDetails.guardianName', e.target.value.toUpperCase())}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['guardianDetails.guardianName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter guardian's name"
                        />
                        {errors['guardianDetails.guardianName'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['guardianDetails.guardianName']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                        <select
                            value={profileData.guardianDetails.relationship}
                            onChange={(e) => handleInputChange('guardianDetails.relationship', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['guardianDetails.relationship'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select Relationship</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Grandfather">Grandfather</option>
                            <option value="Grandmother">Grandmother</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors['guardianDetails.relationship'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['guardianDetails.relationship']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone *</label>
                        <input
                            type="tel"
                            value={profileData.guardianDetails.guardianPhone}
                            onChange={(e) => handleInputChange('guardianDetails.guardianPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors['guardianDetails.guardianPhone'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter guardian's phone number"
                            maxLength="10"
                        />
                        {errors['guardianDetails.guardianPhone'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['guardianDetails.guardianPhone']}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email</label>
                        <input
                            type="email"
                            value={profileData.guardianDetails.guardianEmail}
                            onChange={(e) => handleInputChange('guardianDetails.guardianEmail', e.target.value.toLowerCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter guardian's email (optional)"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Financial Details (Optional) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                        <input
                            type="text"
                            value={profileData.financialDetails.bankAccountNumber}
                            onChange={(e) => handleInputChange('financialDetails.bankAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter bank account number"
                            maxLength="18"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                        <input
                            type="text"
                            value={profileData.financialDetails.ifscCode}
                            onChange={(e) => handleInputChange('financialDetails.ifscCode', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter IFSC code (e.g., SBIN0001234)"
                            maxLength="11"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                        <input
                            type="text"
                            value={profileData.financialDetails.accountHolderName}
                            onChange={(e) => handleInputChange('financialDetails.accountHolderName', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter account holder name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                            type="text"
                            value={profileData.financialDetails.bankName}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            placeholder="Auto-populated from IFSC code"
                            disabled
                        />
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end"
            >
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </motion.div>
        </div>
    );
};

export default EnhancedStudentProfile;
