import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [applicationId, setApplicationId] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        // Personal Details
        fullName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        aadharNumber: '',

        // Contact Details
        primaryPhone: '',
        alternatePhone: '',
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
        },

        // Academic Details
        previousEducation: {
            qualification: '',
            institution: '',
            year: '',
            percentage: '',
            board: ''
        },
        desiredCourse: '',
        campus: '',

        // Guardian Details
        guardianDetails: {
            fatherName: '',
            motherName: '',
            guardianPhone: '',
            guardianEmail: '',
            occupation: '',
            annualIncome: ''
        }
    });

    const steps = [
        {
            id: 1,
            title: 'Personal Details',
            description: 'Basic personal information',
            fields: ['fullName', 'dateOfBirth', 'gender', 'aadharNumber']
        },
        {
            id: 2,
            title: 'Contact Information',
            description: 'Address and contact details',
            fields: ['primaryPhone', 'email', 'permanentAddress', 'currentAddress']
        },
        {
            id: 3,
            title: 'Academic Background',
            description: 'Previous education and course preferences',
            fields: ['previousEducation', 'desiredCourse', 'campus']
        },
        {
            id: 4,
            title: 'Guardian Information',
            description: 'Parent/Guardian details',
            fields: ['guardianDetails']
        }
    ];

    // Calculate completion percentage
    const calculateCompletion = () => {
        let totalFields = 0;
        let completedFields = 0;

        steps.forEach(step => {
            step.fields.forEach(field => {
                if (field === 'permanentAddress' || field === 'currentAddress') {
                    const address = formData[field];
                    const addressFields = ['street', 'city', 'state', 'pincode'];
                    addressFields.forEach(addrField => {
                        totalFields++;
                        if (address[addrField] && address[addrField].trim() !== '') {
                            completedFields++;
                        }
                    });
                } else if (field === 'previousEducation') {
                    const education = formData[field];
                    const educationFields = ['qualification', 'institution', 'year', 'percentage'];
                    educationFields.forEach(eduField => {
                        totalFields++;
                        if (education[eduField] && education[eduField].toString().trim() !== '') {
                            completedFields++;
                        }
                    });
                } else if (field === 'guardianDetails') {
                    const guardian = formData[field];
                    const guardianFields = ['fatherName', 'motherName', 'guardianPhone'];
                    guardianFields.forEach(guardField => {
                        totalFields++;
                        if (guardian[guardField] && guardian[guardField].trim() !== '') {
                            completedFields++;
                        }
                    });
                } else {
                    totalFields++;
                    if (formData[field] && formData[field].toString().trim() !== '') {
                        completedFields++;
                    }
                }
            });
        });

        return Math.round((completedFields / totalFields) * 100);
    };

    // Update completion status
    useEffect(() => {
        const percentage = calculateCompletion();
        setCompletionPercentage(percentage);

        const completed = steps.filter(step => {
            return step.fields.every(field => {
                if (field === 'permanentAddress' || field === 'currentAddress') {
                    const address = formData[field];
                    return address.street && address.city && address.state && address.pincode;
                } else if (field === 'previousEducation') {
                    const education = formData[field];
                    return education.qualification && education.institution && education.year;
                } else if (field === 'guardianDetails') {
                    const guardian = formData[field];
                    return guardian.fatherName && guardian.motherName && guardian.guardianPhone;
                } else {
                    return formData[field] && formData[field].toString().trim() !== '';
                }
            });
        }).map(step => step.id);

        setCompletedSteps(completed);
    }, [formData]);

    // Load existing data
    useEffect(() => {
        if (isOpen && user?._id) {
            loadExistingData();
        }
    }, [isOpen, user?._id]);

    const loadExistingData = async () => {
        try {
            setLoading(true);
            // Try existing application
            const appRes = await api.get('/api/student-application/my-application');
            if (appRes.data?.success && appRes.data.data) {
                const app = appRes.data.data;
                setApplicationId(app.applicationId);
                setFormData(prev => ({
                    ...prev,
                    fullName: app.personalDetails?.fullName || prev.fullName,
                    dateOfBirth: app.personalDetails?.dateOfBirth ? new Date(app.personalDetails.dateOfBirth).toISOString().substring(0, 10) : prev.dateOfBirth,
                    gender: app.personalDetails?.gender || prev.gender,
                    aadharNumber: app.personalDetails?.aadharNumber || prev.aadharNumber,
                    primaryPhone: app.contactDetails?.primaryPhone || prev.primaryPhone,
                    alternatePhone: app.contactDetails?.whatsappNumber || prev.alternatePhone,
                    email: app.contactDetails?.email || prev.email,
                    permanentAddress: {
                        street: app.contactDetails?.permanentAddress?.street || '',
                        city: app.contactDetails?.permanentAddress?.city || '',
                        state: app.contactDetails?.permanentAddress?.state || '',
                        pincode: app.contactDetails?.permanentAddress?.pincode || '',
                        country: app.contactDetails?.permanentAddress?.country || 'India'
                    },
                    currentAddress: {
                        street: app.contactDetails?.currentAddress?.street || '',
                        city: app.contactDetails?.currentAddress?.city || '',
                        state: app.contactDetails?.currentAddress?.state || '',
                        pincode: app.contactDetails?.currentAddress?.pincode || '',
                        country: app.contactDetails?.currentAddress?.country || 'India'
                    },
                    previousEducation: {
                        qualification: app.academicDetails?.qualification || '',
                        institution: app.academicDetails?.institution || '',
                        year: app.academicDetails?.year || '',
                        percentage: app.academicDetails?.percentage || '',
                        board: app.academicDetails?.board || ''
                    },
                    desiredCourse: app.courseDetails?.selectedCourse || '',
                    campus: app.courseDetails?.campus || '',
                    guardianDetails: {
                        fatherName: app.guardianDetails?.guardianName || '',
                        motherName: app.guardianDetails?.motherName || '',
                        guardianPhone: app.guardianDetails?.guardianPhone || '',
                        guardianEmail: app.guardianDetails?.guardianEmail || '',
                        occupation: '',
                        annualIncome: ''
                    }
                }));
                // Load any locally saved step state
                const draft = localStorage.getItem(`profileDraft_${user._id}`);
                if (draft) {
                    const d = JSON.parse(draft);
                    setCurrentStep(d.currentStep || 1);
                    setCompletedSteps(d.completedSteps || []);
                }
            } else {
                // No application yet; try local draft
                const draft = localStorage.getItem(`profileDraft_${user._id}`);
                if (draft) {
                    const d = JSON.parse(draft);
                    setFormData(d.formData || formData);
                    setCurrentStep(d.currentStep || 1);
                    setCompletedSteps(d.completedSteps || []);
                }
            }
        } catch (error) {
            console.error('Error loading existing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Persist to localStorage to avoid data loss between sessions
            localStorage.setItem(`profileDraft_${user._id}`, JSON.stringify({
                formData,
                completedSteps,
                currentStep,
                completionPercentage
            }));
            showSuccess('Draft Saved', 'Your progress has been saved. You can continue anytime.');
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Save Failed', 'Failed to save your profile locally.');
        } finally {
            setSaving(false);
        }
    };

    const handleComplete = async () => {
        if (completionPercentage < 100) {
            showError('Incomplete Profile', 'Please complete all required fields before submitting.');
            return;
        }

        try {
            setSaving(true);
            // Construct payload matching backend StudentApplication expectations
            const personalDetails = {
                fullName: formData.fullName,
                fathersName: formData.guardianDetails.fatherName,
                mothersName: formData.guardianDetails.motherName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                aadharNumber: formData.aadharNumber
            };
            const contactDetails = {
                primaryPhone: formData.primaryPhone,
                whatsappNumber: formData.alternatePhone || '',
                email: formData.email,
                permanentAddress: formData.permanentAddress,
                currentAddress: formData.currentAddress
            };
            const courseDetails = {
                selectedCourse: formData.desiredCourse,
                campus: formData.campus
            };
            const guardianDetails = {
                guardianName: formData.guardianDetails.fatherName,
                relationship: 'Father',
                guardianPhone: formData.guardianDetails.guardianPhone,
                guardianEmail: formData.guardianDetails.guardianEmail || ''
            };

            const createRes = await api.post('/api/student-application/create', {
                personalDetails,
                contactDetails,
                courseDetails,
                guardianDetails
            });

            if (createRes.data?.success) {
                const app = createRes.data.data;
                setApplicationId(app.applicationId);
                // Clear local draft on success
                localStorage.removeItem(`profileDraft_${user._id}`);
                showSuccess('Profile Complete!', 'Application created. Proceed to upload documents.');
                onComplete(app.applicationId);
            }
        } catch (error) {
            console.error('Error completing profile:', error);
            showError('Completion Failed', 'Failed to complete your profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderStepContent = () => {
        const step = steps[currentStep - 1];

        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender *
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Aadhar Number *
                            </label>
                            <input
                                type="text"
                                value={formData.aadharNumber}
                                onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter 12-digit Aadhar number"
                                maxLength="12"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group
                            </label>
                            <select
                                value={formData.bloodGroup}
                                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Primary Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.primaryPhone}
                                    onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter 10-digit phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alternate Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.alternatePhone}
                                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter alternate phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Permanent Address *</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.street}
                                        onChange={(e) => handleInputChange('permanentAddress.street', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.city}
                                        onChange={(e) => handleInputChange('permanentAddress.city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.state}
                                        onChange={(e) => handleInputChange('permanentAddress.state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.pincode}
                                        onChange={(e) => handleInputChange('permanentAddress.pincode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Current Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        value={formData.currentAddress.street}
                                        onChange={(e) => handleInputChange('currentAddress.street', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.currentAddress.city}
                                        onChange={(e) => handleInputChange('currentAddress.city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.currentAddress.state}
                                        onChange={(e) => handleInputChange('currentAddress.state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.currentAddress.pincode}
                                        onChange={(e) => handleInputChange('currentAddress.pincode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Previous Education *</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Qualification *
                                    </label>
                                    <select
                                        value={formData.previousEducation.qualification}
                                        onChange={(e) => handleInputChange('previousEducation.qualification', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select Qualification</option>
                                        <option value="10th">10th Standard</option>
                                        <option value="12th">12th Standard</option>
                                        <option value="Diploma">Diploma</option>
                                        <option value="Graduate">Graduate</option>
                                        <option value="Post Graduate">Post Graduate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institution *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.previousEducation.institution}
                                        onChange={(e) => handleInputChange('previousEducation.institution', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Institution Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year of Passing *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.previousEducation.year}
                                        onChange={(e) => handleInputChange('previousEducation.year', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Year"
                                        min="1990"
                                        max="2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Percentage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.previousEducation.percentage}
                                        onChange={(e) => handleInputChange('previousEducation.percentage', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Percentage"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Board
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.previousEducation.board}
                                        onChange={(e) => handleInputChange('previousEducation.board', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Board/University"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Desired Course *
                            </label>
                            <select
                                value={formData.desiredCourse}
                                onChange={(e) => handleInputChange('desiredCourse', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Course</option>
                                <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                                <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                                <option value="B.Tech Electrical Engineering">B.Tech Electrical Engineering</option>
                                <option value="B.Tech Civil Engineering">B.Tech Civil Engineering</option>
                                <option value="MBA">MBA</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                                <option value="B.Com">B.Com</option>
                                <option value="M.Com">M.Com</option>
                                <option value="BA">BA</option>
                                <option value="MA English">MA English</option>
                                <option value="BSc Mathematics">BSc Mathematics</option>
                                <option value="MSc Physics">MSc Physics</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Campus *
                            </label>
                            <select
                                value={formData.campus}
                                onChange={(e) => handleInputChange('campus', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Campus</option>
                                <option value="Sargiguda">Sargiguda</option>
                                <option value="Ghantiguda">Ghantiguda</option>
                            </select>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Father's Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.guardianDetails.fatherName}
                                    onChange={(e) => handleInputChange('guardianDetails.fatherName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Father's Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mother's Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.guardianDetails.motherName}
                                    onChange={(e) => handleInputChange('guardianDetails.motherName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Mother's Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.guardianDetails.guardianPhone}
                                    onChange={(e) => handleInputChange('guardianDetails.guardianPhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Guardian Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.guardianDetails.guardianEmail}
                                    onChange={(e) => handleInputChange('guardianDetails.guardianEmail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Guardian Email"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    value={formData.guardianDetails.occupation}
                                    onChange={(e) => handleInputChange('guardianDetails.occupation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Occupation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Annual Income
                                </label>
                                <input
                                    type="number"
                                    value={formData.guardianDetails.annualIncome}
                                    onChange={(e) => handleInputChange('guardianDetails.annualIncome', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Annual Income"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Complete Your Profile
                                    </h3>
                                    <p className="text-gray-600">
                                        Step {currentStep} of {steps.length} - {steps[currentStep - 1]?.title}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Progress</span>
                                    <span>{completionPercentage}% Complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <motion.div
                                        className="bg-purple-600 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Step Indicators */}
                            <div className="flex justify-between mb-8">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex flex-col items-center ${currentStep === step.id ? 'text-purple-600' :
                                            completedSteps.includes(step.id) ? 'text-green-600' :
                                                'text-gray-400'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.id ? 'bg-purple-100' :
                                            completedSteps.includes(step.id) ? 'bg-green-100' :
                                                'bg-gray-100'
                                            }`}>
                                            {completedSteps.includes(step.id) ? '✓' : step.id}
                                        </div>
                                        <span className="text-xs mt-1 text-center">{step.title}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="min-h-[400px]">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : (
                                    renderStepContent()
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between mt-8">
                                <div>
                                    {currentStep > 1 && (
                                        <button
                                            onClick={handlePrevious}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            Previous
                                        </button>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Draft'}
                                    </button>

                                    {currentStep < steps.length ? (
                                        <button
                                            onClick={handleNext}
                                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleComplete}
                                            disabled={saving || completionPercentage < 100}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Completing...' : 'Complete Profile'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileCompletionModal;
