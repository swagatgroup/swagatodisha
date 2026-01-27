import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import SimpleDocumentUpload from "../forms/SimpleDocumentUpload";
import ApplicationPDFGenerator from "../forms/ApplicationPDFGenerator";
import TermsAndConditions from "../legal/TermsAndConditions";
import { showSuccessToast, showErrorToast, showLoading, closeLoading } from "../../utils/sweetAlert";
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
    const [storedPdfUrl, setStoredPdfUrl] = useState(null); // PDF URL from backend
    const [showPDFGenerator, setShowPDFGenerator] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [application, setApplication] = useState(null);
    const [errors, setErrors] = useState({});
    const [colleges, setColleges] = useState([]);
    const [loadingColleges, setLoadingColleges] = useState(false);

    // Convert DD/MM/YYYY to ISO format (YYYY-MM-DD)
    const convertDDMMYYYYToISO = (dateString) => {
        if (!dateString) return '';
        // Check if already in ISO format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        // Parse DD/MM/YYYY format
        const parts = dateString.split('/');
        if (parts.length !== 3) return '';
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
        // Validate date
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return '';
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Convert ISO format (YYYY-MM-DD) to DD/MM/YYYY
    const convertISOToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        // Check if already in DD/MM/YYYY format
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        try {
            // Handle ISO format or other date formats
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return '';
        }
    };

    // Validate DD/MM/YYYY format
    const validateDDMMYYYY = (dateString) => {
        if (!dateString) return false;
        const parts = dateString.split('/');
        if (parts.length !== 3) return false;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return false;
        // Check if date is valid (e.g., not 32/01/2000)
        const date = new Date(year, month - 1, day);
        return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    };

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
            registrationDate: "",
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
                district: "",
                state: "",
                pincode: "",
                country: "India",
            },
        },
        courseDetails: {
            selectedCollege: "",
            selectedCourse: "",
            stream: "",
            campus: "",
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

    // Get campuses for selected college
    const getCampusesForCollege = () => {
        if (!formData.courseDetails.selectedCollege) {
            return [];
        }
        const selectedCollegeData = colleges.find(
            (college) => college._id === formData.courseDetails.selectedCollege
        );
        return selectedCollegeData?.campuses || [];
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
                        // Convert ISO date format to DD/MM/YYYY for display
                        const existingPersonalDetails = existingData.personalDetails ? {
                            ...existingData.personalDetails,
                            dateOfBirth: convertISOToDDMMYYYY(existingData.personalDetails.dateOfBirth) || existingData.personalDetails.dateOfBirth,
                            registrationDate: convertISOToDDMMYYYY(existingData.personalDetails.registrationDate) || existingData.personalDetails.registrationDate || "",
                        } : formData.personalDetails;
                        setFormData({
                            personalDetails: existingPersonalDetails,
                            contactDetails: {
                                ...(existingData.contactDetails || formData.contactDetails),
                                permanentAddress: {
                                    ...(existingData.contactDetails?.permanentAddress || formData.contactDetails.permanentAddress),
                                    district: existingData.contactDetails?.permanentAddress?.district || "",
                                },
                            },
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

    // Helper function to normalize guardian relationship to valid enum value
    const normalizeGuardianRelationship = (relationship) => {
        const validRelationships = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Other'];
        if (!relationship || !validRelationships.includes(relationship)) {
            console.warn(`Invalid guardian relationship "${relationship}", defaulting to "Other"`);
            return 'Other';
        }
        return relationship;
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Details validation
        if (!formData.personalDetails.fullName.trim()) {
            newErrors["personalDetails.fullName"] = "Full name is required";
        }
        if (!formData.personalDetails.dateOfBirth) {
            newErrors["personalDetails.dateOfBirth"] = "Date of birth is required";
        } else if (!validateDDMMYYYY(formData.personalDetails.dateOfBirth)) {
            newErrors["personalDetails.dateOfBirth"] = "Please enter a valid date in DD/MM/YYYY format";
        }
        if (!formData.personalDetails.registrationDate) {
            newErrors["personalDetails.registrationDate"] = "Registration date is required";
        } else if (!validateDDMMYYYY(formData.personalDetails.registrationDate)) {
            newErrors["personalDetails.registrationDate"] = "Please enter a valid date in DD/MM/YYYY format";
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
        if (!formData.contactDetails.permanentAddress.district?.trim()) {
            newErrors["contactDetails.permanentAddress.district"] = "District is required";
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
        if (!formData.courseDetails.campus) {
            newErrors["courseDetails.campus"] = "Campus selection is required";
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
                        // Convert date format from DD/MM/YYYY to ISO (YYYY-MM-DD) before saving
                        const personalDetailsForSave = {
                            ...formData.personalDetails,
                            dateOfBirth: convertDDMMYYYYToISO(formData.personalDetails.dateOfBirth) || formData.personalDetails.dateOfBirth,
                            registrationDate: convertDDMMYYYYToISO(formData.personalDetails.registrationDate) || formData.personalDetails.registrationDate,
                        };
                        await api.put(`/api/student-application/${application.applicationId}/save-draft`, {
                            data: {
                                personalDetails: personalDetailsForSave,
                                contactDetails: formData.contactDetails,
                                courseDetails: formData.courseDetails,
                                guardianDetails: {
                                    ...formData.guardianDetails,
                                    relationship: normalizeGuardianRelationship(formData.guardianDetails?.relationship)
                                },
                                documents: formData.documents,
                            },
                            stage: "REGISTRATION",
                        });
                    } else {
                        // Create new application
                        // Convert date format from DD/MM/YYYY to ISO (YYYY-MM-DD) before submitting
                        const personalDetailsForSubmit = {
                            ...formData.personalDetails,
                            dateOfBirth: convertDDMMYYYYToISO(formData.personalDetails.dateOfBirth) || formData.personalDetails.dateOfBirth,
                            registrationDate: convertDDMMYYYYToISO(formData.personalDetails.registrationDate) || formData.personalDetails.registrationDate,
                        };
                        const response = await api.post("/api/student-application/create", {
                            personalDetails: personalDetailsForSubmit,
                            contactDetails: formData.contactDetails,
                            courseDetails: formData.courseDetails,
                            guardianDetails: {
                                ...formData.guardianDetails,
                                relationship: normalizeGuardianRelationship(formData.guardianDetails?.relationship)
                            },
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

    const handlePDFGenerated = (pdfBlobUrl, backendPdfUrl = null, newApplication = null) => {
        console.log('📄 PDF Generated callback:', { pdfBlobUrl, backendPdfUrl, newApplication });
        setPdfUrl(pdfBlobUrl);
        
        // If a new application was created, update the application state
        if (newApplication) {
            console.log('✅ Updating application state:', newApplication);
            setApplication(newApplication);
        }
        
        if (backendPdfUrl) {
            console.log('✅ Setting stored PDF URL:', backendPdfUrl);
            setStoredPdfUrl(backendPdfUrl);
        } else {
            console.log('⚠️ No backend PDF URL received');
            // Try to fetch PDF URL if we have an application
            const appId = newApplication?.applicationId || application?.applicationId;
            if (appId) {
                fetchStoredPDFUrl(appId);
            }
        }
        setPdfGenerated(true);
        setShowPDFGenerator(false);
        const message = backendPdfUrl 
            ? "PDF generated and saved successfully! You can now download or preview it."
            : "PDF generated successfully! You can now download or preview it.";
        showSuccessToast(message);
    };

    // Function to fetch stored PDF URL
    const fetchStoredPDFUrl = async (applicationId) => {
        try {
            console.log('🔍 Fetching stored PDF URL for application:', applicationId);
            const pdfResponse = await api.get(
                `/api/student-application/${applicationId}/pdf`
            );
            if (pdfResponse.data.success && pdfResponse.data.data?.pdfUrl) {
                console.log('✅ Found stored PDF URL:', pdfResponse.data.data.pdfUrl);
                setStoredPdfUrl(pdfResponse.data.data.pdfUrl);
            } else {
                console.log('ℹ️ No stored PDF found yet');
            }
        } catch (pdfError) {
            console.log('ℹ️ PDF not yet uploaded or not found:', pdfError.response?.data?.message || pdfError.message);
            // Not a critical error, continue
        }
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
        // Random name generators
        const firstNames = ["Raj", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavya", "Arjun", "Divya", "Siddharth", "Meera", "Karan", "Isha", "Aditya", "Riya", "Nikhil", "Pooja", "Rahul", "Shreya"];
        const lastNames = ["Kumar", "Sharma", "Patel", "Singh", "Reddy", "Verma", "Gupta", "Mehta", "Jain", "Shah", "Rao", "Nair", "Malhotra", "Chopra", "Agarwal", "Bansal", "Kapoor", "Tiwari", "Yadav", "Mishra"];
        
        const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const getRandomPhone = () => {
            const prefix = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
            return `${prefix}${getRandomInt(100000000, 999999999)}`;
        };
        const getRandomAadhar = () => {
            return Array.from({ length: 12 }, () => getRandomInt(0, 9)).join('');
        };
        const getRandomPincode = () => {
            return getRandomInt(100000, 999999).toString();
        };
        
        // Random date between 1995 and 2010
        const year = getRandomInt(1995, 2010);
        const month = String(getRandomInt(1, 12)).padStart(2, '0');
        const day = String(getRandomInt(1, 28)).padStart(2, '0');
        const dateOfBirth = `${year}-${month}-${day}`;
        
        // Random registration date (recent)
        const regYear = getRandomInt(2020, 2024);
        const regMonth = String(getRandomInt(1, 12)).padStart(2, '0');
        const regDay = String(getRandomInt(1, 28)).padStart(2, '0');
        const registrationDate = `${regYear}-${regMonth}-${regDay}`;
        
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const fatherName = `${getRandomElement(firstNames)} ${lastName}`;
        const motherName = `${getRandomElement(firstNames)} ${lastName}`;
        const guardianName = `${getRandomElement(firstNames)} ${lastName}`;
        
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`;
        const guardianEmail = `${guardianName.split(' ')[0].toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`;
        
        const primaryPhone = getRandomPhone();
        const whatsappNumber = getRandomPhone();
        const guardianPhone = getRandomPhone();
        
        const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"];
        const states = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Odisha", "Odisha", "Odisha", "Odisha", "Odisha"];
        const streets = ["Main Road", "MG Road", "Park Street", "Church Street", "Market Street", "Station Road", "College Road", "Hospital Road", "Temple Street", "Gandhi Nagar"];
        
        const cityIndex = getRandomInt(0, cities.length - 1);
        const city = cities[cityIndex];
        const state = states[cityIndex];
        const street = `${getRandomInt(1, 999)} ${getRandomElement(streets)}`;
        
        const categories = ["General", "OBC", "SC", "ST", "EWS"];
        const genders = ["Male", "Female", "Other"];
        const relationships = ["Father", "Mother", "Brother", "Sister", "Uncle", "Aunt", "Grandfather", "Grandmother", "Other"];
        const courses = ["Bachelor of Technology", "Bachelor of Science", "Bachelor of Arts", "Bachelor of Commerce", "Master of Technology", "Master of Science"];
        const streams = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Information Technology", "Data Science", "Artificial Intelligence"];
        
        const referralCode = Array.from({ length: 8 }, () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        
        const mockData = {
            personalDetails: {
                fullName: fullName,
                dateOfBirth: dateOfBirth,
                registrationDate: registrationDate,
                gender: getRandomElement(genders),
                aadharNumber: getRandomAadhar(),
                category: getRandomElement(categories),
                fathersName: fatherName,
                mothersName: motherName,
            },
            contactDetails: {
                email: email,
                primaryPhone: primaryPhone,
                whatsappNumber: whatsappNumber,
                communicationMode: ["Email", "WhatsApp"],
                permanentAddress: {
                    street: street,
                    city: city,
                    state: state,
                    pincode: getRandomPincode(),
                },
                presentAddress: {
                    street: street,
                    city: city,
                    state: state,
                    pincode: getRandomPincode(),
                },
            },
            courseDetails: {
                institutionName: `${city} College`,
                courseName: getRandomElement(courses),
                stream: getRandomElement(streams),
            },
            guardianDetails: {
                guardianName: guardianName,
                relationship: getRandomElement(relationships),
                guardianPhone: guardianPhone,
                guardianEmail: guardianEmail,
            },
            referralCode: referralCode,
            documents: {
                passport_photo: { 
                    name: `passport-photo-${getRandomInt(1000, 9999)}.jpg`, 
                    size: getRandomInt(200000, 800000), 
                    downloadUrl: `http://example.com/passport-photo-${getRandomInt(1000, 9999)}.jpg` 
                },
                aadhar_card: { 
                    name: `aadhar-card-${getRandomInt(1000, 9999)}.pdf`, 
                    size: getRandomInt(500000, 2000000), 
                    downloadUrl: `http://example.com/aadhar-card-${getRandomInt(1000, 9999)}.pdf` 
                },
                caste_certificate: { 
                    name: `caste-certificate-${getRandomInt(1000, 9999)}.pdf`, 
                    size: getRandomInt(800000, 2500000), 
                    downloadUrl: `http://example.com/caste-certificate-${getRandomInt(1000, 9999)}.pdf` 
                },
                income_certificate: { 
                    name: `income-certificate-${getRandomInt(1000, 9999)}.pdf`, 
                    size: getRandomInt(1000000, 3000000), 
                    downloadUrl: `http://example.com/income-certificate-${getRandomInt(1000, 9999)}.pdf` 
                },
                marksheet_10th: { 
                    name: `10th-marksheet-${getRandomInt(1000, 9999)}.pdf`, 
                    size: getRandomInt(900000, 2500000), 
                    downloadUrl: `http://example.com/10th-marksheet-${getRandomInt(1000, 9999)}.pdf` 
                },
                resident_certificate: { 
                    name: `resident-certificate-${getRandomInt(1000, 9999)}.pdf`, 
                    size: getRandomInt(600000, 2000000), 
                    downloadUrl: `http://example.com/resident-certificate-${getRandomInt(1000, 9999)}.pdf` 
                },
            },
        };

        setFormData(mockData);
        showSuccessToast(`Random mock data filled for ${fullName}! You can now test PDF generation.`);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showErrorToast("Please fill in all required fields correctly");
            return;
        }

        // Check if PDF was generated (warn but allow submission if PDF exists locally)
        if (!pdfGenerated || !pdfUrl) {
            const confirmed = window.confirm(
                "PDF has not been generated yet. Do you want to generate it first? (Click Cancel to proceed without PDF)"
            );
            if (confirmed) {
                setLoading(false);
                return;
            }
            // User chose to proceed without PDF - show warning
            showErrorToast("Warning: PDF not generated. Application will be submitted without PDF.");
        }

        try {
            setLoading(true);

            // Ensure PDF is uploaded before submission
            let currentAppId = application?.applicationId || application?._id;
            
            // If we have a PDF but no stored URL, upload it first
            if (pdfUrl && !storedPdfUrl && currentAppId && currentAppId !== 'DRAFT') {
                try {
                    console.log('📤 Uploading PDF before submission...');
                    showLoading('Uploading PDF...');
                    
                    // Convert blob URL to blob
                    const blob = await fetch(pdfUrl).then(r => r.blob());
                    const formDataToUpload = new FormData();
                    formDataToUpload.append('pdf', blob, `application_${currentAppId}.pdf`);
                    
                    const uploadResponse = await api.post(
                        `/api/student-application/${currentAppId}/upload-pdf`,
                        formDataToUpload,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    
                    if (uploadResponse.data.success) {
                        console.log('✅ PDF uploaded before submission:', uploadResponse.data.data.pdfUrl);
                        setStoredPdfUrl(uploadResponse.data.data.pdfUrl);
                        closeLoading();
                    } else {
                        throw new Error('PDF upload failed');
                    }
                } catch (uploadError) {
                    closeLoading();
                    console.error('❌ Failed to upload PDF before submission:', uploadError);
                    const errorMsg = uploadError.response?.data?.message || 'Failed to upload PDF. Please try generating PDF again.';
                    showErrorToast(errorMsg);
                    setLoading(false);
                    return; // Stop submission if PDF upload fails
                }
            }

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
                                            campus: formData.courseDetails?.campus || '',
                                            institutionName: colleges.find(c => c._id === formData.courseDetails?.selectedCollege)?.name || '',
                                            courseName: formData.courseDetails?.selectedCourse || ''
                                        },
                                        guardianDetails: {
                                            ...formData.guardianDetails,
                                            relationship: normalizeGuardianRelationship(formData.guardianDetails?.relationship)
                                        },
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
                // Convert date format from DD/MM/YYYY to ISO (YYYY-MM-DD) before submitting
                const personalDetailsForSubmit = {
                    ...formData.personalDetails,
                    dateOfBirth: convertDDMMYYYYToISO(formData.personalDetails.dateOfBirth) || formData.personalDetails.dateOfBirth,
                    registrationDate: convertDDMMYYYYToISO(formData.personalDetails.registrationDate) || formData.personalDetails.registrationDate,
                };
                const submitData = {
                    ...formData,
                    personalDetails: personalDetailsForSubmit,
                    documents: documentsArray,
                    termsAccepted: true,
                    courseDetails: {
                        selectedCollege: formData.courseDetails?.selectedCollege || '',
                        selectedCourse: formData.courseDetails?.selectedCourse || '',
                        stream: formData.courseDetails?.stream || '',
                        campus: formData.courseDetails?.campus || '',
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
                        guardianPhone: sanitizePhone(formData.guardianDetails?.guardianPhone),
                        relationship: normalizeGuardianRelationship(formData.guardianDetails?.relationship)
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

                                    // Convert date format from DD/MM/YYYY to ISO (YYYY-MM-DD) before saving
                                    const personalDetailsForSave2 = {
                                        ...formData.personalDetails,
                                        dateOfBirth: convertDDMMYYYYToISO(formData.personalDetails.dateOfBirth) || formData.personalDetails.dateOfBirth,
                                        registrationDate: convertDDMMYYYYToISO(formData.personalDetails.registrationDate) || formData.personalDetails.registrationDate,
                                    };
                                    await api.put(
                                        `/api/student-application/${existing.data.data.applicationId}/save-draft`,
                                        {
                                            data: {
                                                personalDetails: personalDetailsForSave2,
                                                contactDetails: formData.contactDetails,
                                                courseDetails: {
                                                    selectedCollege: formData.courseDetails?.selectedCollege || '',
                                                    selectedCourse: formData.courseDetails?.selectedCourse || '',
                                                    stream: formData.courseDetails?.stream || '',
                                                    campus: formData.courseDetails?.campus || '',
                                                    institutionName: colleges.find(c => c._id === formData.courseDetails?.selectedCollege)?.name || '',
                                                    courseName: formData.courseDetails?.selectedCourse || ''
                                                },
                                                guardianDetails: {
                                                    ...formData.guardianDetails,
                                                    relationship: normalizeGuardianRelationship(formData.guardianDetails?.relationship)
                                                },
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
                
                // Upload PDF if not already uploaded
                if (response.data.data?.applicationId && pdfUrl && !storedPdfUrl) {
                    try {
                        console.log('📤 Uploading PDF after submission...');
                        showLoading('Uploading PDF...');
                        
                        // Convert blob URL to blob
                        const blob = await fetch(pdfUrl).then(r => r.blob());
                        const formData = new FormData();
                        formData.append('pdf', blob, `application_${response.data.data.applicationId}.pdf`);
                        
                        const uploadResponse = await api.post(
                            `/api/student-application/${response.data.data.applicationId}/upload-pdf`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            }
                        );
                        
                        if (uploadResponse.data.success) {
                            console.log('✅ PDF uploaded after submission:', uploadResponse.data.data.pdfUrl);
                            setStoredPdfUrl(uploadResponse.data.data.pdfUrl);
                            closeLoading();
                        } else {
                            throw new Error('PDF upload failed');
                        }
                    } catch (uploadError) {
                        closeLoading();
                        console.error('❌ Failed to upload PDF after submission:', uploadError);
                        const errorMsg = uploadError.response?.data?.message || 'PDF upload failed, but application was submitted.';
                        showErrorToast(errorMsg);
                        // Continue with submission even if PDF upload fails
                    }
                }
                
                // Fetch stored PDF URL if available (double-check)
                if (response.data.data?.applicationId && !storedPdfUrl) {
                    try {
                        const pdfResponse = await api.get(
                            `/api/student-application/${response.data.data.applicationId}/pdf`
                        );
                        if (pdfResponse.data.success && pdfResponse.data.data?.pdfUrl) {
                            console.log('✅ Found stored PDF URL:', pdfResponse.data.data.pdfUrl);
                            setStoredPdfUrl(pdfResponse.data.data.pdfUrl);
                        }
                    } catch (pdfError) {
                        console.log('ℹ️ PDF not yet uploaded or not found:', pdfError.response?.data?.message || pdfError.message);
                        // Not a critical error, continue
                    }
                }
                
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
                        {storedPdfUrl ? (
                            <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                                <p className="text-sm text-green-700 dark:text-green-300 mb-2">Your PDF has been saved and can be accessed anytime:</p>
                                <a 
                                    href={storedPdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-800 dark:text-green-200 underline hover:text-green-900 dark:hover:text-green-100 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Stored PDF
                                </a>
                            </div>
                        ) : application?.applicationId && (
                            <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                    PDF will be saved automatically after submission.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fetchStoredPDFUrl(application.applicationId)}
                                    className="text-sm text-green-800 dark:text-green-200 underline hover:text-green-900 dark:hover:text-green-100 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Check for Stored PDF
                                </button>
                            </div>
                        )}
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
                                        fullName: e.target.value.toUpperCase(),
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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
                                        fathersName: e.target.value.toUpperCase(),
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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
                                        mothersName: e.target.value.toUpperCase(),
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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
                            Date of Birth * (DD/MM/YYYY)
                        </label>
                        <input
                            type="text"
                            value={formData.personalDetails.dateOfBirth}
                            onChange={(e) => {
                                let value = e.target.value;
                                // Allow only numbers and forward slashes
                                value = value.replace(/[^0-9/]/g, '');
                                // Auto-format as user types: DD/MM/YYYY
                                if (value.length === 2 && !value.includes('/')) {
                                    value = value + '/';
                                } else if (value.length === 5 && value.split('/').length === 2) {
                                    value = value + '/';
                                }
                                setFormData((prev) => ({
                                    ...prev,
                                    personalDetails: {
                                        ...prev.personalDetails,
                                        dateOfBirth: value,
                                    },
                                }));
                            }}
                            placeholder="DD/MM/YYYY"
                            maxLength={10}
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
                            Registration Date * (DD/MM/YYYY)
                        </label>
                        <input
                            type="text"
                            value={formData.personalDetails.registrationDate}
                            onChange={(e) => {
                                let value = e.target.value;
                                // Allow only numbers and forward slashes
                                value = value.replace(/[^0-9/]/g, '');
                                // Auto-format as user types: DD/MM/YYYY
                                if (value.length === 2 && !value.includes('/')) {
                                    value = value + '/';
                                } else if (value.length === 5 && value.split('/').length === 2) {
                                    value = value + '/';
                                }
                                setFormData((prev) => ({
                                    ...prev,
                                    personalDetails: {
                                        ...prev.personalDetails,
                                        registrationDate: value,
                                    },
                                }));
                            }}
                            placeholder="DD/MM/YYYY"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {errors["personalDetails.registrationDate"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["personalDetails.registrationDate"]}
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
                                        email: e.target.value.toLowerCase(),
                                    },
                                }))
                            }
                            required
                            style={{ textTransform: 'lowercase' }}
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
                                            street: e.target.value.toUpperCase(),
                                        },
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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
                                            city: e.target.value.toUpperCase(),
                                            district: prev.contactDetails.permanentAddress.district || "",
                                        },
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter city"
                        />
                        {errors["contactDetails.permanentAddress.city"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["contactDetails.permanentAddress.city"]}
                            </p>
                        )}
                    </div>

                    <div id="district-field-container">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            District *
                        </label>
                        <input
                            id="district-input-field"
                            type="text"
                            name="district"
                            value={formData.contactDetails.permanentAddress.district || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    contactDetails: {
                                        ...prev.contactDetails,
                                        permanentAddress: {
                                            ...prev.contactDetails.permanentAddress,
                                            city: prev.contactDetails.permanentAddress.city || "",
                                            district: e.target.value.toUpperCase(),
                                            state: prev.contactDetails.permanentAddress.state || "",
                                            pincode: prev.contactDetails.permanentAddress.pincode || "",
                                        },
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter district"
                            required
                        />
                        {errors["contactDetails.permanentAddress.district"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["contactDetails.permanentAddress.district"]}
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
                                            state: e.target.value.toUpperCase(),
                                        },
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        campus: "", // Reset campus when college changes
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

                    {/* Campus Selection - In same row */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <i className="fa-solid fa-building mr-2 text-purple-600 dark:text-purple-400"></i>
                            Campus *
                        </label>
                        <select
                            value={formData.courseDetails.campus || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    courseDetails: {
                                        ...prev.courseDetails,
                                        campus: e.target.value,
                                    },
                                }))
                            }
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                !formData.courseDetails.selectedCollege 
                                    ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400' 
                                    : getCampusesForCollege().length > 0
                                        ? 'border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                        : 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-gray-700 dark:text-gray-300'
                            }`}
                            required
                            disabled={!formData.courseDetails.selectedCollege}
                        >
                            <option value="">
                                {!formData.courseDetails.selectedCollege
                                    ? "Select institution first"
                                    : getCampusesForCollege().length === 0
                                        ? "No campuses available"
                                        : "Select Campus"}
                            </option>
                            {getCampusesForCollege().length > 0 && getCampusesForCollege().map((campus) => (
                                <option key={campus._id} value={campus._id}>
                                    {campus.name} {campus.code ? `(${campus.code})` : ''}
                                </option>
                            ))}
                        </select>
                        {getCampusesForCollege().length === 0 && formData.courseDetails.selectedCollege && (
                            <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                                <i className="fa-solid fa-info-circle mr-1"></i>
                                No campuses available
                            </p>
                        )}
                        {errors["courseDetails.campus"] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors["courseDetails.campus"]}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stream Field - Below the three columns */}
                {getStreamsForCourse().length > 0 && (
                    <div>
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
                                        guardianName: e.target.value.toUpperCase(),
                                    },
                                }))
                            }
                            style={{ textTransform: 'uppercase' }}
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
                                        guardianEmail: e.target.value.toLowerCase(),
                                    },
                                }))
                            }
                            style={{ textTransform: 'lowercase' }}
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