import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import SimpleDocumentUpload from "../forms/SimpleDocumentUpload";
import ApplicationPDFGenerator from "../forms/ApplicationPDFGenerator";
import TermsAndConditions from "../legal/TermsAndConditions";
import { showSuccessToast, showErrorToast } from "../../utils/sweetAlert";
import { formatDateForInput } from "../../utils/dateUtils";

const SinglePageStudentRegistration = ({
    onStudentUpdate,
    userRole = "student",
    showTitle = true,
}) => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [pdfGenerated, setPdfGenerated] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPDFGenerator, setShowPDFGenerator] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [application, setApplication] = useState(null);
    const [errors, setErrors] = useState({});
    const [colleges, setColleges] = useState([]);
    const [loadingColleges, setLoadingColleges] = useState(false);

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
            aadharNumber: "",
            gender: "",
            category: "",
        },
        contactDetails: {
            email: "",
            primaryPhone: "",
            whatsappNumber: "",
            currentAddress: {
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
            },
            permanentAddress: {
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
            },
        },
        courseDetails: {
            selectedCollege: "",
            selectedCourse: "",
            stream: "",
        },
        guardianDetails: {
            guardianName: "",
            relationship: "",
            guardianPhone: "",
            guardianEmail: "",
        },
        documents: [],
        termsAccepted: false,
    });

    // Fetch colleges on mount
    const fetchColleges = async () => {
        try {
            setLoadingColleges(true);
            const response = await api.get('/api/colleges/public');
            if (response.data.success) {
                setColleges(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
        } finally {
            setLoadingColleges(false);
        }
    };

    // Get courses for selected college
    const getCoursesForCollege = () => {
        if (!formData.courseDetails.selectedCollege) {
            return [];
        }
        const selectedCollegeData = colleges.find(
            (college) => college._id === formData.courseDetails.selectedCollege
        );
        return selectedCollegeData?.courses || [];
    };

    // Get streams for selected course
    const getStreamsForCourse = () => {
        if (!formData.courseDetails.selectedCourse) {
            return [];
        }
        const availableCourses = getCoursesForCollege();
        const selectedCourse = availableCourses.find(
            (course) => course.courseName === formData.courseDetails.selectedCourse
        );
        return selectedCourse?.streams || [];
    };

    // Load existing application on mount
    useEffect(() => {
        fetchColleges();

        // Refresh colleges every 30 seconds to get latest updates
        const interval = setInterval(() => {
            fetchColleges();
        }, 30000);

        const loadExistingApplication = async () => {
            if (user && token) {
                try {
                    const response = await api.get("/api/student-application/my-application");
                    if (response.data.success && response.data.data) {
                        setApplication(response.data.data);
                        // Populate form with existing data
                        const existingData = response.data.data;
                        setFormData({
                            personalDetails: existingData.personalDetails || formData.personalDetails,
                            contactDetails: existingData.contactDetails || formData.contactDetails,
                            courseDetails: existingData.courseDetails || formData.courseDetails,
                            guardianDetails: existingData.guardianDetails || formData.guardianDetails,
                            documents: existingData.documents || [],
                            termsAccepted: existingData.termsAccepted || false,
                        });
                    }
                } catch (error) {
                    console.log("No existing application found");
                }
            }
        };

        loadExistingApplication();

        return () => {
            clearInterval(interval);
        };
    }, [user, token]);

    const validateForm = () => {
        const newErrors = {};

        // Personal Details validation
        if (!formData.personalDetails.fullName.trim()) {
            newErrors["personalDetails.fullName"] = "Full name is required";
        }
        if (!formData.personalDetails.dateOfBirth) {
            newErrors["personalDetails.dateOfBirth"] = "Date of birth is required";
        }
        if (!formData.personalDetails.gender) {
            newErrors["personalDetails.gender"] = "Gender is required";
        }
        if (!formData.personalDetails.aadharNumber || formData.personalDetails.aadharNumber.length !== 12) {
            newErrors["personalDetails.aadharNumber"] = "Valid 12-digit Aadhar number is required";
        }
        if (!formData.personalDetails.fathersName.trim()) {
            newErrors["personalDetails.fathersName"] = "Father's name is required";
        }
        if (!formData.personalDetails.mothersName.trim()) {
            newErrors["personalDetails.mothersName"] = "Mother's name is required";
        }
        if (!formData.personalDetails.category) {
            newErrors["personalDetails.category"] = "Category is required";
        }

        // Contact Details validation
        if (!formData.contactDetails.email.trim()) {
            newErrors["contactDetails.email"] = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.contactDetails.email)) {
            newErrors["contactDetails.email"] = "Valid email is required";
        }
        if (!formData.contactDetails.primaryPhone || formData.contactDetails.primaryPhone.length !== 10) {
            newErrors["contactDetails.primaryPhone"] = "Valid 10-digit phone number is required";
        }
        if (!formData.contactDetails.permanentAddress.street.trim()) {
            newErrors["contactDetails.permanentAddress.street"] = "Street address is required";
        }
        if (!formData.contactDetails.permanentAddress.city.trim()) {
            newErrors["contactDetails.permanentAddress.city"] = "City is required";
        }
        if (!formData.contactDetails.permanentAddress.state.trim()) {
            newErrors["contactDetails.permanentAddress.state"] = "State is required";
        }
        if (!formData.contactDetails.permanentAddress.pincode || formData.contactDetails.permanentAddress.pincode.length !== 6) {
            newErrors["contactDetails.permanentAddress.pincode"] = "Valid 6-digit pincode is required";
        }

        // Course Details validation
        if (!formData.courseDetails.selectedCollege) {
            newErrors["courseDetails.selectedCollege"] = "Institution selection is required";
        }
        if (!formData.courseDetails.selectedCourse.trim()) {
            newErrors["courseDetails.selectedCourse"] = "Course selection is required";
        }

        // Guardian Details validation
        if (!formData.guardianDetails.guardianName.trim()) {
            newErrors["guardianDetails.guardianName"] = "Guardian name is required";
        }
        if (!formData.guardianDetails.relationship) {
            newErrors["guardianDetails.relationship"] = "Relationship is required";
        }
        if (!formData.guardianDetails.guardianPhone || formData.guardianDetails.guardianPhone.length !== 10) {
            newErrors["guardianDetails.guardianPhone"] = "Valid 10-digit guardian phone is required";
        }

        // Terms validation
        if (!formData.termsAccepted) {
            newErrors["termsAccepted"] = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasMinimumForCreate = () => {
        return (
            formData.personalDetails.fullName &&
            formData.contactDetails.email &&
            formData.courseDetails.selectedCollege &&
            formData.courseDetails.selectedCourse
        );
    };

    const saveDraft = async () => {
        if (!hasMinimumForCreate()) {
            showErrorToast("Please fill in at least the basic required fields before saving");
            return;
        }

        try {
            setSaving(true);

            // If user is authenticated, try to save to server
            if (user && token) {
                try {
                    if (application && application.applicationId) {
                        // Update existing application
                        await api.put(`/api/student-application/${application.applicationId}/save-draft`, {
                            data: {
                                personalDetails: formData.personalDetails,
                                contactDetails: formData.contactDetails,
                                courseDetails: formData.courseDetails,
                                guardianDetails: formData.guardianDetails,
                                documents: formData.documents,
                            },
                            stage: "REGISTRATION",
                        });
                    } else {
                        // Create new application
                        const response = await api.post("/api/student-application/create", {
                            personalDetails: formData.personalDetails,
                            contactDetails: formData.contactDetails,
                            courseDetails: formData.courseDetails,
                            guardianDetails: formData.guardianDetails,
                            financialDetails: {},
                            referralCode: formData.referralCode || undefined,
                        });
                        if (response.data.success) {
                            setApplication(response.data.data);
                            showSuccessToast("Draft created on server");
                        }
                    }
                } catch (createErr) {
                    console.error("Create draft failed:", createErr);
                    // Fallback to local save
                    try {
                        const key = generateDraftKey();
                        localStorage.setItem(key, JSON.stringify(formData));
                        showSuccessToast("Draft saved locally (server unavailable)");
                    } catch (_) { }
                }
            } else {
                // User not authenticated, save locally
                try {
                    const key = generateDraftKey();
                    localStorage.setItem(key, JSON.stringify(formData));
                    showSuccessToast("Draft saved locally");
                } catch (_) { }
            }
        } catch (error) {
            console.error("Error saving draft:", error);
            showErrorToast("Failed to save draft");
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePDF = async () => {
        setShowPDFGenerator(true);
    };

    const handlePDFGenerated = (pdfBlobUrl) => {
        setPdfUrl(pdfBlobUrl);
        setPdfGenerated(true);
        setShowPDFGenerator(false);
        showSuccessToast("PDF generated successfully! You can now download or preview it.");
    };

    const downloadPDF = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `student-application-${formData.personalDetails.fullName || 'application'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const previewPDF = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    const handleRegeneratePDF = () => {
        // Clear existing PDF data
        setPdfUrl(null);
        setPdfGenerated(false);

        // Show the PDF generator modal again
        setShowPDFGenerator(true);

        showSuccessToast("Regenerating PDF with latest form data...");
    };

    const debugDocuments = () => {
        console.log('=== DEBUG DOCUMENTS ===');
        console.log('Current documents:', formData.documents);
        console.log('Document count:', Object.keys(formData.documents || {}).length);
        console.log('Document keys:', Object.keys(formData.documents || {}));
        console.log('========================');
    };

    const fillMockData = () => {
        const mockData = {
            personalDetails: {
                fullName: "John Doe",
                dateOfBirth: "2000-01-15",
                gender: "Male",
                aadharNumber: "123456789012",
                category: "OBC",
                fathersName: "Robert Doe",
                mothersName: "Mary Doe",
            },
            contactDetails: {
                email: "john.doe@example.com",
                primaryPhone: "9876543210",
                whatsappNumber: "9876543210",
                communicationMode: ["Email", "WhatsApp"],
                permanentAddress: {
                    street: "123 Main Street, Block A",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                },
                presentAddress: {
                    street: "123 Main Street, Block A",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                },
            },
            courseDetails: {
                institutionName: "Sample College",
                courseName: "Bachelor of Technology",
                stream: "Computer Science",
            },
            guardianDetails: {
                guardianName: "Robert Doe",
                relationship: "Father",
                guardianPhone: "9876543211",
                guardianEmail: "robert.doe@example.com",
            },
            referralCode: "age87a25",
            documents: {
                passport_photo: { name: "passport-photo.jpg", size: 512000, downloadUrl: "http://example.com/passport-photo.jpg" },
                aadhar_card: { name: "aadhar-card.pdf", size: 1024000, downloadUrl: "http://example.com/aadhar-card.pdf" },
                caste_certificate: { name: "caste-certificate.pdf", size: 1536000, downloadUrl: "http://example.com/caste-certificate.pdf" },
                income_certificate: { name: "income-certificate.pdf", size: 2048000, downloadUrl: "http://example.com/income-certificate.pdf" },
                marksheet_10th: { name: "10th-marksheet.pdf", size: 1792000, downloadUrl: "http://example.com/10th-marksheet.pdf" },
                resident_certificate: { name: "resident-certificate.pdf", size: 1280000, downloadUrl: "http://example.com/resident-certificate.pdf" },
            },
        };

        setFormData(mockData);
        showSuccessToast("Mock data filled successfully! You can now test PDF generation.");
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
                    // First, try to verify the application exists in the database
                    const verifyRes = await api.get(`/api/student-application/my-application`);
                    if (!verifyRes.data.success || !verifyRes.data.data) {
                        console.log('Application not found in database, clearing local state and creating new one');
                        showErrorToast('Previous application not found. Creating a new application...');
                        clearApplicationState();
                        // Fall through to create new application
                    } else {
                        // Application exists, proceed with update
                        try {
                            // Convert documents object to array format expected by backend
                            const documentsArray = Object.entries(formData.documents || {}).map(([key, doc]) => ({
                                documentType: key,
                                fileName: doc.name || doc.fileName || 'unknown',
                                filePath: doc.downloadUrl || doc.filePath || '',
                                fileSize: doc.size || 0,
                                mimeType: doc.type || doc.mimeType || 'application/octet-stream',
                                status: 'PENDING' // Valid enum: PENDING, APPROVED, REJECTED
                            }));

                            await api.put(
                                `/api/student-application/${appId}/save-draft`,
                                {
                                    data: {
                                        personalDetails: formData.personalDetails,
                                        contactDetails: formData.contactDetails,
                                        courseDetails: {
                                            selectedCollege: formData.courseDetails?.selectedCollege || '',
                                            selectedCourse: formData.courseDetails?.selectedCourse || '',
                                            stream: formData.courseDetails?.stream || '',
                                            institutionName: colleges.find(c => c._id === formData.courseDetails?.selectedCollege)?.name || '',
                                            courseName: formData.courseDetails?.selectedCourse || ''
                                        },
                                        guardianDetails: formData.guardianDetails,
                                        documents: documentsArray,
                                    },
                                    stage: "APPLICATION_PDF",
                                }
                            );
                        } catch (e) {
                            // proceed to submit even if draft save fails; backend validates progress
                            console.warn(
                                "Draft save before submit failed:",
                                e?.response?.data || e?.message
                            );
                        }

                        const submitRes = await api.put(
                            `/api/student-application/${appId}/submit`,
                            {
                                termsAccepted: true,
                            }
                        );

                        if (submitRes.data.success) {
                            showSuccessToast("Application submitted successfully! Redirecting to dashboard...");
                            if (onStudentUpdate) onStudentUpdate(submitRes.data.data);

                            // Redirect to dashboard after brief delay
                            setTimeout(() => {
                                navigate('/dashboard');
                            }, 1500);
                        }
                        return;
                    }
                } catch (verifyError) {
                    console.log('Error verifying application, clearing local state and creating new one');
                    clearApplicationState();
                    // Fall through to create new application
                }
            }

            // Use MongoDB endpoint directly
            let response;
            try {
                // Convert documents object to array format expected by backend
                const documentsArray = Object.entries(formData.documents || {}).map(([key, doc]) => ({
                    documentType: key,
                    fileName: doc.name || doc.fileName || 'unknown',
                    filePath: doc.downloadUrl || doc.filePath || '',
                    fileSize: doc.size || 0,
                    mimeType: doc.type || doc.mimeType || 'application/octet-stream',
                    status: 'PENDING' // Valid enum: PENDING, APPROVED, REJECTED
                }));

                // Sanitize phone numbers (remove spaces, +, -, etc.)
                const sanitizePhone = (phone) => {
                    if (!phone) return phone;
                    return phone.toString().replace(/[\s\+\-\(\)]/g, '').trim();
                };

                // Get college and course names for backend compatibility
                const selectedCollegeData = colleges.find(c => c._id === formData.courseDetails?.selectedCollege);
                const submitData = {
                    ...formData,
                    documents: documentsArray,
                    termsAccepted: true,
                    courseDetails: {
                        selectedCollege: formData.courseDetails?.selectedCollege || '',
                        selectedCourse: formData.courseDetails?.selectedCourse || '',
                        stream: formData.courseDetails?.stream || '',
                        institutionName: selectedCollegeData?.name || '',
                        courseName: formData.courseDetails?.selectedCourse || ''
                    },
                    contactDetails: {
                        ...formData.contactDetails,
                        primaryPhone: sanitizePhone(formData.contactDetails?.primaryPhone),
                        whatsappNumber: sanitizePhone(formData.contactDetails?.whatsappNumber)
                    },
                    guardianDetails: {
                        ...formData.guardianDetails,
                        guardianPhone: sanitizePhone(formData.guardianDetails?.guardianPhone)
                    }
                };
                console.log('Submitting application with data:', submitData);
                console.log('Guardian phone validation:', {
                    phone: submitData.guardianDetails?.guardianPhone,
                    length: submitData.guardianDetails?.guardianPhone?.length,
                    regexTest: /^[6-9]\d{9}$/.test(submitData.guardianDetails?.guardianPhone || ''),
                    match: submitData.guardianDetails?.guardianPhone?.match(/^[6-9]\d{9}$/)
                });
                response = await api.post("/api/application/create", submitData);
            } catch (error) {
                if (error.response?.status === 400) {
                    const serverMsg = error.response?.data?.message || "";
                    if (
                        serverMsg?.toLowerCase().includes("already have an application")
                    ) {
                        try {
                            const existing = await api.get(
                                "/api/student-application/my-application"
                            );
                            if (
                                existing.data?.success &&
                                existing.data?.data?.applicationId
                            ) {
                                setApplication(existing.data.data);
                                // Save draft with latest data then submit
                                try {
                                    // Convert documents object to array format expected by backend
                                    const documentsArray = Object.entries(formData.documents || {}).map(([key, doc]) => ({
                                        documentType: key,
                                        fileName: doc.name || doc.fileName || 'unknown',
                                        filePath: doc.downloadUrl || doc.filePath || '',
                                        fileSize: doc.size || 0,
                                        mimeType: doc.type || doc.mimeType || 'application/octet-stream',
                                        status: 'PENDING' // Valid enum: PENDING, APPROVED, REJECTED
                                    }));

                                    await api.put(
                                        `/api/student-application/${existing.data.data.applicationId}/save-draft`,
                                        {
                                            data: {
                                                personalDetails: formData.personalDetails,
                                                contactDetails: formData.contactDetails,
                                                courseDetails: {
                                                    selectedCollege: formData.courseDetails?.selectedCollege || '',
                                                    selectedCourse: formData.courseDetails?.selectedCourse || '',
                                                    stream: formData.courseDetails?.stream || '',
                                                    institutionName: colleges.find(c => c._id === formData.courseDetails?.selectedCollege)?.name || '',
                                                    courseName: formData.courseDetails?.selectedCourse || ''
                                                },
                                                guardianDetails: formData.guardianDetails,
                                                documents: documentsArray,
                                            },
                                            stage: "APPLICATION_PDF",
                                        }
                                    );
                                } catch (_) { }
                                const submitRes = await api.put(
                                    `/api/student-application/${existing.data.data.applicationId}/submit`,
                                    {
                                        termsAccepted: true,
                                    }
                                );
                                if (submitRes.data.success) {
                                    showSuccessToast("Application submitted successfully! Redirecting to dashboard...");
                                    if (onStudentUpdate) onStudentUpdate(submitRes.data.data);

                                    // Redirect to dashboard after brief delay
                                    setTimeout(() => {
                                        navigate('/dashboard');
                                    }, 1500);
                                }
                                return;
                            }
                        } catch (loadErr) {
                            console.error(
                                "Failed to load existing application after 400:",
                                loadErr
                            );
                        }
                    }
                    throw error;
                } else {
                    throw error;
                }
            }

            if (response.data.success) {
                setApplication(response.data.data);
                showSuccessToast("Application submitted successfully! Redirecting to dashboard...");

                // Call the update callback if provided
                if (onStudentUpdate) {
                    onStudentUpdate(response.data.data);
                }

                // Redirect to dashboard after brief delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                console.error("Application creation failed:", response.data);
                showErrorToast(
                    response.data.message || "Failed to create application. Please try again."
                );
            }
        } catch (error) {
            console.error("Submit error:", error);
            console.error("Error response:", error?.response?.data);
            console.error("Error status:", error?.response?.status);
            const serverMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit application";
            showErrorToast(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderPDFSection = () => {
        if (!pdfGenerated) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                            Generate PDF
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate your application PDF before submitting</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to Generate PDF?</h4>
                            <p className="text-gray-600 dark:text-gray-400">Click the button below to generate your application PDF document.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={fillMockData}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4zM8 7h8M8 7v14M16 7v14" />
                                </svg>
                                Fill Mock Data
                            </button>
                            <button
                                type="button"
                                onClick={debugDocuments}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                            >
                                🐛 Debug Documents
                            </button>

                            <button
                                type="button"
                                onClick={handleGeneratePDF}
                                disabled={loading || !hasMinimumForCreate()}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generate PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        } else {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">✓</span>
                            PDF Generated Successfully
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Your application PDF has been generated and is ready for submission</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-800 dark:text-green-200 font-medium">PDF generated successfully! You can now submit your application.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Application PDF</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ready for download and submission</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={previewPDF}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={downloadPDF}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </button>
                            <button
                                type="button"
                                onClick={handleRegeneratePDF}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate PDF
                            </button>
                            <button
                                type="button"
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        }
    };

    const renderForm = () => (
        <div className="space-y-8">
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
                            value={formatDateForInput(formData.personalDetails.dateOfBirth)}
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
                            Category *
                        </label>
                        <select
                            value={formData.personalDetails.category}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    personalDetails: {
                                        ...prev.personalDetails,
                                        category: e.target.value,
                                    },
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Select Category</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="PwD">PwD</option>
                        </select>
                        {errors["personalDetails.category"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["personalDetails.category"]}
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
                        <select
                            value={formData.courseDetails.selectedCollege}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    courseDetails: {
                                        ...prev.courseDetails,
                                        selectedCollege: e.target.value,
                                        selectedCourse: "", // Reset course when college changes
                                        stream: "", // Reset stream when college changes
                                    },
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            disabled={loadingColleges}
                        >
                            <option value="">{loadingColleges ? "Loading institutions..." : "Select Institution"}</option>
                            {colleges.map((college) => (
                                <option key={college._id} value={college._id}>
                                    {college.name}
                                </option>
                            ))}
                        </select>
                        {errors["courseDetails.selectedCollege"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["courseDetails.selectedCollege"]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Course Name *
                        </label>
                        <select
                            value={formData.courseDetails.selectedCourse}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    courseDetails: {
                                        ...prev.courseDetails,
                                        selectedCourse: e.target.value,
                                        stream: "", // Reset stream when course changes
                                    },
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            disabled={!formData.courseDetails.selectedCollege || getCoursesForCollege().length === 0}
                        >
                            <option value="">
                                {!formData.courseDetails.selectedCollege
                                    ? "Select institution first"
                                    : getCoursesForCollege().length === 0
                                        ? "No courses available"
                                        : "Select Course"}
                            </option>
                            {getCoursesForCollege().map((course) => (
                                <option key={course._id} value={course.courseName}>
                                    {course.courseName}
                                </option>
                            ))}
                        </select>
                        {errors["courseDetails.selectedCourse"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["courseDetails.selectedCourse"]}
                            </p>
                        )}
                    </div>

                    {getStreamsForCourse().length > 0 && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stream (Optional)
                            </label>
                            <select
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
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select Stream (Optional)</option>
                                {getStreamsForCourse().map((stream, index) => (
                                    <option key={index} value={stream}>
                                        {stream}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                className="space-y-6 mb-12"
            >
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                        Document Upload
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Upload required documents</p>
                </div>

                <div className="pb-8">
                    <SimpleDocumentUpload
                        onDocumentsChange={(documents) => {
                            console.log('📋 Form received documents update:', documents);
                            console.log('📋 Document count:', Object.keys(documents).length);
                            console.log('📋 Document keys:', Object.keys(documents));

                            setFormData((prev) => ({
                                ...prev,
                                documents: documents,
                            }));
                        }}
                        initialDocuments={formData.documents}
                        isRequired={true}
                    />
                </div>
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
        </div>
    );

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
                {/* Form Content */}
                {renderForm()}

                {/* PDF Section */}
                {renderPDFSection()}

                {/* PDF Generator Modal */}
                {showPDFGenerator && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <ApplicationPDFGenerator
                                formData={formData}
                                application={application}
                                onPDFGenerated={handlePDFGenerated}
                                onCancel={() => setShowPDFGenerator(false)}
                            />
                        </div>
                    </div>
                )}

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

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !formData.termsAccepted || !pdfGenerated}
                        className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

// Fixed: Removed currentStep references
export default SinglePageStudentRegistration;