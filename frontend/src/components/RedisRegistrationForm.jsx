import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import api from '../utils/api';
import { showSuccessToast, showErrorToast } from '../utils/sweetAlert';

const RedisRegistrationForm = ({ onStudentUpdate, userRole = 'student' }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submissionId, setSubmissionId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [workflowStatus, setWorkflowStatus] = useState({});
    const [socket, setSocket] = useState(null);
    const [errors, setErrors] = useState({});

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
        },
        financialDetails: {
            annualIncome: '',
            occupation: ''
        },
        documents: {},
        referralCode: ''
    });

    const steps = [
        { id: 1, title: 'Personal Information', description: 'Basic personal details' },
        { id: 2, title: 'Contact Details', description: 'Communication information' },
        { id: 3, title: 'Course Selection', description: 'Choose your course' },
        { id: 4, title: 'Guardian Information', description: 'Parent/Guardian details' },
        { id: 5, title: 'Financial Details', description: 'Income and occupation' },
        { id: 6, title: 'Documents', description: 'Upload required documents' },
        { id: 7, title: 'Review & Submit', description: 'Review and submit application' }
    ];

    // Initialize Socket.IO connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Connected to Redis-powered server');
            newSocket.emit('authenticate', {
                token,
                userRole,
                userId: localStorage.getItem('userId')
            });
        });

        newSocket.on('authenticated', (data) => {
            console.log('Authenticated with Redis system:', data);
        });

        // Listen for workflow progress updates
        newSocket.on('workflow_progress', (data) => {
            if (data.submissionId === submissionId) {
                setProgress(data.progress);
                setWorkflowStatus(prev => ({
                    ...prev,
                    [data.step]: data.result
                }));
            }
        });

        // Listen for application completion
        newSocket.on('application_created', (data) => {
            if (data.submissionId === submissionId) {
                showSuccessToast('Application submitted successfully!');
                setProgress(100);
                if (onStudentUpdate) {
                    onStudentUpdate(data);
                }
            }
        });

        // Listen for errors
        newSocket.on('workflow_error', (data) => {
            if (data.submissionId === submissionId) {
                showErrorToast(`Workflow error: ${data.error}`);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [submissionId, userRole, onStudentUpdate]);

    // Auto-save draft every 30 seconds
    useEffect(() => {
        if (currentStep > 1 && !submissionId) {
            const interval = setInterval(() => {
                saveDraft();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [currentStep, submissionId]);

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.personalDetails.fullName) newErrors.fullName = 'Full name is required';
                if (!formData.personalDetails.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                if (!formData.personalDetails.gender) newErrors.gender = 'Gender is required';
                break;

            case 2:
                if (!formData.contactDetails.email) newErrors.email = 'Email is required';
                if (!formData.contactDetails.primaryPhone) newErrors.primaryPhone = 'Phone number is required';
                break;

            case 3:
                if (!formData.courseDetails.selectedCourse) newErrors.selectedCourse = 'Course selection is required';
                break;

            case 4:
                if (!formData.guardianDetails.guardianName) newErrors.guardianName = 'Guardian name is required';
                if (!formData.guardianDetails.relationship) newErrors.relationship = 'Relationship is required';
                break;

            case 5:
                if (!formData.financialDetails.annualIncome) newErrors.annualIncome = 'Annual income is required';
                if (!formData.financialDetails.occupation) newErrors.occupation = 'Occupation is required';
                break;

            case 6:
                // Document validation can be added here
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveDraft = async () => {
        if (saving) return;

        try {
            setSaving(true);
            const response = await api.post('/api/redis/application/draft', {
                formData,
                currentStep
            });

            if (response.data.success) {
                console.log('Draft saved successfully');
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
        } finally {
            setSaving(false);
        }
    };

    const loadDraft = async (draftId) => {
        try {
            const response = await api.get(`/api/redis/application/draft/${draftId}`);
            if (response.data.success) {
                setFormData(response.data.data.formData);
                setCurrentStep(response.data.data.currentStep);
                showSuccessToast('Draft loaded successfully');
            }
        } catch (error) {
            showErrorToast('Failed to load draft');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleDocumentUpload = async (docType, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', docType);

        try {
            const response = await api.post('/api/redis/document/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [docType]: {
                            file,
                            jobId: response.data.jobId,
                            status: 'processing'
                        }
                    }
                }));

                showSuccessToast('Document upload started');

                // Monitor document processing
                monitorDocumentProcessing(response.data.jobId, docType);
            }
        } catch (error) {
            showErrorToast('Failed to upload document');
        }
    };

    const monitorDocumentProcessing = async (jobId, docType) => {
        const checkStatus = async () => {
            try {
                const response = await api.get(`/api/redis/document/status/${jobId}`);
                if (response.data.success) {
                    const status = response.data.data;

                    setFormData(prev => ({
                        ...prev,
                        documents: {
                            ...prev.documents,
                            [docType]: {
                                ...prev.documents[docType],
                                status: status.status
                            }
                        }
                    }));

                    if (status.status === 'completed') {
                        showSuccessToast('Document processed successfully');
                    } else if (status.status === 'failed') {
                        showErrorToast('Document processing failed');
                    } else {
                        // Continue monitoring
                        setTimeout(checkStatus, 2000);
                    }
                }
            } catch (error) {
                console.error('Error checking document status:', error);
            }
        };

        checkStatus();
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(7)) return;

        try {
            setLoading(true);
            const response = await api.post('/api/redis/application/create', formData);

            if (response.data.success) {
                setSubmissionId(response.data.submissionId);
                setProgress(0);
                showSuccessToast('Application submission started!');

                // Monitor workflow progress
                monitorWorkflowProgress(response.data.submissionId);
            }
        } catch (error) {
            console.error('Submit error:', error);
            showErrorToast('Failed to start application submission');
        } finally {
            setLoading(false);
        }
    };

    const monitorWorkflowProgress = async (submissionId) => {
        const checkProgress = async () => {
            try {
                const response = await api.get(`/api/redis/application/status/${submissionId}`);
                if (response.data.success) {
                    const { progress, status } = response.data.data;
                    setProgress(progress);
                    setWorkflowStatus(status);

                    if (progress < 100) {
                        setTimeout(checkProgress, 2000);
                    }
                }
            } catch (error) {
                console.error('Error checking workflow progress:', error);
            }
        };

        checkProgress();
    };

    const renderProgressBar = () => {
        if (!submissionId) return null;

        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Submission Progress</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                {progress < 100 && (
                    <p className="text-xs text-gray-500 mt-1">
                        Processing your application... This may take a few minutes.
                    </p>
                )}
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.personalDetails.fullName}
                                    onChange={(e) => handleInputChange('personalDetails', {
                                        ...formData.personalDetails,
                                        fullName: e.target.value
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={formData.personalDetails.dateOfBirth}
                                    onChange={(e) => handleInputChange('personalDetails', {
                                        ...formData.personalDetails,
                                        dateOfBirth: e.target.value
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    value={formData.contactDetails.email}
                                    onChange={(e) => handleInputChange('contactDetails', {
                                        ...formData.contactDetails,
                                        email: e.target.value
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.contactDetails.primaryPhone}
                                    onChange={(e) => handleInputChange('contactDetails', {
                                        ...formData.contactDetails,
                                        primaryPhone: e.target.value.replace(/\D/g, '').slice(0, 10)
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    maxLength="10"
                                />
                                {errors.primaryPhone && <p className="text-red-500 text-xs mt-1">{errors.primaryPhone}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Document Upload</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['aadharCard', 'passportPhoto', 'marksheet10th', 'marksheet12th'].map((docType) => (
                                <div key={docType} className="border border-gray-300 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleDocumentUpload(docType, e.target.files[0])}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {formData.documents[docType] && (
                                        <div className="mt-2">
                                            <span className={`text-xs px-2 py-1 rounded ${formData.documents[docType].status === 'completed' ? 'bg-green-100 text-green-800' :
                                                formData.documents[docType].status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {formData.documents[docType].status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Review & Submit</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Personal Details</h4>
                            <p>Name: {formData.personalDetails.fullName}</p>
                            <p>Email: {formData.contactDetails.email}</p>
                            <p>Course: {formData.courseDetails.selectedCourse}</p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mr-2"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                I agree to the terms and conditions
                            </label>
                        </div>
                    </div>
                );

            default:
                return <div>Step {currentStep} content</div>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Student Registration Form
                    </h2>
                    <p className="text-gray-600">
                        Complete your application step by step. Your progress is automatically saved.
                    </p>
                </div>

                {renderProgressBar()}

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step.id}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex space-x-2">
                        {currentStep < 7 && (
                            <button
                                onClick={saveDraft}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                        )}

                        {currentStep < 7 ? (
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || progress > 0}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : progress > 0 ? 'Processing...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedisRegistrationForm;
