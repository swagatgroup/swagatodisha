import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import SimpleDocumentUpload from "../forms/SimpleDocumentUpload";
import ApplicationPDFGenerator from "../forms/ApplicationPDFGenerator";
import TermsAndConditions from "../legal/TermsAndConditions";
import { showSuccessToast, showErrorToast } from "../../utils/sweetAlert";

const SinglePageStudentRegistration = ({
    onStudentUpdate,
    userRole = "student",
    showTitle = true,
}) => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [application, setApplication] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPDFGenerator, setShowPDFGenerator] = useState(false);

    // Generate unique draft key for proper isolation
    const generateDraftKey = () => {
        const userId = user?._id || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return `studentAppDraft_${userRole}_${userId}`;
    };
    const draftKey = generateDraftKey();

    // Function to clear application state and reset form
    const clearApplicationState = () => {
        setApplication(null);
        // Clear any cached application data
        try {
            localStorage.removeItem(`application_${user?._id || "local"}`);
        } catch (e) {
            console.warn("Could not clear cached application data");
        }
    };

    const [formData, setFormData] = useState({
        personalDetails: {
            fullName: "",
            fathersName: "",
            mothersName: "",
            dateOfBirth: "",
            gender: "",
            aadharNumber: "",
        },
        contactDetails: {
            primaryPhone: "",
            whatsappNumber: "",
            email: "",
            permanentAddress: {
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
            },
        },
        courseDetails: {
            institutionName: "",
            courseName: "",
            stream: "",
        },
        guardianDetails: {
            guardianName: "",
            relationship: "",
            guardianPhone: "",
            guardianEmail: "",
        },
        documents: {},
        termsAccepted: false,
        referralCode: "",
    });

    useEffect(() => {
        loadExistingApplication();
        loadDraftData();
    }, []);

    const loadExistingApplication = async () => {
        try {
            const response = await api.get("/api/student-application/my-application");
            if (response.data.success && response.data.data) {
                setApplication(response.data.data);
                const appData = response.data.data;

                setFormData({
                    personalDetails: {
                        fullName: appData.personalDetails?.fullName || "",
                        fathersName: appData.personalDetails?.fathersName || "",
                        mothersName: appData.personalDetails?.mothersName || "",
                        dateOfBirth: appData.personalDetails?.dateOfBirth || "",
                        gender: appData.personalDetails?.gender || "",
                        aadharNumber: appData.personalDetails?.aadharNumber || "",
                    },
                    contactDetails: {
                        primaryPhone: appData.contactDetails?.primaryPhone || "",
                        whatsappNumber: appData.contactDetails?.whatsappNumber || "",
                        email: appData.contactDetails?.email || "",
                        permanentAddress: {
                            street: appData.contactDetails?.permanentAddress?.street || "",
                            city: appData.contactDetails?.permanentAddress?.city || "",
                            state: appData.contactDetails?.permanentAddress?.state || "",
                            pincode: appData.contactDetails?.permanentAddress?.pincode || "",
                            country: appData.contactDetails?.permanentAddress?.country || "India",
                        },
                    },
                    courseDetails: {
                        institutionName: appData.courseDetails?.institutionName || "",
                        courseName: appData.courseDetails?.courseName || "",
                        stream: appData.courseDetails?.stream || "",
                    },
                    guardianDetails: {
                        guardianName: appData.guardianDetails?.guardianName || "",
                        relationship: appData.guardianDetails?.relationship || "",
                        guardianPhone: appData.guardianDetails?.guardianPhone || "",
                        guardianEmail: appData.guardianDetails?.guardianEmail || "",
                    },
                    documents: appData.documents || {},
                    termsAccepted: appData.termsAccepted || false,
                    referralCode: appData.referralInfo?.referralCode || "",
                });
            }
        } catch (error) {
            console.log("No existing application found or error loading:", error.message);
        }
    };

    const loadDraftData = () => {
        try {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...draftData }));
            }
        } catch (error) {
            console.warn("Could not load draft data:", error);
        }
    };

    const saveDraft = async () => {
        try {
            setSaving(true);
            localStorage.setItem(draftKey, JSON.stringify(formData));

            // Also try to save to server if we have an application
            if (application && (application.applicationId || application._id)) {
                const appId = application.applicationId || application._id;
                await api.put(`/api/student-application/${appId}`, formData);
            }

            showSuccessToast("Draft saved successfully!");
        } catch (error) {
            console.error("Error saving draft:", error);
            showErrorToast("Failed to save draft");
        } finally {
            setSaving(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Details Validation
        if (!formData.personalDetails.fullName) {
            newErrors['personalDetails.fullName'] = 'Full name is required';
        }
        if (!formData.personalDetails.fathersName) {
            newErrors['personalDetails.fathersName'] = "Father's name is required";
        }
        if (!formData.personalDetails.mothersName) {
            newErrors['personalDetails.mothersName'] = "Mother's name is required";
        }
        if (!formData.personalDetails.dateOfBirth) {
            newErrors['personalDetails.dateOfBirth'] = 'Date of birth is required';
        }
        if (!formData.personalDetails.gender) {
            newErrors['personalDetails.gender'] = 'Gender is required';
        }
        if (!formData.personalDetails.aadharNumber || !/^\d{12}$/.test(formData.personalDetails.aadharNumber)) {
            newErrors['personalDetails.aadharNumber'] = 'Valid 12-digit Aadhar number is required';
        }

        // Contact Details Validation
        if (!formData.contactDetails.primaryPhone || !/^[6-9]\d{9}$/.test(formData.contactDetails.primaryPhone)) {
            newErrors['contactDetails.primaryPhone'] = 'Valid primary phone number is required';
        }
        if (!formData.contactDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
            newErrors['contactDetails.email'] = 'Valid email address is required';
        }
        if (!formData.contactDetails.permanentAddress.street) {
            newErrors['contactDetails.permanentAddress.street'] = 'Street address is required';
        }
        if (!formData.contactDetails.permanentAddress.city) {
            newErrors['contactDetails.permanentAddress.city'] = 'City is required';
        }
        if (!formData.contactDetails.permanentAddress.state) {
            newErrors['contactDetails.permanentAddress.state'] = 'State is required';
        }
        if (!formData.contactDetails.permanentAddress.pincode || !/^\d{6}$/.test(formData.contactDetails.permanentAddress.pincode)) {
            newErrors['contactDetails.permanentAddress.pincode'] = 'Valid 6-digit pincode is required';
        }

        // Course Details Validation
        if (!formData.courseDetails.institutionName) {
            newErrors['courseDetails.institutionName'] = 'Institution name is required';
        }
        if (!formData.courseDetails.courseName) {
            newErrors['courseDetails.courseName'] = 'Course name is required';
        }

        // Guardian Details Validation
        if (!formData.guardianDetails.guardianName) {
            newErrors['guardianDetails.guardianName'] = 'Guardian name is required';
        }
        if (!formData.guardianDetails.relationship) {
            newErrors['guardianDetails.relationship'] = 'Relationship is required';
        }
        if (!formData.guardianDetails.guardianPhone || !/^[6-9]\d{9}$/.test(formData.guardianDetails.guardianPhone)) {
            newErrors['guardianDetails.guardianPhone'] = 'Valid guardian phone number is required';
        }

        // Terms and Conditions Validation
        if (!formData.termsAccepted) {
            newErrors['termsAccepted'] = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasMinimumForCreate = () => {
        return (
            formData.personalDetails.fullName &&
            formData.contactDetails.email &&
            formData.courseDetails.institutionName &&
            formData.courseDetails.courseName
        );
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showErrorToast("Please fill in all required fields correctly");
            return;
        }

        try {
            setLoading(true);

            // If an application already exists, save latest data then submit
            if (application && (application.applicationId || application._id)) {
                const appId = application.applicationId || application._id;
                console.log('Application ID:', appId);
                console.log('Application object:', application);

                if (!appId) {
                    console.error('Application ID is undefined, cannot proceed with update');
                    showErrorToast('Application ID is missing. Please try creating a new application.');
                    return;
                }

                try {
                    const updateResponse = await api.put(`/api/student-application/${appId}`, formData);
                    console.log('Update response:', updateResponse.data);
                } catch (updateError) {
                    console.error('Error updating application:', updateError);
                    showErrorToast('Failed to update application data. Please try again.');
                    return;
                }

                // Submit the application
                const submitResponse = await api.post(`/api/student-application/${appId}/submit`, {
                    termsAccepted: formData.termsAccepted,
                    termsAcceptedAt: new Date().toISOString()
                });

                if (submitResponse.data.success) {
                    setApplication(submitResponse.data.data);
                    showSuccessToast("Application submitted successfully!");
                    if (onStudentUpdate) {
                        onStudentUpdate(submitResponse.data.data);
                    }
                } else {
                    showErrorToast(submitResponse.data.message || "Failed to submit application");
                }
            } else {
                // Create new application
                const response = await api.post("/api/student-application/create", {
                    ...formData,
                    termsAccepted: formData.termsAccepted,
                    termsAcceptedAt: new Date().toISOString()
                });

                if (response.data.success) {
                    setApplication(response.data.data);
                    showSuccessToast("Application submitted successfully!");

                    if (onStudentUpdate) {
                        onStudentUpdate(response.data.data);
                    }
                } else {
                    console.error("Application creation failed:", response.data);
                    showErrorToast(
                        response.data.message || "Failed to create application. Please try again."
                    );
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
            const serverMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit application";
            showErrorToast(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        setShowPDFGenerator(true);
    };

    const handlePDFGenerated = () => {
        setShowPDFGenerator(false);
        // After PDF generation, proceed to submit
        handleSubmit();
    };

    if (showPDFGenerator) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <ApplicationPDFGenerator
                    formData={formData}
                    application={application}
                    onPDFGenerated={handlePDFGenerated}
                    onCancel={() => setShowPDFGenerator(false)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {showTitle && (
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {userRole === "student"
                            ? "Complete Registration"
                            : "New Student Registration"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {userRole === "student"
                            ? "Complete your registration to access all features"
                            : "Register a new student in the system"}
                    </p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
                {/* Personal Information Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                            Personal Information
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Basic personal details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.personalDetails.fullName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            fullName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your full name"
                            />
                            {errors["personalDetails.fullName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.fullName"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Father's Name *
                            </label>
                            <input
                                type="text"
                                value={formData.personalDetails.fathersName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            fathersName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter father's name"
                            />
                            {errors["personalDetails.fathersName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.fathersName"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mother's Name *
                            </label>
                            <input
                                type="text"
                                value={formData.personalDetails.mothersName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            mothersName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter mother's name"
                            />
                            {errors["personalDetails.mothersName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.mothersName"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                value={formData.personalDetails.dateOfBirth}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            dateOfBirth: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors["personalDetails.dateOfBirth"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.dateOfBirth"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gender *
                            </label>
                            <select
                                value={formData.personalDetails.gender}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            gender: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors["personalDetails.gender"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.gender"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Aadhar Number *
                            </label>
                            <input
                                type="text"
                                value={formData.personalDetails.aadharNumber}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        personalDetails: {
                                            ...prev.personalDetails,
                                            aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12),
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter 12-digit Aadhar number"
                                maxLength="12"
                            />
                            {errors["personalDetails.aadharNumber"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["personalDetails.aadharNumber"]}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Contact Details Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                            Contact Details
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Address and contact information</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Primary Phone *
                            </label>
                            <input
                                type="tel"
                                value={formData.contactDetails.primaryPhone}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            primaryPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter 10-digit phone number"
                                maxLength="10"
                            />
                            {errors["contactDetails.primaryPhone"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.primaryPhone"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                value={formData.contactDetails.whatsappNumber}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter WhatsApp number (optional)"
                                maxLength="10"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.contactDetails.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            email: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter email address"
                            />
                            {errors["contactDetails.email"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.email"]}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.street}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            permanentAddress: {
                                                ...prev.contactDetails.permanentAddress,
                                                street: e.target.value,
                                            },
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter street address"
                            />
                            {errors["contactDetails.permanentAddress.street"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.permanentAddress.street"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.city}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            permanentAddress: {
                                                ...prev.contactDetails.permanentAddress,
                                                city: e.target.value,
                                            },
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter city"
                            />
                            {errors["contactDetails.permanentAddress.city"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.permanentAddress.city"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.state}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            permanentAddress: {
                                                ...prev.contactDetails.permanentAddress,
                                                state: e.target.value,
                                            },
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter state"
                            />
                            {errors["contactDetails.permanentAddress.state"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.permanentAddress.state"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pincode *
                            </label>
                            <input
                                type="text"
                                value={formData.contactDetails.permanentAddress.pincode}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contactDetails: {
                                            ...prev.contactDetails,
                                            permanentAddress: {
                                                ...prev.contactDetails.permanentAddress,
                                                pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                                            },
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter 6-digit pincode"
                                maxLength="6"
                            />
                            {errors["contactDetails.permanentAddress.pincode"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["contactDetails.permanentAddress.pincode"]}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Course Selection Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                            Course Selection
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Enter institution and course details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Institution Name *
                            </label>
                            <input
                                type="text"
                                value={formData.courseDetails.institutionName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        courseDetails: {
                                            ...prev.courseDetails,
                                            institutionName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter institution name"
                            />
                            {errors["courseDetails.institutionName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["courseDetails.institutionName"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Course Name *
                            </label>
                            <input
                                type="text"
                                value={formData.courseDetails.courseName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        courseDetails: {
                                            ...prev.courseDetails,
                                            courseName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter course name"
                            />
                            {errors["courseDetails.courseName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["courseDetails.courseName"]}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stream (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.courseDetails.stream}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        courseDetails: {
                                            ...prev.courseDetails,
                                            stream: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter stream (optional)"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Guardian Details Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                            Guardian Details
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Parent/Guardian information</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Guardian Name *
                            </label>
                            <input
                                type="text"
                                value={formData.guardianDetails.guardianName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        guardianDetails: {
                                            ...prev.guardianDetails,
                                            guardianName: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter guardian name"
                            />
                            {errors["guardianDetails.guardianName"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["guardianDetails.guardianName"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Relationship *
                            </label>
                            <select
                                value={formData.guardianDetails.relationship}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        guardianDetails: {
                                            ...prev.guardianDetails,
                                            relationship: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                            {errors["guardianDetails.relationship"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["guardianDetails.relationship"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Guardian Phone *
                            </label>
                            <input
                                type="tel"
                                value={formData.guardianDetails.guardianPhone}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        guardianDetails: {
                                            ...prev.guardianDetails,
                                            guardianPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter guardian phone number"
                                maxLength="10"
                            />
                            {errors["guardianDetails.guardianPhone"] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors["guardianDetails.guardianPhone"]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Guardian Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={formData.guardianDetails.guardianEmail}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        guardianDetails: {
                                            ...prev.guardianDetails,
                                            guardianEmail: e.target.value,
                                        },
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter guardian email (optional)"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Document Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                            Document Upload
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload required documents</p>
                    </div>

                    <SimpleDocumentUpload
                        onDocumentsChange={(documents) => {
                            setFormData((prev) => ({
                                ...prev,
                                documents: documents,
                            }));
                        }}
                        initialDocuments={formData.documents}
                        isRequired={true}
                    />
                </motion.div>


                {/* Terms and Conditions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                            Terms and Conditions
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and accept terms</p>
                    </div>

                    <TermsAndConditions
                        accepted={formData.termsAccepted}
                        onAccept={(accepted) =>
                            setFormData((prev) => ({ ...prev, termsAccepted: accepted }))
                        }
                    />
                    {errors["termsAccepted"] && (
                        <p className="text-red-500 text-sm mt-2">
                            {errors["termsAccepted"]}
                        </p>
                    )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                    <button
                        type="button"
                        onClick={saveDraft}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Draft"}
                    </button>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleGeneratePDF}
                            disabled={!hasMinimumForCreate()}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate PDF
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !formData.termsAccepted}
                            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Submit Application"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SinglePageStudentRegistration;
