import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import DocumentUpload from '../../shared/DocumentUpload';
import TermsAndConditions from '../../legal/TermsAndConditions';
import { showSuccessToast, showErrorToast } from '../../../utils/sweetAlert';

const StudentRegistrationWorkflow = ({ onStudentUpdate }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [application, setApplication] = useState(null);
    const [errors, setErrors] = useState({});
    const draftKey = `studentAppDraft_${(useAuth()?.user?._id) || 'local'}`;

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
        documents: [],
        termsAccepted: false,
        referralCode: ''
    });

    const steps = [
        { id: 1, title: 'Personal Information', description: 'Basic personal details' },
        { id: 2, title: 'Contact Details', description: 'Address and contact information' },
        { id: 3, title: 'Course Selection', description: 'Choose your course and campus' },
        { id: 4, title: 'Guardian Details', description: 'Guardian information' },
        { id: 5, title: 'Documents', description: 'Upload required documents' },
        { id: 6, title: 'Review & Submit', description: 'Review and finalize application' }
    ];

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
        if (!user) return;
        loadExistingApplication();
    }, [user]);

    const loadExistingApplication = async () => {
        try {
            const response = await api.get('/api/student-application/my-application');
            if (response.data.success && response.data.data) {
                const app = response.data.data;
                setApplication(app);
                setCurrentStep(getCurrentStepFromStage(app.currentStage));

                // Load existing data
                setFormData({
                    personalDetails: app.personalDetails || formData.personalDetails,
                    contactDetails: app.contactDetails || formData.contactDetails,
                    courseDetails: app.courseDetails || formData.courseDetails,
                    guardianDetails: app.guardianDetails || formData.guardianDetails,
                    documents: app.documents || [],
                    termsAccepted: app.termsAccepted || false
                });
            } else {
                // No application yet; try to prefill from user context first, then /me as fallback
                const u = user || {};
                const genderMap = { male: 'Male', female: 'Female', other: 'Other' };
                setFormData(prev => ({
                    ...prev,
                    personalDetails: {
                        ...prev.personalDetails,
                        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                        aadharNumber: u.aadharNumber || u.aadhaarNumber || prev.personalDetails.aadharNumber,
                        gender: genderMap[(u.gender || '').toLowerCase()] || prev.personalDetails.gender,
                        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().substring(0, 10) : prev.personalDetails.dateOfBirth,
                        fathersName: u.fathersName || u.fatherName || prev.personalDetails.fathersName || '',
                        mothersName: u.mothersName || u.motherName || prev.personalDetails.mothersName || ''
                    },
                    contactDetails: {
                        ...prev.contactDetails,
                        primaryPhone: u.phoneNumber || u.phone || prev.contactDetails.primaryPhone,
                        email: u.email || prev.contactDetails.email,
                        permanentAddress: {
                            ...prev.contactDetails.permanentAddress,
                            street: u.address?.street || prev.contactDetails.permanentAddress.street,
                            city: u.address?.city || prev.contactDetails.permanentAddress.city,
                            state: u.address?.state || prev.contactDetails.permanentAddress.state,
                            pincode: u.address?.pincode || prev.contactDetails.permanentAddress.pincode
                        }
                    }
                }));

                try {
                    const me = await api.get('/api/auth/me');
                    if (me.data?.success) {
                        const mu = me.data.data.user || {};
                        const mGender = genderMap[(mu.gender || '').toLowerCase()] || undefined;
                        setFormData(prev => ({
                            ...prev,
                            personalDetails: {
                                ...prev.personalDetails,
                                fullName: prev.personalDetails.fullName || mu.fullName || `${mu.firstName || ''} ${mu.lastName || ''}`.trim(),
                                aadharNumber: prev.personalDetails.aadharNumber || mu.aadharNumber || mu.aadhaarNumber,
                                gender: prev.personalDetails.gender || mGender || '',
                                dateOfBirth: prev.personalDetails.dateOfBirth || (mu.dateOfBirth ? new Date(mu.dateOfBirth).toISOString().substring(0, 10) : ''),
                                fathersName: prev.personalDetails.fathersName || mu.fathersName || mu.fatherName || '',
                                mothersName: prev.personalDetails.mothersName || mu.mothersName || mu.motherName || ''
                            },
                            contactDetails: {
                                ...prev.contactDetails,
                                primaryPhone: prev.contactDetails.primaryPhone || mu.phoneNumber || mu.phone,
                                email: prev.contactDetails.email || mu.email,
                                permanentAddress: {
                                    ...prev.contactDetails.permanentAddress,
                                    street: prev.contactDetails.permanentAddress.street || mu.address?.street,
                                    city: prev.contactDetails.permanentAddress.city || mu.address?.city,
                                    state: prev.contactDetails.permanentAddress.state || mu.address?.state,
                                    pincode: prev.contactDetails.permanentAddress.pincode || mu.address?.pincode
                                }
                            }
                        }));
                        // Load any locally saved draft on top
                        try {
                            const local = localStorage.getItem(draftKey);
                            if (local) {
                                const parsed = JSON.parse(local);
                                setFormData(prev => ({ ...prev, ...parsed }));
                            }
                        } catch (_) { }
                    }
                } catch (_) { }
            }
        } catch (error) {
            if (error?.response?.status === 404) {
                // No existing application is expected for new users
                // Prefill from user context handled below
            } else {
                console.error('Error loading existing application:', error);
            }
            // Attempt prefill from user context even if API fails
            if (user) {
                const genderMap = { male: 'Male', female: 'Female', other: 'Other' };
                setFormData(prev => ({
                    ...prev,
                    personalDetails: {
                        ...prev.personalDetails,
                        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        aadharNumber: user.aadharNumber || user.aadhaarNumber || prev.personalDetails.aadharNumber,
                        gender: genderMap[(user.gender || '').toLowerCase()] || prev.personalDetails.gender,
                        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().substring(0, 10) : prev.personalDetails.dateOfBirth,
                        fathersName: user.fathersName || user.fatherName || prev.personalDetails.fathersName || '',
                        mothersName: user.mothersName || user.motherName || prev.personalDetails.mothersName || ''
                    },
                    contactDetails: {
                        ...prev.contactDetails,
                        primaryPhone: user.phoneNumber || user.phone || prev.contactDetails.primaryPhone,
                        email: user.email || prev.contactDetails.email,
                        permanentAddress: {
                            ...prev.contactDetails.permanentAddress,
                            street: user.address?.street || prev.contactDetails.permanentAddress.street,
                            city: user.address?.city || prev.contactDetails.permanentAddress.city,
                            state: user.address?.state || prev.contactDetails.permanentAddress.state,
                            pincode: user.address?.pincode || prev.contactDetails.permanentAddress.pincode
                        }
                    }
                }));
            }
            // Also attempt to load local draft when API fails/404
            try {
                const local = localStorage.getItem(draftKey);
                if (local) {
                    const parsed = JSON.parse(local);
                    setFormData(prev => ({ ...prev, ...parsed }));
                }
            } catch (_) { }
        }
    };

    const getCurrentStepFromStage = (stage) => {
        switch (stage) {
            case 'REGISTRATION': return 1;
            case 'DOCUMENTS': return 5;
            case 'APPLICATION_PDF': return 6;
            case 'TERMS_CONDITIONS': return 6;
            default: return 1;
        }
    };

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

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1: // Personal Details
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
                break;

            case 2: // Contact Details
                if (!formData.contactDetails.primaryPhone || !/^[6-9]\d{9}$/.test(formData.contactDetails.primaryPhone)) {
                    newErrors['contactDetails.primaryPhone'] = 'Valid 10-digit Indian mobile number is required';
                }
                if (!formData.contactDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
                    newErrors['contactDetails.email'] = 'Valid email address is required';
                }
                if (!formData.contactDetails.permanentAddress.street.trim()) {
                    newErrors['contactDetails.permanentAddress.street'] = 'Street address is required';
                }
                if (!formData.contactDetails.permanentAddress.city.trim()) {
                    newErrors['contactDetails.permanentAddress.city'] = 'City is required';
                }
                if (!formData.contactDetails.permanentAddress.state) {
                    newErrors['contactDetails.permanentAddress.state'] = 'State is required';
                }
                if (!formData.contactDetails.permanentAddress.pincode || !/^\d{6}$/.test(formData.contactDetails.permanentAddress.pincode)) {
                    newErrors['contactDetails.permanentAddress.pincode'] = 'Valid 6-digit pincode is required';
                }
                break;

            case 3: // Course Details
                if (!formData.courseDetails.selectedCourse) {
                    newErrors['courseDetails.selectedCourse'] = 'Course selection is required';
                }
                break;

            case 4: // Guardian Details
                if (!formData.guardianDetails.guardianName.trim()) {
                    newErrors['guardianDetails.guardianName'] = 'Guardian name is required';
                }
                if (!formData.guardianDetails.relationship) {
                    newErrors['guardianDetails.relationship'] = 'Relationship is required';
                }
                if (!formData.guardianDetails.guardianPhone || !/^[6-9]\d{9}$/.test(formData.guardianDetails.guardianPhone)) {
                    newErrors['guardianDetails.guardianPhone'] = 'Valid guardian phone number is required';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasMinimumForCreate = () => {
        const p = formData.personalDetails || {};
        const c = formData.contactDetails || {};
        const a = c.permanentAddress || {};
        const g = formData.guardianDetails || {};
        const cd = formData.courseDetails || {};
        return (
            p.fullName && p.fathersName && p.mothersName && p.dateOfBirth && p.gender && /^\d{12}$/.test(p.aadharNumber || '') &&
            /^[6-9]\d{9}$/.test(c.primaryPhone || '') && c.email && a.street && a.city && a.state && /^\d{6}$/.test(a.pincode || '') &&
            cd.selectedCourse && g.guardianName && g.relationship && /^[6-9]\d{9}$/.test(g.guardianPhone || '')
        );
    };

    const saveDraft = async () => {
        try {
            setSaving(true);
            const stage = getStageFromStep(currentStep);
            if (application?.applicationId) {
                await api.put(`/api/student-application/${application.applicationId}/save-draft`, {
                    data: {
                        personalDetails: formData.personalDetails,
                        contactDetails: formData.contactDetails,
                        courseDetails: formData.courseDetails,
                        guardianDetails: formData.guardianDetails,
                        documents: formData.documents
                    },
                    stage
                });
                showSuccessToast('Draft saved');
            } else {
                // Avoid backend create before step 4 or when data incomplete. Save locally instead.
                if (currentStep < 4 || !hasMinimumForCreate()) {
                    try {
                        const key = `studentAppDraft_${user?._id || 'local'}`;
                        localStorage.setItem(key, JSON.stringify(formData));
                        showSuccessToast('Draft saved locally');
                        return;
                    } catch (_) { }
                }
                try {
                    const response = await api.post('/api/student-application/create', {
                        personalDetails: formData.personalDetails,
                        contactDetails: formData.contactDetails,
                        courseDetails: formData.courseDetails,
                        guardianDetails: formData.guardianDetails,
                        financialDetails: {},
                        referralCode: formData.referralCode || undefined
                    });
                    if (response.data.success) {
                        setApplication(response.data.data);
                        try { localStorage.removeItem(draftKey); } catch (_) { }
                        showSuccessToast('Draft created');
                    }
                } catch (createErr) {
                    console.error('Create draft failed:', createErr);
                    try {
                        const key = `studentAppDraft_${user?._id || 'local'}`;
                        localStorage.setItem(key, JSON.stringify(formData));
                    } catch (_) { }
                    const serverMsg = createErr?.response?.data?.message || 'Server error';
                    showErrorToast(`Draft create failed: ${serverMsg}. Saved locally instead.`);
                }
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            showErrorToast('Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const getStageFromStep = (step) => {
        switch (step) {
            case 1:
            case 2:
            case 3:
            case 4:
                return 'REGISTRATION';
            case 5:
                return 'DOCUMENTS';
            case 6:
                return 'APPLICATION_PDF';
            default:
                return 'REGISTRATION';
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleDocumentUpload = async (document) => {
        const updatedDocs = [...formData.documents, document];
        setFormData(prev => ({
            ...prev,
            documents: updatedDocs
        }));
        try {
            if (application?.applicationId) {
                await api.put(`/api/student-application/${application.applicationId}/save-draft`, {
                    data: { documents: updatedDocs },
                    stage: 'DOCUMENTS'
                });
            }
        } catch (e) {
            console.error('Error saving documents draft:', e);
        }
    };

    const generatePDF = async () => {
        try {
            setLoading(true);
            await api.post(`/api/student-application/${application.applicationId}/generate-pdf`);
            alert('PDF generated. Use Download PDF to get the file.');
            setCurrentStep(6);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const previewPDF = async () => {
        await generatePDF();
    };

    const downloadPDF = async () => {
        try {
            const response = await api.get(`/api/student-application/${application.applicationId}/download-pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `application_${application.applicationId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF. Please try again.');
        }
    };

    const submitApplication = async () => {
        if (!formData.termsAccepted) {
            alert('Please accept the terms and conditions to proceed.');
            return;
        }

        try {
            setLoading(true);
            await api.put(`/api/student-application/${application.applicationId}/submit`, {
                termsAccepted: true
            });

            alert('Application submitted successfully!');
            onStudentUpdate();
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalDetails();
            case 2:
                return renderContactDetails();
            case 3:
                return renderCourseDetails();
            case 4:
                return renderGuardianDetails();
            case 5:
                return renderDocuments();
            case 6:
                return renderReview();
            default:
                return null;
        }
    };

    const renderPersonalDetails = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                        type="text"
                        value={formData.personalDetails.fullName}
                        onChange={(e) => handleInputChange('personalDetails.fullName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.fullName'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        onChange={(e) => handleInputChange('personalDetails.fathersName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.fathersName'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        onChange={(e) => handleInputChange('personalDetails.mothersName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.mothersName'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.gender'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['personalDetails.aadharNumber'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength="12"
                    />
                    {errors['personalDetails.aadharNumber'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['personalDetails.aadharNumber']}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContactDetails = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                        type="tel"
                        value={formData.contactDetails.primaryPhone}
                        onChange={(e) => handleInputChange('contactDetails.primaryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.primaryPhone'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.email'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter email address"
                    />
                    {errors['contactDetails.email'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['contactDetails.email']}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                        type="text"
                        value={formData.contactDetails.permanentAddress.street}
                        onChange={(e) => handleInputChange('contactDetails.permanentAddress.street', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.permanentAddress.street'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter street address"
                    />
                    {errors['contactDetails.permanentAddress.street'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['contactDetails.permanentAddress.street']}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                        type="text"
                        value={formData.contactDetails.permanentAddress.city}
                        onChange={(e) => handleInputChange('contactDetails.permanentAddress.city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.permanentAddress.city'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter city"
                    />
                    {errors['contactDetails.permanentAddress.city'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['contactDetails.permanentAddress.city']}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                        value={formData.contactDetails.permanentAddress.state}
                        onChange={(e) => handleInputChange('contactDetails.permanentAddress.state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.permanentAddress.state'] ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select State</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {errors['contactDetails.permanentAddress.state'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['contactDetails.permanentAddress.state']}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                        type="text"
                        value={formData.contactDetails.permanentAddress.pincode}
                        onChange={(e) => handleInputChange('contactDetails.permanentAddress.pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['contactDetails.permanentAddress.pincode'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                    />
                    {errors['contactDetails.permanentAddress.pincode'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['contactDetails.permanentAddress.pincode']}</p>
                    )}
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
        </div>
    );

    const renderCourseDetails = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Course Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Course *</label>
                    <select
                        value={formData.courseDetails.selectedCourse}
                        onChange={(e) => handleInputChange('courseDetails.selectedCourse', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['courseDetails.selectedCourse'] ? 'border-red-500' : 'border-gray-300'}`}
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
                    <select
                        value={formData.courseDetails.campus}
                        onChange={(e) => handleInputChange('courseDetails.campus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Sargiguda">Sargiguda</option>
                        <option value="Ghantiguda">Ghantiguda</option>
                        <option value="Online">Online</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={formData.referralCode}
                            onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter referral code if you have one"
                        />
                        <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                            Get ₹500 bonus!
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        If someone referred you, enter their referral code to get ₹500 bonus when you enroll!
                    </p>
                </div>
            </div>
        </div>
    );

    const renderGuardianDetails = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Guardian Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name *</label>
                    <input
                        type="text"
                        value={formData.guardianDetails.guardianName}
                        onChange={(e) => handleInputChange('guardianDetails.guardianName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.guardianName'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.relationship'] ? 'border-red-500' : 'border-gray-300'}`}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['guardianDetails.guardianPhone'] ? 'border-red-500' : 'border-gray-300'}`}
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
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
            <p className="text-gray-600">Upload the required documents for your application.</p>

            <DocumentUpload
                onUploadSuccess={handleDocumentUpload}
                existingDocuments={formData.documents}
            />

            <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Required Documents:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>10th Mark Sheet</li>
                    <li>12th Mark Sheet</li>
                    <li>Aadhaar Card</li>
                    <li>Passport Size Photo</li>
                    <li>Signature</li>
                    <li>Any other relevant certificates</li>
                </ul>
            </div>
        </div>
    );

    const renderReview = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>

            {/* Application Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Application Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Name:</span> {formData.personalDetails.fullName}
                    </div>
                    <div>
                        <span className="font-medium">Course:</span> {formData.courseDetails.selectedCourse}
                    </div>
                    <div>
                        <span className="font-medium">Email:</span> {formData.contactDetails.email}
                    </div>
                    <div>
                        <span className="font-medium">Phone:</span> {formData.contactDetails.primaryPhone}
                    </div>

                    <div>
                        <span className="font-medium">Documents:</span> {formData.documents.length} uploaded
                    </div>
                </div>
            </div>

            {/* PDF Generation */}
            <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Application PDF</h4>
                <p className="text-sm text-gray-600 mb-4">
                    Generate a PDF of your application form with all the details you've filled.
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={previewPDF}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Preview PDF'}
                    </button>
                    <button
                        onClick={generatePDF}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate & Download PDF'}
                    </button>
                    {application?.pdfGenerated && (
                        <button
                            onClick={downloadPDF}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Download PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white border rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Terms and Conditions</h4>
                <TermsAndConditions />

                <div className="mt-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.termsAccepted}
                            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                            I have read and agree to the terms and conditions
                        </span>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={submitApplication}
                    disabled={loading || !formData.termsAccepted}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= step.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step.id}
                            </div>
                            <div className="ml-3 hidden sm:block">
                                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`hidden sm:block w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow p-6">
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
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                <div className="flex space-x-4">
                    <button
                        onClick={saveDraft}
                        disabled={saving}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save as Draft'}
                    </button>

                    {currentStep < steps.length && (
                        <button
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRegistrationWorkflow;
