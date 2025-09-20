import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';

const EnhancedStudentApplicationForm = ({ onClose, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        fatherName: '',
        motherName: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',

        // Academic Information
        course: '',
        institution: '',
        preferredStartDate: '',
        previousQualification: '',
        previousInstitution: '',
        previousYear: '',
        previousPercentage: '',

        // Documents
        documents: {
            photo: null,
            signature: null,
            aadharCard: null,
            markSheet: null,
            transferCertificate: null,
            migrationCertificate: null,
            casteCertificate: null,
            incomeCertificate: null,
            otherDocuments: []
        },

        // Additional Information
        notes: '',
        termsAccepted: false,
        privacyAccepted: false
    });

    const [errors, setErrors] = useState({});
    const [isDraft, setIsDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const totalSteps = 5;

    const steps = [
        { number: 1, title: 'Personal Information', description: 'Basic details and contact information' },
        { number: 2, title: 'Academic Information', description: 'Course selection and educational background' },
        { number: 3, title: 'Document Upload', description: 'Required documents and certificates' },
        { number: 4, title: 'Review & Terms', description: 'Review application and accept terms' },
        { number: 5, title: 'Confirmation', description: 'Application submitted successfully' }
    ];

    const courses = [
        'DMLT (Diploma in Medical Laboratory Technology)',
        'BMLT (Bachelor in Medical Laboratory Technology)',
        'D.Pharm (Diploma in Pharmacy)',
        'B.Pharm (Bachelor in Pharmacy)',
        'GNM (General Nursing and Midwifery)',
        'ANM (Auxiliary Nursing and Midwifery)',
        'B.Sc Nursing',
        'BPT (Bachelor of Physiotherapy)',
        'BDS (Bachelor of Dental Surgery)',
        'M.Sc Nursing',
        'M.Pharm',
        'M.Sc Medical Laboratory Technology'
    ];

    const institutions = [
        'Swagat Group of Institutions - Main Campus',
        'Swagat Medical College',
        'Swagat Pharmacy College',
        'Swagat Nursing College',
        'Swagat Physiotherapy College',
        'Swagat Dental College'
    ];

    const documentTypes = [
        { key: 'photo', label: 'Passport Size Photo', required: true, accept: 'image/*' },
        { key: 'signature', label: 'Digital Signature', required: true, accept: 'image/*' },
        { key: 'aadharCard', label: 'Aadhar Card', required: true, accept: 'image/*,.pdf' },
        { key: 'markSheet', label: 'Previous Mark Sheet', required: true, accept: 'image/*,.pdf' },
        { key: 'transferCertificate', label: 'Transfer Certificate', required: true, accept: 'image/*,.pdf' },
        { key: 'migrationCertificate', label: 'Migration Certificate', required: false, accept: 'image/*,.pdf' },
        { key: 'casteCertificate', label: 'Caste Certificate', required: false, accept: 'image/*,.pdf' },
        { key: 'incomeCertificate', label: 'Income Certificate', required: false, accept: 'image/*,.pdf' }
    ];

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
                if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
                if (!formData.email.trim()) newErrors.email = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
                if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                if (!formData.gender) newErrors.gender = 'Gender is required';
                if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
                if (!formData.address.trim()) newErrors.address = 'Address is required';
                if (!formData.city.trim()) newErrors.city = 'City is required';
                if (!formData.state.trim()) newErrors.state = 'State is required';
                if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
                break;

            case 2:
                if (!formData.course) newErrors.course = 'Course selection is required';
                if (!formData.institution) newErrors.institution = 'Institution selection is required';
                if (!formData.preferredStartDate) newErrors.preferredStartDate = 'Preferred start date is required';
                if (!formData.previousQualification.trim()) newErrors.previousQualification = 'Previous qualification is required';
                if (!formData.previousInstitution.trim()) newErrors.previousInstitution = 'Previous institution is required';
                if (!formData.previousYear) newErrors.previousYear = 'Previous year is required';
                if (!formData.previousPercentage) newErrors.previousPercentage = 'Previous percentage is required';
                break;

            case 3:
                documentTypes.forEach(doc => {
                    if (doc.required && !formData.documents[doc.key]) {
                        newErrors[`documents.${doc.key}`] = `${doc.label} is required`;
                    }
                });
                break;

            case 4:
                if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
                if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the privacy policy';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            setUploadProgress(prev => ({ ...prev, [docType]: 0 }));

            const response = await api.post('/api/students/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [docType]: percentCompleted }));
                }
            });

            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [docType]: {
                        file: file,
                        url: response.data.url,
                        id: response.data.id
                    }
                }
            }));

            setUploadProgress(prev => ({ ...prev, [docType]: 100 }));
            showSuccess('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            showError('Failed to upload document. Please try again.');
            setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
        }
    };

    const saveAsDraft = async () => {
        try {
            setIsSubmitting(true);
            const response = await api.post('/api/students/applications/draft', {
                ...formData,
                isDraft: true,
                currentStep: currentStep
            });

            showSuccess('Application saved as draft successfully!');
            setIsDraft(true);
        } catch (error) {
            console.error('Draft save error:', error);
            showError('Failed to save draft. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        try {
            setIsSubmitting(true);
            const response = await api.post('/api/students/applications', {
                ...formData,
                isDraft: false
            });

            showSuccess('Application submitted successfully!');
            onSuccess?.(response.data);
            setCurrentStep(5);
        } catch (error) {
            console.error('Submission error:', error);
            showError('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const generatePDF = async () => {
        try {
            const response = await api.post('/api/students/applications/generate-pdf', {
                applicationId: formData.id || 'draft'
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `application-${formData.firstName}-${formData.lastName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation error:', error);
            showError('Failed to generate PDF. Please try again.');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Personal Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter first name"
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter last name"
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter phone number"
                                    maxLength="10"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gender *
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Father's Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fatherName}
                                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.fatherName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter father's name"
                                />
                                {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mother's Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.motherName}
                                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Enter mother's name"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter complete address"
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter city"
                                />
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter state"
                                />
                                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.pincode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Enter pincode"
                                />
                                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Academic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Selection *
                                </label>
                                <select
                                    value={formData.course}
                                    onChange={(e) => handleInputChange('course', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.course ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((course, index) => (
                                        <option key={index} value={course}>{course}</option>
                                    ))}
                                </select>
                                {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Institution *
                                </label>
                                <select
                                    value={formData.institution}
                                    onChange={(e) => handleInputChange('institution', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.institution ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map((institution, index) => (
                                        <option key={index} value={institution}>{institution}</option>
                                    ))}
                                </select>
                                {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Preferred Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.preferredStartDate}
                                    onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.preferredStartDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {errors.preferredStartDate && <p className="text-red-500 text-sm mt-1">{errors.preferredStartDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previous Qualification *
                                </label>
                                <input
                                    type="text"
                                    value={formData.previousQualification}
                                    onChange={(e) => handleInputChange('previousQualification', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.previousQualification ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="e.g., 12th Standard, B.Sc, etc."
                                />
                                {errors.previousQualification && <p className="text-red-500 text-sm mt-1">{errors.previousQualification}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previous Institution *
                                </label>
                                <input
                                    type="text"
                                    value={formData.previousInstitution}
                                    onChange={(e) => handleInputChange('previousInstitution', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.previousInstitution ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="Name of previous institution"
                                />
                                {errors.previousInstitution && <p className="text-red-500 text-sm mt-1">{errors.previousInstitution}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previous Year *
                                </label>
                                <input
                                    type="number"
                                    value={formData.previousYear}
                                    onChange={(e) => handleInputChange('previousYear', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.previousYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="e.g., 2023"
                                />
                                {errors.previousYear && <p className="text-red-500 text-sm mt-1">{errors.previousYear}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previous Percentage *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.previousPercentage}
                                    onChange={(e) => handleInputChange('previousPercentage', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.previousPercentage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="e.g., 85.5"
                                />
                                {errors.previousPercentage && <p className="text-red-500 text-sm mt-1">{errors.previousPercentage}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Document Upload</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {documentTypes.map((doc) => (
                                <div key={doc.key} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                    </label>

                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                        {formData.documents[doc.key] ? (
                                            <div className="space-y-2">
                                                <div className="text-green-600 dark:text-green-400">
                                                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formData.documents[doc.key].file?.name || 'File uploaded'}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        documents: {
                                                            ...prev.documents,
                                                            [doc.key]: null
                                                        }
                                                    }))}
                                                    className="text-red-500 text-sm hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <input
                                                    type="file"
                                                    accept={doc.accept}
                                                    onChange={(e) => handleDocumentUpload(doc.key, e.target.files[0])}
                                                    className="hidden"
                                                    id={`upload-${doc.key}`}
                                                />
                                                <label
                                                    htmlFor={`upload-${doc.key}`}
                                                    className="cursor-pointer block"
                                                >
                                                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Click to upload {doc.label.toLowerCase()}
                                                    </p>
                                                </label>

                                                {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
                                                    <div className="mt-2">
                                                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${uploadProgress[doc.key]}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{uploadProgress[doc.key]}% uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {errors[`documents.${doc.key}`] && (
                                        <p className="text-red-500 text-sm">{errors[`documents.${doc.key}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Review & Terms</h3>

                        {/* Application Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Application Summary</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Name:</span>
                                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                                        {formData.firstName} {formData.lastName}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Email:</span>
                                    <span className="ml-2 text-gray-800 dark:text-gray-200">{formData.email}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Course:</span>
                                    <span className="ml-2 text-gray-800 dark:text-gray-200">{formData.course}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Institution:</span>
                                    <span className="ml-2 text-gray-800 dark:text-gray-200">{formData.institution}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    id="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="termsAccepted" className="text-sm text-gray-700 dark:text-gray-300">
                                    I have read and agree to the{' '}
                                    <button
                                        type="button"
                                        className="text-purple-600 hover:text-purple-800 underline"
                                        onClick={() => window.open('/terms-and-conditions', '_blank')}
                                    >
                                        Terms and Conditions
                                    </button>
                                    *
                                </label>
                            </div>
                            {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}

                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    id="privacyAccepted"
                                    checked={formData.privacyAccepted}
                                    onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="privacyAccepted" className="text-sm text-gray-700 dark:text-gray-300">
                                    I have read and agree to the{' '}
                                    <button
                                        type="button"
                                        className="text-purple-600 hover:text-purple-800 underline"
                                        onClick={() => window.open('/privacy-policy', '_blank')}
                                    >
                                        Privacy Policy
                                    </button>
                                    *
                                </label>
                            </div>
                            {errors.privacyAccepted && <p className="text-red-500 text-sm">{errors.privacyAccepted}</p>}
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Any additional information you'd like to share..."
                            />
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="text-center space-y-6">
                        <div className="text-green-600 dark:text-green-400">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            Application Submitted Successfully!
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400">
                            Your application has been submitted and is under review. You will receive a confirmation email shortly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={generatePDF}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                Download Application PDF
                            </button>

                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Student Application Form
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            {steps.map((step) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.number
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {step.number}
                                    </div>
                                    {step.number < totalSteps && (
                                        <div className={`w-16 h-1 mx-2 ${currentStep > step.number ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {steps[currentStep - 1]?.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {steps[currentStep - 1]?.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                {currentStep < 5 && (
                    <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                        <div className="flex justify-between">
                            <div className="flex space-x-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Previous
                                    </button>
                                )}

                                <button
                                    onClick={saveAsDraft}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                                </button>
                            </div>

                            <div className="flex space-x-3">
                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedStudentApplicationForm;
