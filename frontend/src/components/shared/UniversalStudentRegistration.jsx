import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import SimpleDocumentUpload from "../forms/SimpleDocumentUpload";
import ApplicationPDFGenerator from "../forms/ApplicationPDFGenerator";
import TermsAndConditions from "../legal/TermsAndConditions";
import { showSuccessToast, showErrorToast } from "../../utils/sweetAlert";

const UniversalStudentRegistration = ({
  onStudentUpdate,
  userRole = "student",
  showTitle = true,
}) => {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState(null);
  const [errors, setErrors] = useState({});
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
      selectedCourse: "",
      customCourse: "",
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

  const steps = [
    {
      id: 1,
      title: "Personal Information",
      description: "Basic personal details",
    },
    {
      id: 2,
      title: "Contact Details",
      description: "Address and contact information",
    },
    {
      id: 3,
      title: "Course Selection",
      description: "Choose your course and stream",
    },
    {
      id: 4,
      title: "Guardian Details",
      description: "Parent/Guardian information",
    },
    {
      id: 5,
      title: "Document Upload",
      description: "Upload required documents",
    },
    {
      id: 6,
      title: "PDF Generation",
      description: "Generate and preview application PDF",
    },
    {
      id: 7,
      title: "Review & Submit",
      description: "Review and submit application",
    },
  ];

  useEffect(() => {
    loadExistingApplication();
    loadDraftData();
  }, []);

  const loadExistingApplication = async () => {
    // Only try to load from server if user is authenticated
    if (user && token) {
      try {
        const response = await api.get(
          "/api/student-application/my-application"
        );
        if (response.data.success) {
          setApplication(response.data.data);
          setFormData(response.data.data);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error loading application:", error);
        }
      }
    }
  };

  const loadDraftData = () => {
    try {
      const draftData = localStorage.getItem(draftKey);
      if (draftData) {
        const parsed = JSON.parse(draftData);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Error loading draft data:", error);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.personalDetails.fullName.trim()) {
          newErrors["personalDetails.fullName"] = "Full name is required";
        }
        if (!formData.personalDetails.fathersName.trim()) {
          newErrors["personalDetails.fathersName"] =
            "Father's name is required";
        }
        if (!formData.personalDetails.mothersName.trim()) {
          newErrors["personalDetails.mothersName"] =
            "Mother's name is required";
        }
        if (!formData.personalDetails.dateOfBirth) {
          newErrors["personalDetails.dateOfBirth"] =
            "Date of birth is required";
        }
        if (!formData.personalDetails.gender) {
          newErrors["personalDetails.gender"] = "Gender is required";
        }
        if (
          !formData.personalDetails.aadharNumber ||
          !/^\d{12}$/.test(formData.personalDetails.aadharNumber)
        ) {
          newErrors["personalDetails.aadharNumber"] =
            "Valid 12-digit Aadhar number is required";
        }
        break;

      case 2: // Contact Details
        if (
          !formData.contactDetails.primaryPhone ||
          !/^[6-9]\d{9}$/.test(formData.contactDetails.primaryPhone)
        ) {
          newErrors["contactDetails.primaryPhone"] =
            "Valid 10-digit phone number is required";
        }
        if (
          !formData.contactDetails.email ||
          !/\S+@\S+\.\S+/.test(formData.contactDetails.email)
        ) {
          newErrors["contactDetails.email"] = "Valid email address is required";
        }
        if (!formData.contactDetails.permanentAddress.street.trim()) {
          newErrors["contactDetails.permanentAddress.street"] =
            "Street address is required";
        }
        if (!formData.contactDetails.permanentAddress.city.trim()) {
          newErrors["contactDetails.permanentAddress.city"] =
            "City is required";
        }
        if (!formData.contactDetails.permanentAddress.state.trim()) {
          newErrors["contactDetails.permanentAddress.state"] =
            "State is required";
        }
        if (
          !formData.contactDetails.permanentAddress.pincode ||
          !/^\d{6}$/.test(formData.contactDetails.permanentAddress.pincode)
        ) {
          newErrors["contactDetails.permanentAddress.pincode"] =
            "Valid 6-digit pincode is required";
        }
        break;

      case 3: // Course Selection
        if (!formData.courseDetails.selectedCourse.trim()) {
          newErrors["courseDetails.selectedCourse"] =
            "Course selection is required";
        }
        break;

      case 4: // Guardian Details
        if (!formData.guardianDetails.guardianName.trim()) {
          newErrors["guardianDetails.guardianName"] =
            "Guardian name is required";
        }
        if (!formData.guardianDetails.relationship) {
          newErrors["guardianDetails.relationship"] =
            "Relationship is required";
        }
        if (
          !formData.guardianDetails.guardianPhone ||
          !/^[6-9]\d{9}$/.test(formData.guardianDetails.guardianPhone)
        ) {
          newErrors["guardianDetails.guardianPhone"] =
            "Valid guardian phone number is required";
        }
        break;

      case 5: // Document Upload
        // Check if required documents are uploaded
        const requiredDocuments = [
          "passport_photo",
          "aadhar_card",
          "birth_certificate",
          "marksheet_10th",
          "marksheet_12th",
        ];
        const missingDocuments = requiredDocuments.filter(
          (doc) => !formData.documents[doc]
        );
        if (missingDocuments.length > 0) {
          newErrors[
            "documents"
          ] = `Please upload all required documents: ${missingDocuments.join(
            ", "
          )}`;
        }
        break;
      case 6: // PDF Generation
        // No validation needed for PDF generation step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      const stage = getStageFromStep(currentStep);
      if (application?.applicationId) {
        await api.put(
          `/api/student-application/${application.applicationId}/save-draft`,
          {
            data: {
              personalDetails: formData.personalDetails,
              contactDetails: formData.contactDetails,
              courseDetails: formData.courseDetails,
              guardianDetails: formData.guardianDetails,
              documents: formData.documents,
            },
            stage,
          }
        );
        showSuccessToast("Draft saved");
      } else {
        // Avoid backend create before step 4 or when data incomplete. Save locally instead.
        if (currentStep < 4 || !hasMinimumForCreate()) {
          try {
            const key = generateDraftKey();
            localStorage.setItem(key, JSON.stringify(formData));
            showSuccessToast("Draft saved locally");
            return;
          } catch (_) { }
        }
        // Only try server save if user is authenticated
        if (user && token) {
          try {
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
              try {
                localStorage.removeItem(draftKey);
              } catch (_) { }
              showSuccessToast("Draft created on server");
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
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      showErrorToast("Failed to save draft");
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
        return "REGISTRATION";
      case 5:
        return "DOCUMENTS";
      case 6:
        return "APPLICATION_PDF";
      default:
        return "REGISTRATION";
    }
  };

  const hasMinimumForCreate = () => {
    return (
      formData.personalDetails.fullName &&
      formData.contactDetails.email &&
      formData.courseDetails.selectedCourse
    );
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
    if (!validateStep(6)) return;

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
              await api.put(
                `/api/student-application/${appId}/save-draft`,
                {
                  data: {
                    personalDetails: formData.personalDetails,
                    contactDetails: formData.contactDetails,
                    courseDetails: formData.courseDetails,
                    guardianDetails: formData.guardianDetails,
                    documents: formData.documents,
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
              showSuccessToast("Application submitted successfully!");
              if (onStudentUpdate) onStudentUpdate(submitRes.data.data);
            }
            return;
          }
        } catch (verifyError) {
          console.log('Error verifying application, clearing local state and creating new one');
          clearApplicationState();
          // Fall through to create new application
        }
      }

      // Try Redis endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await api.post("/api/redis/application/create", {
          ...formData,
          termsAccepted: true,
        });
      } catch (redisError) {
        if (redisError.response?.status === 404) {
          // Redis endpoint not available, use regular endpoint
          console.log("Redis endpoint not available, using regular endpoint");
          response = await api.post("/api/student-application/create", {
            ...formData,
            termsAccepted: true,
          });
        } else if (redisError.response?.status === 400) {
          // Handle known 400s by loading existing app and submitting
          const serverMsg = redisError.response?.data?.message;
          console.log("Redis 400 error:", serverMsg);

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
                  await api.put(
                    `/api/student-application/${existing.data.data.applicationId}/save-draft`,
                    {
                      data: {
                        personalDetails: formData.personalDetails,
                        contactDetails: formData.contactDetails,
                        courseDetails: formData.courseDetails,
                        guardianDetails: formData.guardianDetails,
                        documents: formData.documents,
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
                  showSuccessToast("Application submitted successfully!");
                  if (onStudentUpdate) onStudentUpdate(submitRes.data.data);
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
          throw redisError;
        } else {
          throw redisError;
        }
      }

      if (response.data.success) {
        setApplication(response.data.data);

        if (response.data.submissionId) {
          // Redis system response
          showSuccessToast(
            "Application submission started! Processing in background..."
          );
          monitorWorkflowProgress(response.data.submissionId);
        } else {
          // Created draft in regular system; proceed to save and submit
          const newAppId = response.data.data.applicationId || response.data.data._id;
          console.log('New application ID:', newAppId);
          console.log('Response data:', response.data.data);

          if (!newAppId) {
            console.error('New application ID is undefined, cannot proceed with submission');
            showErrorToast('Application ID is missing from server response. Please try again.');
            return;
          }

          try {
            await api.put(
              `/api/student-application/${newAppId}/save-draft`,
              {
                data: {
                  documents: formData.documents,
                },
                stage: "APPLICATION_PDF",
              }
            );
          } catch (_) { }
          const submitRes = await api.put(
            `/api/student-application/${newAppId}/submit`,
            {
              termsAccepted: true,
            }
          );
          if (submitRes.data.success) {
            showSuccessToast("Application submitted successfully!");
            if (onStudentUpdate) onStudentUpdate(submitRes.data.data);
          }
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

  const monitorWorkflowProgress = async (submissionId) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    const checkProgress = async () => {
      try {
        const response = await api.get(
          `/api/redis/application/status/${submissionId}`
        );
        if (response.data.success) {
          const { progress, status } = response.data.data;
          console.log(`Workflow progress: ${progress}%`);

          if (progress === 100) {
            showSuccessToast("Application submitted successfully!");
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 2000); // Check every 2 seconds
        } else {
          showErrorToast(
            "Application submission timed out. Please check status later."
          );
        }
      } catch (error) {
        console.error("Error monitoring workflow:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 2000);
        }
      }
    };

    checkProgress();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderContactDetails();
      case 3:
        return renderCourseSelection();
      case 4:
        return renderGuardianDetails();
      case 5:
        return renderDocuments();
      case 6:
        return (
          <ApplicationPDFGenerator
            formData={formData}
            application={application}
          />
        );
      case 7:
        return renderReview();
      default:
        return null;
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderContactDetails = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderCourseSelection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Course *
          </label>
          <select
            value={formData.courseDetails.selectedCourse}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                courseDetails: {
                  ...prev.courseDetails,
                  selectedCourse: e.target.value,
                },
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Course</option>
            <option value="B.Tech">B.Tech</option>
            <option value="BBA">BBA</option>
            <option value="BCA">BCA</option>
            <option value="MBA">MBA</option>
            <option value="MCA">MCA</option>
            <option value="M.Tech">M.Tech</option>
            <option value="Other">Other</option>
          </select>
          {errors["courseDetails.selectedCourse"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["courseDetails.selectedCourse"]}
            </p>
          )}
        </div>

        {formData.courseDetails.selectedCourse === "Other" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Course Name
            </label>
            <input
              type="text"
              value={formData.courseDetails.customCourse}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  courseDetails: {
                    ...prev.courseDetails,
                    customCourse: e.target.value,
                  },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter course name"
            />
          </div>
        )}

        <div>
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
    </div>
  );

  const renderGuardianDetails = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review & Submit
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please review all your information before submitting the application.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
        {/* Personal Information Review */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-white">Name:</strong>{" "}
              {formData.personalDetails.fullName}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Father's Name:
              </strong>{" "}
              {formData.personalDetails.fathersName}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Mother's Name:
              </strong>{" "}
              {formData.personalDetails.mothersName}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Date of Birth:
              </strong>{" "}
              {formData.personalDetails.dateOfBirth}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Gender:</strong>{" "}
              {formData.personalDetails.gender}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Aadhar:</strong>{" "}
              {formData.personalDetails.aadharNumber}
            </div>
          </div>
        </div>

        {/* Contact Information Review */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-white">Phone:</strong>{" "}
              {formData.contactDetails.primaryPhone}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Email:</strong>{" "}
              {formData.contactDetails.email}
            </div>
            <div className="md:col-span-2">
              <strong className="text-gray-900 dark:text-white">
                Address:
              </strong>{" "}
              {formData.contactDetails.permanentAddress.street},{" "}
              {formData.contactDetails.permanentAddress.city},{" "}
              {formData.contactDetails.permanentAddress.state} -{" "}
              {formData.contactDetails.permanentAddress.pincode}
            </div>
          </div>
        </div>

        {/* Course Information Review */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Course Information
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-white">Course:</strong>{" "}
              {formData.courseDetails.selectedCourse}
            </div>
            {formData.courseDetails.stream && (
              <div>
                <strong className="text-gray-900 dark:text-white">
                  Stream:
                </strong>{" "}
                {formData.courseDetails.stream}
              </div>
            )}
          </div>
        </div>

        {/* Guardian Information Review */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Guardian Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-white">Name:</strong>{" "}
              {formData.guardianDetails.guardianName}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Relationship:
              </strong>{" "}
              {formData.guardianDetails.relationship}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Phone:</strong>{" "}
              {formData.guardianDetails.guardianPhone}
            </div>
            {formData.guardianDetails.guardianEmail && (
              <div>
                <strong className="text-gray-900 dark:text-white">
                  Email:
                </strong>{" "}
                {formData.guardianDetails.guardianEmail}
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t pt-6">
          <TermsAndConditions
            accepted={formData.termsAccepted}
            onAccept={(accepted) =>
              setFormData((prev) => ({ ...prev, termsAccepted: accepted }))
            }
          />
        </div>
      </div>
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

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-gray-300 text-gray-500"
                  }`}
              >
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${currentStep >= step.id ? "text-purple-600" : "text-gray-500"
                    }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-purple-600" : "bg-gray-300"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.termsAccepted}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalStudentRegistration;
