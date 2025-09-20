import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/sweetAlert";

const SubmitApplicationForStudent = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        studentId: "",
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
            currentAddress: {
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
            },
        },
        courseDetails: {
            selectedCourse: "",
            customCourse: "",
            stream: "",
            campus: "Sargiguda",
        },
        guardianDetails: {
            guardianName: "",
            relationship: "",
            guardianPhone: "",
            guardianEmail: "",
        },
        financialDetails: {
            bankAccountNumber: "",
            ifscCode: "",
            accountHolderName: "",
            bankName: "",
        },
        referralCode: "",
    });

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    const courses = [
        "DMLT (Diploma in Medical Laboratory Technology)",
        "BMLT (Bachelor in Medical Laboratory Technology)",
        "D.Pharm (Diploma in Pharmacy)",
        "B.Pharm (Bachelor in Pharmacy)",
        "GNM (General Nursing and Midwifery)",
        "ANM (Auxiliary Nursing and Midwifery)",
        "B.Sc Nursing",
        "BPT (Bachelor of Physiotherapy)",
        "BDS (Bachelor of Dental Surgery)",
    ];

    const relationships = [
        "Father",
        "Mother",
        "Brother",
        "Sister",
        "Uncle",
        "Aunt",
        "Grandfather",
        "Grandmother",
        "Other",
    ];

    const genders = ["Male", "Female", "Other", "Prefer not to say"];

    const states = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
    ];

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get("/api/students");
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.studentId) newErrors.studentId = "Please select a student";
            if (!formData.personalDetails.fullName) newErrors.fullName = "Full name is required";
            if (!formData.personalDetails.fathersName) newErrors.fathersName = "Father's name is required";
            if (!formData.personalDetails.mothersName) newErrors.mothersName = "Mother's name is required";
            if (!formData.personalDetails.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
            if (!formData.personalDetails.gender) newErrors.gender = "Gender is required";
            if (!formData.personalDetails.aadharNumber) newErrors.aadharNumber = "Aadhar number is required";
            else if (!/^\d{12}$/.test(formData.personalDetails.aadharNumber)) {
                newErrors.aadharNumber = "Aadhar number must be 12 digits";
            }
        }

        if (step === 2) {
            if (!formData.contactDetails.primaryPhone) newErrors.primaryPhone = "Primary phone is required";
            else if (!/^[6-9]\d{9}$/.test(formData.contactDetails.primaryPhone)) {
                newErrors.primaryPhone = "Invalid phone number";
            }
            if (!formData.contactDetails.email) newErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(formData.contactDetails.email)) {
                newErrors.email = "Invalid email address";
            }
            if (!formData.contactDetails.permanentAddress.street) newErrors.street = "Street address is required";
            if (!formData.contactDetails.permanentAddress.city) newErrors.city = "City is required";
            if (!formData.contactDetails.permanentAddress.state) newErrors.state = "State is required";
            if (!formData.contactDetails.permanentAddress.pincode) newErrors.pincode = "Pincode is required";
            else if (!/^\d{6}$/.test(formData.contactDetails.permanentAddress.pincode)) {
                newErrors.pincode = "Pincode must be 6 digits";
            }
        }

        if (step === 3) {
            if (!formData.courseDetails.selectedCourse) newErrors.selectedCourse = "Course selection is required";
            if (!formData.guardianDetails.guardianName) newErrors.guardianName = "Guardian name is required";
            if (!formData.guardianDetails.relationship) newErrors.relationship = "Relationship is required";
            if (!formData.guardianDetails.guardianPhone) newErrors.guardianPhone = "Guardian phone is required";
            else if (!/^[6-9]\d{9}$/.test(formData.guardianDetails.guardianPhone)) {
                newErrors.guardianPhone = "Invalid phone number";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (field.includes("permanentAddress.") || field.includes("currentAddress.")) {
            const [parent, child, grandChild] = field.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: {
                        ...prev[parent][child],
                        [grandChild]: value
                    }
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
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        try {
            setLoading(true);

            // Determine the correct API endpoint based on user role
            const userRole = localStorage.getItem('userRole') || 'student';
            let endpoint = '';

            switch (userRole) {
                case 'agent':
                    endpoint = '/api/agents/submit-application';
                    break;
                case 'staff':
                    endpoint = '/api/staff/submit-application';
                    break;
                case 'super_admin':
                    endpoint = '/api/admin/submit-application';
                    break;
                default:
                    throw new Error('Invalid user role');
            }

            await api.post(endpoint, formData);
            showSuccess("Application submitted successfully for student!");
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error("Error submitting application:", error);
            showError("Failed to submit application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Student & Personal Details</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                </label>
                <select
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                        <option key={student._id} value={student._id}>
                            {student.fullName} - {student.email}
                        </option>
                    ))}
                </select>
                {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={formData.personalDetails.fullName}
                        onChange={(e) => handleInputChange("personalDetails.fullName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name *
                    </label>
                    <input
                        type="text"
                        value={formData.personalDetails.fathersName}
                        onChange={(e) => handleInputChange("personalDetails.fathersName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.fathersName && <p className="text-red-500 text-sm mt-1">{errors.fathersName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Name *
                    </label>
                    <input
                        type="text"
                        value={formData.personalDetails.mothersName}
                        onChange={(e) => handleInputChange("personalDetails.mothersName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.mothersName && <p className="text-red-500 text-sm mt-1">{errors.mothersName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                    </label>
                    <input
                        type="date"
                        value={formData.personalDetails.dateOfBirth}
                        onChange={(e) => handleInputChange("personalDetails.dateOfBirth", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                    </label>
                    <select
                        value={formData.personalDetails.gender}
                        onChange={(e) => handleInputChange("personalDetails.gender", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Select gender</option>
                        {genders.map((gender) => (
                            <option key={gender} value={gender}>
                                {gender}
                            </option>
                        ))}
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number *
                    </label>
                    <input
                        type="text"
                        value={formData.personalDetails.aadharNumber}
                        onChange={(e) => handleInputChange("personalDetails.aadharNumber", e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="12"
                    />
                    {errors.aadharNumber && <p className="text-red-500 text-sm mt-1">{errors.aadharNumber}</p>}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Phone *
                    </label>
                    <input
                        type="tel"
                        value={formData.contactDetails.primaryPhone}
                        onChange={(e) => handleInputChange("contactDetails.primaryPhone", e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="10"
                    />
                    {errors.primaryPhone && <p className="text-red-500 text-sm mt-1">{errors.primaryPhone}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                    </label>
                    <input
                        type="tel"
                        value={formData.contactDetails.whatsappNumber}
                        onChange={(e) => handleInputChange("contactDetails.whatsappNumber", e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="10"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                    </label>
                    <input
                        type="email"
                        value={formData.contactDetails.email}
                        onChange={(e) => handleInputChange("contactDetails.email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
            </div>

            <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Permanent Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            value={formData.contactDetails.permanentAddress.street}
                            onChange={(e) => handleInputChange("contactDetails.permanentAddress.street", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            value={formData.contactDetails.permanentAddress.city}
                            onChange={(e) => handleInputChange("contactDetails.permanentAddress.city", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                        </label>
                        <select
                            value={formData.contactDetails.permanentAddress.state}
                            onChange={(e) => handleInputChange("contactDetails.permanentAddress.state", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select state</option>
                            {states.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode *
                        </label>
                        <input
                            type="text"
                            value={formData.contactDetails.permanentAddress.pincode}
                            onChange={(e) => handleInputChange("contactDetails.permanentAddress.pincode", e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            maxLength="6"
                        />
                        {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Course & Guardian Details</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Course *
                </label>
                <select
                    value={formData.courseDetails.selectedCourse}
                    onChange={(e) => handleInputChange("courseDetails.selectedCourse", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
                {errors.selectedCourse && <p className="text-red-500 text-sm mt-1">{errors.selectedCourse}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream
                    </label>
                    <input
                        type="text"
                        value={formData.courseDetails.stream}
                        onChange={(e) => handleInputChange("courseDetails.stream", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campus
                    </label>
                    <select
                        value={formData.courseDetails.campus}
                        onChange={(e) => handleInputChange("courseDetails.campus", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="Sargiguda">Sargiguda</option>
                        <option value="Ghantiguda">Ghantiguda</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
            </div>

            <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Guardian Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Guardian Name *
                        </label>
                        <input
                            type="text"
                            value={formData.guardianDetails.guardianName}
                            onChange={(e) => handleInputChange("guardianDetails.guardianName", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {errors.guardianName && <p className="text-red-500 text-sm mt-1">{errors.guardianName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship *
                        </label>
                        <select
                            value={formData.guardianDetails.relationship}
                            onChange={(e) => handleInputChange("guardianDetails.relationship", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select relationship</option>
                            {relationships.map((rel) => (
                                <option key={rel} value={rel}>
                                    {rel}
                                </option>
                            ))}
                        </select>
                        {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Guardian Phone *
                        </label>
                        <input
                            type="tel"
                            value={formData.guardianDetails.guardianPhone}
                            onChange={(e) => handleInputChange("guardianDetails.guardianPhone", e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            maxLength="10"
                        />
                        {errors.guardianPhone && <p className="text-red-500 text-sm mt-1">{errors.guardianPhone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Guardian Email
                        </label>
                        <input
                            type="email"
                            value={formData.guardianDetails.guardianEmail}
                            onChange={(e) => handleInputChange("guardianDetails.guardianEmail", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code (Optional)
                </label>
                <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange("referralCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Submit Application for Student
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-4">
                        <div className="flex items-center">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-purple-600" : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>Personal Details</span>
                            <span>Contact Details</span>
                            <span>Course & Guardian</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : "Submit Application"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubmitApplicationForStudent;
