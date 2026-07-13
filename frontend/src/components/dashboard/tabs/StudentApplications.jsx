import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../../utils/api";
import {
  showSuccess,
  showErrorToast,
  showConfirm,
} from "../../../utils/sweetAlert";
import EnhancedStudentApplicationForm from "../../forms/EnhancedStudentApplicationForm";
import SubmitApplicationForStudent from "../../forms/SubmitApplicationForStudent";
import MySubmittedApplications from "./MySubmittedApplications";

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showSubmitForStudentModal, setShowSubmitForStudentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("my-applications");
  const [newApplication, setNewApplication] = useState({
    course: "",
    institution: "",
    preferredStartDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [userRole, setUserRole] = useState("student");

  // State for Installments/Receipt Upload
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [selectedAppForInstallments, setSelectedAppForInstallments] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [targetInstallmentNum, setTargetInstallmentNum] = useState(null);

  const courses = [
    "DMLT (Diploma in Medical Laboratory Technology)",
    "BMLT (Bachelor in Medical Laboratory Technology)",
    "D.Pharm (Diploma in Pharmacy)",
    "B.Pharm (Bachelor in Pharmacy)",
    "GNM (General Nursing and Midwifery)",
    "ANM (Auxiliary Nursing and Midwifery)",
    "B.Sc Nursing",
    "BPT (Bachelor of Physiotherapy)",
    "D.Pharm (Diploma in Pharmacy)",
    "BDS (Bachelor of Dental Surgery)",
  ];

  const institutions = [
    "Swagat Group of Institutions - Main Campus",
    "Swagat Medical College",
    "Swagat Pharmacy College",
    "Swagat Nursing College",
    "Swagat Physiotherapy College",
  ];

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole') || 'student';
    setUserRole(role);
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Use the same endpoint as agent dashboard but for student's own applications
      const response = await api.get("/api/student-application/my-applications");

      if (response.data?.success) {
        // The API returns { success: true, data: [...] }
        const applicationsData = response.data.data || [];
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      } else {
        // Fallback to old endpoint if the new one doesn't work
        const fallbackResponse = await api.get("/api/students/applications");
        const list = fallbackResponse.data.data?.applications ?? fallbackResponse.data.data ?? [];
        setApplications(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Degrade gracefully: show empty state instead of modal
      setApplications([]);
      if (error?.response?.status && error.response.status !== 404) {
        showErrorToast("Failed to load applications");
      }
    } finally {
      setLoading(false);
    }
  };

  const openApplicationPdf = async (applicationId) => {
    try {
      const response = await api.get(
        `/api/students/applications/${applicationId}/pdf`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError("Failed to load application PDF");
    }
  };

  const downloadApplicationPdf = () => {
    if (!pdfBlobUrl) return;
    const link = document.createElement("a");
    link.href = pdfBlobUrl;
    link.download = "application.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInstallmentsModal = (app) => {
    setSelectedAppForInstallments(app);
    setShowInstallmentsModal(true);
    setReceiptFile(null);
    setTargetInstallmentNum(null);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile || !targetInstallmentNum || !selectedAppForInstallments) {
        showErrorToast("Please select a file to upload");
        return;
    }

    try {
        setUploadingReceipt(true);
        const formData = new FormData();
        formData.append("file", receiptFile);
        
        // Upload the file first
        const uploadResponse = await api.post("/api/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (uploadResponse.data?.success) {
            const fileUrl = uploadResponse.data.data.url;

            // Submit the URL to the new installment endpoint
            const res = await api.put(`/api/student-application/${selectedAppForInstallments._id}/upload-installment-receipt`, {
                installmentNumber: targetInstallmentNum,
                receiptUrl: fileUrl
            });

            if (res.data?.success) {
                showSuccess("Receipt uploaded successfully!");
                // Update local state so it reflects immediately
                setSelectedAppForInstallments(prev => ({
                    ...prev,
                    financialStatus: res.data.data
                }));
                // Also refetch all applications
                fetchApplications();
                setReceiptFile(null);
                setTargetInstallmentNum(null);
            }
        }
    } catch (error) {
        console.error("Error uploading receipt:", error);
        showErrorToast(error.response?.data?.message || "Failed to upload receipt");
    } finally {
        setUploadingReceipt(false);
    }
  };

  const printInvoice = (app) => {
    if (!app) return;
    const printWindow = window.open('', '_blank');
    const finStatus = app.financialStatus || { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING', installments: [] };
    
    let installmentsHtml = '';
    if (finStatus.installments && finStatus.installments.length > 0) {
        installmentsHtml = `
            <div style="margin-top: 15px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Installment Details</div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Inst #</th>
                        <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Date</th>
                        <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Method</th>
                        <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Status</th>
                        <th style="padding: 8px; text-align: right; font-size: 10px; font-weight: 600; color: #475569;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${finStatus.installments.map(inst => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px; font-size: 11px; color: #334155;">${inst.installmentNumber}</td>
                            <td style="padding: 8px; font-size: 11px; color: #334155;">${new Date(inst.date).toLocaleDateString('en-IN')}</td>
                            <td style="padding: 8px; font-size: 11px; color: #334155;">${inst.paymentMethod || 'N/A'}</td>
                            <td style="padding: 8px; font-size: 11px; color: #334155;">
                                <span style="font-weight: 600; color: ${inst.status === 'VERIFIED' ? '#059669' : inst.status === 'REJECTED' ? '#dc2626' : '#d97706'}">${inst.status}</span>
                            </td>
                            <td style="padding: 8px; text-align: right; font-size: 11px; font-weight: 600; color: #334155;">₹${inst.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Payment Invoice - ${app.personalDetails?.fullName || 'N/A'}</title>
                <style>
                    body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; background-color: #fff; }
                    .receipt-container { padding: 20px; max-width: 800px; margin: 0 auto; }
                    .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                    .logo-col { display: flex; flex-direction: column; }
                    .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.5px; }
                    .sub-logo { font-size: 11px; color: #64748b; }
                    .invoice-badge { font-size: 24px; font-weight: 300; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; }
                    .grid-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .info-box { background-color: #f8fafc; padding: 12px; border-radius: 6px; }
                    .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; letter-spacing: 0.5px; }
                    .value { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
                    .amount-summary { margin-top: 15px; margin-left: auto; width: 250px; }
                    .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
                    .amount-label { color: #64748b; font-weight: 500; }
                    .amount-value { font-weight: 600; color: #0f172a; }
                    .amount-total { font-size: 15px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-weight: 700; }
                    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                    .status-completed { background-color: #dcfce7; color: #166534; }
                    .status-partial { background-color: #fef9c3; color: #854d0e; }
                    .status-overdue { background-color: #fee2e2; color: #991b1b; }
                    .status-pending { background-color: #f1f5f9; color: #475569; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                    @media print {
                        body { margin: 0; }
                        .receipt-container { max-width: 100%; padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header-container">
                        <div class="logo-col">
                            <div class="logo">Swagat Group of Institutions</div>
                            <div class="sub-logo">Official Payment Invoice</div>
                        </div>
                        <div class="invoice-badge">INVOICE</div>
                    </div>
                    
                    <div class="grid-info">
                        <div class="info-box">
                            <div class="label">Billed To</div>
                            <div class="value" style="font-size: 15px;">${app.personalDetails?.fullName || 'N/A'}</div>
                            <div class="label" style="margin-top: 10px;">Application ID</div>
                            <div class="value" style="margin-bottom: 0;">${app.applicationId || 'N/A'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Course Details</div>
                            <div class="value">${app.courseDetails?.selectedCourse || 'N/A'}</div>
                            <div class="label" style="margin-top: 10px;">Date of Issue</div>
                            <div class="value" style="margin-bottom: 0;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                <th style="padding: 8px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Description</th>
                                <th style="padding: 8px; text-align: right; font-size: 11px; font-weight: 600; color: #475569;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 8px; font-size: 12px; color: #334155; font-weight: 500;">Course Tuition & Registration Fees</td>
                                <td style="padding: 10px 8px; text-align: right; font-size: 12px; color: #0f172a; font-weight: 600;">₹${finStatus.totalFees}</td>
                            </tr>
                        </tbody>
                    </table>

                    ${installmentsHtml}

                    <div class="amount-summary">
                        <div class="amount-row">
                            <div class="amount-label">Subtotal</div>
                            <div class="amount-value">₹${finStatus.totalFees}</div>
                        </div>
                        <div class="amount-row">
                            <div class="amount-label" style="color: #059669;">Total Paid</div>
                            <div class="amount-value" style="color: #059669;">- ₹${finStatus.paidAmount}</div>
                        </div>
                        <div class="amount-row amount-total">
                            <div class="amount-label">Balance Due</div>
                            <div class="amount-value">₹${finStatus.dueAmount}</div>
                        </div>
                        <div class="amount-row" style="margin-top: 20px; align-items: center;">
                            <div class="amount-label">Status</div>
                            <div>
                                <span class="status-badge status-${finStatus.paymentStatus.toLowerCase()}">${finStatus.paymentStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>This is a computer-generated document. No physical signature is required.</p>
                        <p>Swagat Group of Institutions &copy; ${new Date().getFullYear()} &bull; All Rights Reserved</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
  };

  const handleNewApplication = async () => {
    try {
      setSubmitting(true);
      await api.post("/api/students/applications", newApplication);
      console.log("Submitting payload:", newApplication);

      showSuccess("Application submitted successfully!");
      setShowNewApplicationModal(false);
      setNewApplication({
        course: "",
        institution: "",
        preferredStartDate: "",
        notes: "",
      });
      fetchApplications();
    } catch (error) {
      console.error(
        "Error submitting application:",
        error.response || error.message || error
      );

      showError("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    const confirmed = await showConfirm(
      "Withdraw Application",
      "Are you sure you want to withdraw this application? This action cannot be undone."
    );

    if (confirmed) {
      try {
        await api.delete(`/api/students/applications/${applicationId}`);
        showSuccess("Application withdrawn successfully");
        fetchApplications();
      } catch (error) {
        console.error("Error withdrawing application:", error);
        showError("Failed to withdraw application");
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;

    switch (normalizedStatus) {
      case "DRAFT":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "❓";
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;

    switch (normalizedStatus) {
      case "DRAFT":
        return "📝";
      case "SUBMITTED":
      case "PENDING":
        return "⏳";
      case "UNDER_REVIEW":
        return "👀";
      case "APPROVED":
        return "✅";
      case "REJECTED":
        return "❌";
      case "WITHDRAWN":
        return "🚫";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show different tabs based on user role
  const tabs = userRole === 'student'
    ? [{ id: 'my-applications', name: 'My Application' }]
    : [
      { id: 'my-applications', name: 'My Applications' },
      { id: 'submitted-applications', name: 'My Submitted Applications' }
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {userRole === 'student' ? 'My Application' : 'Applications Management'}
            </h2>
            <p className="text-gray-600">
              {userRole === 'student'
                ? 'Track and manage your course application'
                : 'Manage and submit applications for students'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            {userRole !== 'student' && (
              <button
                onClick={() => setShowSubmitForStudentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Submit for Student</span>
              </button>
            )}
            <button
              onClick={() => setShowNewApplicationModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>New Application</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      {tabs.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'my-applications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow"
        >
          {applications.length > 0 ? (
            // For students, show single application (not a list)
            userRole === 'student' ? (
              (() => {
                const application = applications[0]; // Only show the first/only application
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6"
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {application.personalDetails?.fullName || application.user?.fullName || 'Student'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              application.workflowStatus?.currentStage || application.status
                            )}`}
                          >
                            <span className="mr-2">
                              {getStatusIcon(application.workflowStatus?.currentStage || application.status)}
                            </span>
                            {(application.workflowStatus?.currentStage || application.status || 'PENDING').replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {(application.workflowStatus?.currentStage === "SUBMITTED" || application.status === "pending") && (
                            <button
                              onClick={() =>
                                handleWithdrawApplication(application._id)
                              }
                              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200"
                            >
                              Withdraw
                            </button>
                          )}
                          <button
                            onClick={() => openApplicationPdf(application._id)}
                            className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                          >
                            View PDF
                          </button>
                          <button
                            onClick={() => printInvoice(application)}
                            className="px-4 py-2 text-sm text-purple-700 bg-purple-100 border border-purple-200 hover:bg-purple-200 rounded-lg font-medium shadow-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-17V7a4 4 0 00-8 0v4h8z" /></svg>
                            Invoice
                          </button>
                          <button
                            onClick={() => openInstallmentsModal(application)}
                            className="px-4 py-2 text-sm text-blue-700 bg-blue-100 border border-blue-200 hover:bg-blue-200 rounded-lg font-medium shadow-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload Slip
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Course</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.courseDetails?.selectedCourse || 'N/A'}
                          </p>
                        </div>
                        {application.courseDetails?.campus && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Campus</p>
                            <p className="text-base font-semibold text-gray-900">
                              {typeof application.courseDetails.campus === 'object' ? application.courseDetails.campus.name : application.courseDetails.campus}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Application ID</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.applicationId || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Submitted On</p>
                          <p className="text-base font-semibold text-gray-900">
                            {new Date(
                              application.createdAt || application.applicationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          {application.submittedBy && application.submittedBy._id !== application.user?._id ? (
                            <>Form submitted by <span className="font-semibold text-gray-900">{application.submittedBy?.fullName || 'Agent/Staff'}</span></>
                          ) : (
                            <>Form submitted by <span className="font-semibold text-gray-900">Student</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-4">
                      {application.reviewNotes && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Review Notes:
                          </p>
                          <p className="text-sm text-blue-800">
                            {application.reviewNotes}
                          </p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Notes:
                          </p>
                          <p className="text-sm text-gray-700 italic">
                            "{application.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              // For non-students (agents/staff), show list view
              <div className="divide-y divide-gray-200">
                {applications.map((application, index) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.courseDetails?.selectedCourse || application.personalDetails?.fullName || 'Application'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              application.workflowStatus?.currentStage || application.status
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(application.workflowStatus?.currentStage || application.status)}
                            </span>
                            {(application.workflowStatus?.currentStage || application.status || 'PENDING').replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {application.personalDetails?.fullName || application.user?.fullName || 'Student'}
                          {application.submittedBy && application.submittedBy !== application.user?._id && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Form submitted by {application.submittedBy?.fullName || 'Agent/Staff'})
                            </span>
                          )}
                          {!application.submittedBy && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Form submitted by Student)
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Applied:{" "}
                            {new Date(
                              application.createdAt || application.applicationDate
                            ).toLocaleDateString()}
                          </span>
                          {application.applicationId && (
                            <span>Application ID: {application.applicationId}</span>
                          )}
                          {application.courseDetails?.campus && (
                            <span>Campus: {typeof application.courseDetails.campus === 'object' ? application.courseDetails.campus.name : application.courseDetails.campus}</span>
                          )}
                        </div>
                        {application.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{application.notes}"
                          </p>
                        )}
                        {application.reviewNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">
                              Review Notes:
                            </p>
                            <p className="text-sm text-blue-800">
                              {application.reviewNotes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {(application.workflowStatus?.currentStage === "SUBMITTED" || application.status === "pending") && (
                          <button
                            onClick={() =>
                              handleWithdrawApplication(application._id)
                            }
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          >
                            Withdraw
                          </button>
                        )}
                        <button
                          onClick={() => openApplicationPdf(application._id)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        >
                          View PDF
                        </button>
                        <button
                          onClick={() => printInvoice(application)}
                          className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg font-medium"
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => openInstallmentsModal(application)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium"
                        >
                          Upload Slip
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === 'student' ? 'No application yet' : 'No applications yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {userRole === 'student'
                  ? 'Get started by creating your application.'
                  : 'Get started by creating your first application.'}
              </p>
              <button
                onClick={() => setShowNewApplicationModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {userRole === 'student' ? 'Create Application' : 'New Application'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* My Submitted Applications Tab */}
      {activeTab === 'submitted-applications' && (
        <MySubmittedApplications />
      )}

      {/* Enhanced Application Form Modal */}
      {showNewApplicationModal && (
        <EnhancedStudentApplicationForm
          onClose={() => setShowNewApplicationModal(false)}
          onSuccess={(data) => {
            setShowNewApplicationModal(false);
            fetchApplications();
            showSuccess("Application submitted successfully!");
          }}
        />
      )}

      {/* Submit Application for Student Modal */}
      {showSubmitForStudentModal && (
        <SubmitApplicationForStudent
          onClose={() => setShowSubmitForStudentModal(false)}
          onSuccess={() => {
            setShowSubmitForStudentModal(false);
            // Refresh the submitted applications tab if it's active
            if (activeTab === 'submitted-applications') {
              // The MySubmittedApplications component will handle its own refresh
            }
            showSuccess("Application submitted successfully for student!");
          }}
        />
      )}

      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Application PDF
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadApplicationPdf}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(pdfBlobUrl);
                    setShowPdfModal(false);
                    setPdfBlobUrl("");
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {pdfBlobUrl ? (
                <iframe
                  title="Application PDF"
                  src={pdfBlobUrl}
                  className="w-full h-full"
                />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No PDF to display
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Installments & Upload Receipt Modal */}
      {showInstallmentsModal && selectedAppForInstallments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Installments
              </h3>
              <button
                onClick={() => setShowInstallmentsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inst #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(selectedAppForInstallments.financialStatus?.installments || []).map((inst) => (
                                <tr key={inst._id || inst.installmentNumber}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{inst.installmentNumber}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(inst.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        ₹{inst.amount}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            inst.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                            inst.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {inst.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        {inst.receiptUrl ? (
                                            <a href={inst.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                                View Slip
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No Slip</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {inst.status !== 'VERIFIED' && (
                                            <button
                                                onClick={() => setTargetInstallmentNum(inst.installmentNumber)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                                            >
                                                Upload New Slip
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!selectedAppForInstallments.financialStatus?.installments || selectedAppForInstallments.financialStatus.installments.length === 0) && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No installments found for this application.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {targetInstallmentNum && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-white p-5 rounded-lg border border-indigo-200 shadow-sm"
                    >
                        <h4 className="text-md font-medium text-gray-900 mb-4">Upload Receipt for Installment #{targetInstallmentNum}</h4>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setReceiptFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            />
                            <button
                                onClick={handleReceiptUpload}
                                disabled={!receiptFile || uploadingReceipt}
                                className={`px-4 py-2 rounded-md text-white font-medium whitespace-nowrap ${
                                    !receiptFile || uploadingReceipt ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {uploadingReceipt ? 'Uploading...' : 'Submit Receipt'}
                            </button>
                        </div>
                        {receiptFile && (
                            <p className="mt-2 text-sm text-gray-600">Selected file: {receiptFile.name}</p>
                        )}
                        <button 
                            onClick={() => { setTargetInstallmentNum(null); setReceiptFile(null); }}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowInstallmentsModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
