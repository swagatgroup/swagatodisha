import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const StudentRegistration = ({ onStudentUpdate }) => {
    const [formData, setFormData] = useState({
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
            }
        },
        courseDetails: {
            selectedCourse: '',
            customCourse: '',
            stream: ''
        },
        guardianDetails: {
            guardianName: '',
            relationship: '',
            guardianPhone: '',
            guardianEmail: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showBulkImport, setShowBulkImport] = useState(false);

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

    const handleInputChange = (path, value) => {
        const newData = { ...formData };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setFormData(newData);

        // Auto-populate WhatsApp number from phone
        if (path === 'contactDetails.primaryPhone' && !formData.contactDetails.whatsappNumber) {
            setFormData(prev => ({
                ...prev,
                contactDetails: {
                    ...prev.contactDetails,
                    whatsappNumber: value
                }
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Details Validation
        if (!formData.personalDetails.fullName.trim()) {
            newErrors['personalDetails.fullName'] = 'Full name is required';
        }
        if (!formData.personalDetails.fathersName.trim()) {
            newErrors['personalDetails.fathersName'] = 'Father\'s name is required';
        }
        if (!formData.personalDetails.mothersName.trim()) {
            newErrors['personalDetails.mothersName'] = 'Mother\'s name is required';
        }
        if (!formData.personalDetails.dateOfBirth) {
            newErrors['personalDetails.dateOfBirth'] = 'Date of birth is required';
        }
        if (!formData.personalDetails.gender) {
            newErrors['personalDetails.gender'] = 'Gender is required';
        }
        if (!formData.personalDetails.aadharNumber || !/^\d{12}$/.test(formData.personalDetails.aadharNumber)) {
            newErrors['personalDetails.aadharNumber'] = 'Valid 12-digit Aadhaar number is required';
        }

        // Contact Details Validation
        if (!formData.contactDetails.primaryPhone || !/^[6-9]\d{9}$/.test(formData.contactDetails.primaryPhone)) {
            newErrors['contactDetails.primaryPhone'] = 'Valid 10-digit Indian mobile number is required';
        }
        if (!formData.contactDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
            newErrors['contactDetails.email'] = 'Valid email address is required';
        }

        // Course Details Validation
        if (!formData.courseDetails.selectedCourse) {
            newErrors['courseDetails.selectedCourse'] = 'Course selection is required';
        }

        // Guardian Details Validation
        if (!formData.guardianDetails.guardianName.trim()) {
            newErrors['guardianDetails.guardianName'] = 'Guardian name is required';
        }
        if (!formData.guardianDetails.relationship) {
            newErrors['guardianDetails.relationship'] = 'Relationship is required';
        }
        if (!formData.guardianDetails.guardianPhone || !/^[6-9]\d{9}$/.test(formData.guardianDetails.guardianPhone)) {
            newErrors['guardianDetails.guardianPhone'] = 'Valid guardian phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/api/enhanced-workflow/register', {
                ...formData,
                registrationSource: 'agent_dashboard'
            });

            if (response.data.success) {
                alert('Student registered successfully!');
                onStudentUpdate(response.data.data.student);
                resetForm();
            }
        } catch (error) {
            console.error('Error registering student:', error);
            alert('Error registering student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
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
                }
            },
            courseDetails: {
                selectedCourse: '',
                customCourse: '',
                stream: ''
            },
            guardianDetails: {
                guardianName: '',
                relationship: '',
                guardianPhone: '',
                guardianEmail: ''
            }
        });
        setErrors({});
    };

    const handleBulkImport = async (file) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/agents/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                alert(`Successfully imported ${response.data.data.imported} students`);
                onStudentUpdate();
            }
        } catch (error) {
            console.error('Error importing students:', error);
            alert('Error importing students. Please check file format.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        // Create and download Excel template
        const templateData = [
            ['Full Name', 'Father\'s Name', 'Mother\'s Name', 'Date of Birth', 'Gender', 'Aadhaar Number', 'Phone', 'Email', 'Course', 'Guardian Name', 'Guardian Phone']
        ];

        const csvContent = templateData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student_registration_template.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Student Registration</h3>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowBulkImport(!showBulkImport)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Bulk Import
                    </button>
                    <button
                        onClick={downloadTemplate}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                        Download Template
                    </button>
                </div>
            </div>

            {/* Bulk Import Section */}
            {showBulkImport && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                    <h4 className="font-medium text-blue-900 mb-2">Bulk Import Students</h4>
                    <p className="text-sm text-blue-700 mb-4">
                        Upload an Excel/CSV file with student data. Download the template for the correct format.
                    </p>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => e.target.files[0] && handleBulkImport(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={formData.personalDetails.fullName}
                                onChange={(e) => handleInputChange('personalDetails.fullName', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.fullName'] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter full name"
                            />
                            {errors['personalDetails.fullName'] && (
                                <p className="text-red-500 text-xs mt-1">{errors['personalDetails.fullName']}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
                            <input
                                type="text"
                                value={formData.personalDetails.fathersName}
                                onChange={(e) => handleInputChange('personalDetails.fathersName', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.fathersName'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.personalDetails.mothersName}
                                onChange={(e) => handleInputChange('personalDetails.mothersName', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.mothersName'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.personalDetails.dateOfBirth}
                                onChange={(e) => handleInputChange('personalDetails.dateOfBirth', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors['personalDetails.dateOfBirth'] && (
                                <p className="text-red-500 text-xs mt-1">{errors['personalDetails.dateOfBirth']}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                            <select
                                value={formData.personalDetails.gender}
                                onChange={(e) => handleInputChange('personalDetails.gender', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.gender'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.personalDetails.aadharNumber}
                                onChange={(e) => handleInputChange('personalDetails.aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.aadharNumber'] ? 'border-red-500' : 'border-gray-300'
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
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.contactDetails.primaryPhone}
                                onChange={(e) => handleInputChange('contactDetails.primaryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.primaryPhone'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.contactDetails.whatsappNumber}
                                onChange={(e) => handleInputChange('contactDetails.whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter WhatsApp number (optional)"
                                maxLength="10"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                            <input
                                type="email"
                                value={formData.contactDetails.email}
                                onChange={(e) => handleInputChange('contactDetails.email', e.target.value.toLowerCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.email'] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter email address"
                            />
                            {errors['contactDetails.email'] && (
                                <p className="text-red-500 text-xs mt-1">{errors['contactDetails.email']}</p>
                            )}
                        </div>

                        {/* Address Fields */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.street}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.street', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter street address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.city}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter city"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <select
                                value={formData.contactDetails.permanentAddress.state}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.state', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                value={formData.contactDetails.permanentAddress.pincode}
                                onChange={(e) => handleInputChange('contactDetails.permanentAddress.pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter 6-digit pincode"
                                maxLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.country}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                disabled
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Course Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Course Selection</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course *</label>
                            <select
                                value={formData.courseDetails.selectedCourse}
                                onChange={(e) => handleInputChange('courseDetails.selectedCourse', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['courseDetails.selectedCourse'] ? 'border-red-500' : 'border-gray-300'
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

                        {formData.courseDetails.selectedCourse === 'Other' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Course</label>
                                <input
                                    type="text"
                                    value={formData.courseDetails.customCourse}
                                    onChange={(e) => handleInputChange('courseDetails.customCourse', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter custom course name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stream/Subject</label>
                            <input
                                type="text"
                                value={formData.courseDetails.stream}
                                onChange={(e) => handleInputChange('courseDetails.stream', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter stream or subject"
                            />
                        </div>

                    </div>
                </motion.div>

                {/* Guardian Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name *</label>
                            <input
                                type="text"
                                value={formData.guardianDetails.guardianName}
                                onChange={(e) => handleInputChange('guardianDetails.guardianName', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.guardianName'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.guardianDetails.relationship}
                                onChange={(e) => handleInputChange('guardianDetails.relationship', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.relationship'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.guardianDetails.guardianPhone}
                                onChange={(e) => handleInputChange('guardianDetails.guardianPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.guardianPhone'] ? 'border-red-500' : 'border-gray-300'
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
                                value={formData.guardianDetails.guardianEmail}
                                onChange={(e) => handleInputChange('guardianDetails.guardianEmail', e.target.value.toLowerCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter guardian's email (optional)"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Submit Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end space-x-4"
                >
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Reset Form
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registering...' : 'Register Student'}
                    </button>
                </motion.div>
            </form>
        </div>
    );
};

export default StudentRegistration;
