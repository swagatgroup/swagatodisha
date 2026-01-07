import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const StudentManagement = () => {
    const { selectedSession } = useSession();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterSubmitterRole, setFilterSubmitterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [statusData, setStatusData] = useState({
        status: '',
        notes: '',
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [filters, setFilters] = useState({
        statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETE'],
        courses: ['Bachelor of Technology', 'Bachelor of Commerce', 'Bachelor of Arts', 'Bachelor of Science'],
        submitters: []
    });
    const [showDocumentSelectionModal, setShowDocumentSelectionModal] = useState(false);
    const [selectedDocumentsForGeneration, setSelectedDocumentsForGeneration] = useState([]);
    const [generationType, setGenerationType] = useState(null); // 'pdf' or 'zip'
    const [generating, setGenerating] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]); // For bulk delete
    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        // Reset to page 1 when session changes (but not on initial mount)
        setCurrentPage(1);
    }, [selectedSession]);

    useEffect(() => {
        console.log('🔄 StudentManagement: Fetching students for session:', selectedSession);
        fetchStudents();
        fetchRejectionReasons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterStatus, filterCourse, filterSubmitterRole, selectedSession]);

    const fetchRejectionReasons = async () => {
        try {
            const response = await api.get('/api/admin/students/rejection-reasons');
            if (response.data.success) {
                setRejectionReasons(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rejection reasons:', error);
        }
    };

    // Document selection and generation handlers
    const toggleDocumentSelection = (documentId) => {
        setSelectedDocumentsForGeneration(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const selectAllDocuments = () => {
        if (!selectedStudent || !selectedStudent.documents) return;
        const approvedDocs = selectedStudent.documents.filter(doc => doc.status === 'APPROVED');
        setSelectedDocumentsForGeneration(approvedDocs.map((doc, idx) => doc._id?.toString() || doc.documentType || `doc_${idx}`));
    };

    const clearDocumentSelection = () => {
        setSelectedDocumentsForGeneration([]);
    };

    const handleConfirmGeneration = async () => {
        if (!selectedStudent || selectedDocumentsForGeneration.length === 0) {
            showError('Please select at least one document');
            return;
        }

        try {
            setGenerating(true);
            const applicationId = selectedStudent.applicationId || selectedStudent._id;
            if (!applicationId) {
                showError('Application ID not found');
                return;
            }

            const endpoint = generationType === 'pdf'
                ? `/api/student-application/${applicationId}/combined-pdf`
                : `/api/student-application/${applicationId}/documents-zip`;

            // Make request with responseType blob to handle file download directly
            // Set extended timeout for PDF/ZIP generation (120 seconds)
            const response = await api.post(endpoint, {
                selectedDocuments: selectedDocumentsForGeneration
            }, {
                responseType: 'blob', // Important: tell axios to handle as blob
                timeout: 120000 // 120 seconds for file generation and Cloudinary upload
            });

            // Check if response is actually a blob (file) or JSON error
            if (response.data instanceof Blob) {
                const contentType = response.headers['content-type'] || '';

                // Check if it's application/json (meaning backend returned JSON as blob)
                if (contentType.includes('application/json')) {
                    // Backend returned JSON as blob - parse it
                    const text = await response.data.text();
                    const jsonData = JSON.parse(text);

                    if (jsonData.success && jsonData.data) {
                        // Cloudinary URL response
                        const { url, pdfUrl, zipUrl, fileName: responseFileName, storageType } = jsonData.data;
                        const fileUrl = url || pdfUrl || zipUrl;

                        if (fileUrl && storageType === 'cloudinary') {
                            // Cloudinary URL - download directly
                            console.log('☁️ Downloading from Cloudinary:', fileUrl);

                            try {
                                // Fetch the file from Cloudinary
                                const fileResponse = await fetch(fileUrl);

                                if (!fileResponse.ok) {
                                    throw new Error(`Download failed: ${fileResponse.status}`);
                                }

                                // Create blob and download
                                const blob = await fileResponse.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = responseFileName || `application_${selectedStudent?.applicationId || 'document'}_${generationType}.${generationType === 'pdf' ? 'pdf' : 'zip'}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);

                                showSuccess(`${generationType.toUpperCase()} generated and downloaded successfully!`);

                                setShowDocumentSelectionModal(false);
                                setSelectedDocumentsForGeneration([]);
                                setGenerationType(null);
                            } catch (downloadError) {
                                console.error('Download error:', downloadError);
                                showError('File generated but download failed. You can try accessing it directly.');
                                // Fallback: open in new tab
                                window.open(fileUrl, '_blank');
                            }
                        } else {
                            showError(`Unexpected response format: ${storageType}`);
                        }
                    } else if (jsonData.message) {
                        showError(jsonData.message);
                    } else {
                        showError(`Failed to generate ${generationType.toUpperCase()}. Please try again.`);
                    }
                } else {
                    // Actual file was returned - download it
                    const contentDisposition = response.headers['content-disposition'] || '';
                    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                    const fileName = fileNameMatch
                        ? fileNameMatch[1]
                        : `application_${selectedStudent?.applicationId || 'document'}_${generationType}.${generationType === 'pdf' ? 'pdf' : 'zip'}`;

                    console.log(`📥 Downloading file: ${fileName}, size: ${response.data.size} bytes`);

                    // Create blob URL and download
                    const blobUrl = window.URL.createObjectURL(response.data);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);

                    showSuccess(`${generationType.toUpperCase()} generated and downloaded successfully!`);

                    setShowDocumentSelectionModal(false);
                    setSelectedDocumentsForGeneration([]);
                    setGenerationType(null);
                }
            } else {
                // Response is not a blob (shouldn't happen with responseType: 'blob')
                showError(`Failed to generate ${generationType.toUpperCase()}. Unexpected response type.`);
            }
        } catch (error) {
            console.error(`Error generating ${generationType}:`, error);

            // Handle blob response errors - axios returns blob even for error responses
            if (error.response && error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errorData = JSON.parse(text);
                    showError(errorData.message || `Failed to generate ${generationType.toUpperCase()}`);
                } catch (parseError) {
                    showError(`Failed to generate ${generationType.toUpperCase()}. Status: ${error.response.status}`);
                }
            } else {
                const errorMessage = error.response?.data?.message || error.message || `Failed to generate ${generationType.toUpperCase()}`;
                showError(errorMessage);
            }
        } finally {
            setGenerating(false);
        }
    };

    const formatDocumentLabel = (docType = '', fileName = '') => {
        const type = (docType || '').toString().toLowerCase();
        const name = (fileName || '').toString().toLowerCase();
        const source = `${type} ${name}`;

        const patterns = [
            { re: /(aadhar|aadhaar)/, label: 'Aadhar Card' },
            { re: /(passport).*photo|\bphoto\b/, label: 'Passport Photo' },
            { re: /(10th|tenth).*marksheet/, label: '10th Marksheet' },
            { re: /(12th|twelfth).*marksheet/, label: '12th Marksheet' },
            { re: /(marksheet|grade|result)/, label: 'Marksheet' },
            { re: /(transfer).*certificate|\btc\b/, label: 'Transfer Certificate' },
            { re: /(migration).*certificate/, label: 'Migration Certificate' },
            { re: /(character).*certificate/, label: 'Character Certificate' },
            { re: /(income).*certificate/, label: 'Income Certificate' },
            { re: /(caste).*certificate/, label: 'Caste Certificate' },
        ];

        for (const p of patterns) {
            if (p.re.test(source)) return p.label;
        }

        const fromType = docType ? docType.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() : '';
        if (fromType && fromType !== 'pdf document') {
            return fromType.replace(/\b\w/g, c => c.toUpperCase());
        }

        return fileName || 'Uploaded Document';
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            showLoading('Loading students...');

            // Fetching real data from server

            // Session is REQUIRED - always include it
            if (!selectedSession) {
                console.error('❌ No session selected!');
                setStudents([]);
                setTotalItems(0);
                closeLoading();
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                session: selectedSession, // REQUIRED - always pass session
                sortBy: 'personalDetails.fullName',
                sortOrder: 'asc', // A to Z (alphabetical order)
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterCourse !== 'all' && { course: filterCourse }),
                ...(filterSubmitterRole !== 'all' && { submitterRole: filterSubmitterRole })
            });

            console.log('🔍 Fetching students from:', `/api/admin/students?${params}`);
            const response = await api.get(`/api/admin/students?${params}`);
            console.log('📊 Students response:', response.data);
            console.log('📊 Students data structure:', response.data.data);
            console.log('📊 Filters from API:', response.data.data?.filters);

            if (response.data.success) {
                let studentsData = response.data.data.students || [];

                // Frontend sorting fallback: Sort by fullName A to Z (alphabetical)
                studentsData = [...studentsData].sort((a, b) => {
                    const nameA = (a.fullName || '').toLowerCase().trim();
                    const nameB = (b.fullName || '').toLowerCase().trim();
                    if (nameA < nameB) return -1;
                    if (nameA > nameB) return 1;
                    return 0; // Ascending (A to Z)
                });

                setStudents(studentsData);
                const pagination = response.data.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setItemsPerPage(pagination.itemsPerPage || 20);
                setFilters(response.data.data.filters || {
                    statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
                    courses: [],
                    categories: [],
                    submitters: []
                });
                console.log('✅ Real data loaded:', response.data.data.students?.length || 0, 'students');
            } else {
                throw new Error(response.data.message || 'Failed to fetch students');
            }

            closeLoading();
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            console.error('❌ Error response:', error.response?.data);
            closeLoading();

            // Show error but don't fall back to mock data for real server
            showError('Failed to load students from server. Please check your connection and try again.');
            console.log('🔧 Server connection failed - check MongoDB and server status');

            // Keep empty state instead of mock data
            setStudents([]);
            setTotalPages(1);
            setTotalItems(0);
            setItemsPerPage(20);

        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusData.status) {
            showError('Please select a status');
            return;
        }

        // If rejecting, check for required rejection fields
        if (statusData.status === 'REJECTED') {
            if (!statusData.rejectionReason) {
                showError('Please select a rejection reason');
                return;
            }
            if (!statusData.rejectionMessage) {
                showError('Please provide a rejection message');
                return;
            }
        }

        try {
            showLoading('Updating application status...');

            console.log('🔄 Updating status for student:', selectedStudent._id, 'to:', statusData.status);
            const response = await api.put(`/api/admin/students/${selectedStudent._id}/status`, statusData);
            console.log('✅ Update response:', response.data);

            setShowStatusModal(false);
            setStatusData({
                status: '',
                notes: '',
                rejectionReason: '',
                rejectionMessage: '',
                rejectionDetails: []
            });
            setShowRejectionForm(false);
            setSelectedStudent(null);
            closeLoading();
            showSuccess(`Application status updated to ${statusData.status}!`);

            fetchStudents(); // Refresh the list
        } catch (error) {
            console.error('❌ Error updating status:', error);
            console.error('❌ Error response:', error.response?.data);
            closeLoading();
            handleApiError(error);
        }
    };

    const addRejectionDetail = () => {
        setStatusData({
            ...statusData,
            rejectionDetails: [
                ...statusData.rejectionDetails,
                {
                    issue: '',
                    documentType: '',
                    actionRequired: '',
                    priority: 'High',
                    specificFeedback: ''
                }
            ]
        });
    };

    const removeRejectionDetail = (index) => {
        const newDetails = statusData.rejectionDetails.filter((_, i) => i !== index);
        setStatusData({
            ...statusData,
            rejectionDetails: newDetails
        });
    };

    const updateRejectionDetail = (index, field, value) => {
        const newDetails = [...statusData.rejectionDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setStatusData({
            ...statusData,
            rejectionDetails: newDetails
        });
    };

    const handleAcceptApplication = async (student) => {
        try {
            showLoading('Accepting application...');

            console.log('✅ Accepting application:', student._id);
            const response = await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'APPROVED',
                notes: 'Application approved by admin'
            });

            console.log('✅ Accept response:', response.data);
            closeLoading();
            showSuccess(`${student.fullName}'s application has been approved!`);

            fetchStudents(); // Refresh the list
        } catch (error) {
            console.error('❌ Error accepting application:', error);
            closeLoading();
            handleApiError(error);
        }
    };


    const handleEdit = async () => {
        try {
            showLoading('Updating student...');

            // Structure the data properly for the backend
            const updatePayload = {
                personalDetails: {
                    ...editData.personalDetails
                },
                contactDetails: {
                    ...editData.contactDetails,
                    // Ensure permanentAddress is properly structured
                    permanentAddress: {
                        street: editData.contactDetails?.permanentAddress?.street || editData.contactDetails?.address || '',
                        city: editData.contactDetails?.permanentAddress?.city || editData.contactDetails?.city || '',
                        state: editData.contactDetails?.permanentAddress?.state || '',
                        pincode: editData.contactDetails?.permanentAddress?.pincode || ''
                    }
                },
                courseDetails: {
                    ...editData.courseDetails
                },
                guardianDetails: {
                    ...editData.guardianDetails
                }
            };

            // Remove empty address fields
            if (updatePayload.contactDetails.permanentAddress) {
                Object.keys(updatePayload.contactDetails.permanentAddress).forEach(key => {
                    if (!updatePayload.contactDetails.permanentAddress[key]) {
                        delete updatePayload.contactDetails.permanentAddress[key];
                    }
                });
            }

            console.log('🔄 Updating student:', selectedStudent._id, 'with data:', updatePayload);
            const response = await api.put(`/api/admin/students/${selectedStudent._id}`, updatePayload);

            console.log('✅ Update response:', response.data);
            
            setShowEditModal(false);
            setEditData({});
            setSelectedStudent(null);
            closeLoading();
            showSuccess('Student updated successfully!');

            // Refresh the list to show updated data
            await fetchStudents();
        } catch (error) {
            console.error('❌ Error updating student:', error);
            console.error('❌ Error response:', error.response?.data);
            closeLoading();
            
            // Show actual error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update student';
            showError(errorMessage);
        }
    };

    // Bulk delete handlers (Super Admin only)
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudents(students.map(student => student._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId, checked) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) {
            showError('Please select at least one student to delete');
            return;
        }

        const confirmed = await showConfirm(
            'Delete Students',
            `Are you sure you want to delete ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}? This action cannot be undone.`,
            'warning'
        );

        if (!confirmed || !confirmed.isConfirmed) return;

        try {
            showLoading('Deleting...', `Deleting ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}...`);

            // Ensure all IDs are strings
            const studentIds = selectedStudents.map(id => String(id));

            const response = await api.delete('/api/admin/students/bulk', {
                data: { studentIds: studentIds }
            });

            if (response.data.success) {
                closeLoading();
                const message = response.data.invalidIds && response.data.invalidIds.length > 0
                    ? `Deleted ${response.data.deletedCount} student(s). ${response.data.invalidIds.length} invalid ID(s) were skipped.`
                    : `Successfully deleted ${response.data.deletedCount} student${response.data.deletedCount > 1 ? 's' : ''}!`;
                showSuccess(message);
                setSelectedStudents([]);
                fetchStudents(); // Refresh the list
            }
        } catch (error) {
            closeLoading();
            console.error('Error bulk deleting students:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete students';
            showError(errorMessage);
        }
    };

    // Export to Excel (CSV format that Excel can open) - Complete Data Export
    const handleExportToExcel = async () => {
        try {
            // Show loading while fetching all data
            showLoading('Preparing export...', 'Fetching all filtered student data...');

            // Session is REQUIRED - always include it
            if (!selectedSession) {
                closeLoading();
                showError('No session selected');
                return;
            }

            // Fetch ALL students matching current filters (no pagination)
            const params = new URLSearchParams({
                page: 1,
                limit: 10000, // Large limit to get all records
                session: selectedSession, // REQUIRED - always pass session
                sortBy: 'personalDetails.fullName',
                sortOrder: 'asc', // A to Z (alphabetical order)
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterCourse !== 'all' && { course: filterCourse }),
                ...(filterSubmitterRole !== 'all' && { submitterRole: filterSubmitterRole })
            });

            const response = await api.get(`/api/admin/students?${params}`);
            closeLoading();

            let allStudents = response.data.success ? (response.data.data.students || []) : [];

            if (allStudents.length === 0) {
                showError('No students to export');
                return;
            }

            // Sort by fullName A to Z (alphabetical) for export consistency
            allStudents = [...allStudents].sort((a, b) => {
                const nameA = (a.fullName || '').toLowerCase().trim();
                const nameB = (b.fullName || '').toLowerCase().trim();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0; // Ascending (A to Z)
            });

            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined || value === '') return 'N/A';
                const str = String(value);
                // Replace quotes with double quotes and wrap in quotes if contains comma, quote, or newline
                if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Helper function to format URLs for Excel (ensures they're clickable)
            // Excel automatically converts URLs starting with http:// or https:// to hyperlinks
            const formatAsLink = (url) => {
                if (!url || url === 'N/A') return 'N/A';
                const urlStr = String(url).trim();

                // If it's a valid URL, return it without escaping (Excel will make it clickable)
                if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
                    // Don't escape URLs - Excel needs them as plain text to recognize as links
                    // Only escape if URL contains commas or quotes (which is rare for URLs)
                    if (urlStr.includes(',') || urlStr.includes('"')) {
                        return `"${urlStr.replace(/"/g, '""')}"`;
                    }
                    return urlStr;
                }

                // For non-URL values, escape normally
                return escapeCSV(urlStr);
            };

            // Helper function to format numeric fields as text (prevents Excel scientific notation)
            const formatAsText = (value) => {
                if (value === null || value === undefined || value === '') return 'N/A';
                const str = String(value).trim();
                // Add a non-breaking space at the start (invisible but forces text format)
                // This prevents Excel from converting to scientific notation
                // The space is invisible in Excel but ensures the number displays correctly
                return `"${'\u00A0'}${str}"`;
            };

            // Helper function to format date
            const formatDate = (date) => {
                if (!date) return 'N/A';
                try {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch {
                    return String(date);
                }
            };

            // Helper function to format datetime
            const formatDateTime = (date) => {
                if (!date) return 'N/A';
                try {
                    const d = new Date(date);
                    return d.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch {
                    return String(date);
                }
            };

            // Collect all unique document types from all students to create dynamic columns
            const allDocumentTypes = new Set();
            allStudents.forEach(student => {
                if (student.documents && student.documents.length > 0) {
                    student.documents.forEach(doc => {
                        const docType = doc.documentType || doc.fileName || 'Other';
                        allDocumentTypes.add(docType);
                    });
                }
            });

            // Sort document types for consistent column order
            const sortedDocTypes = Array.from(allDocumentTypes).sort();

            // Essential headers with necessary details and separate document link columns
            const headers = [
                'S.No',
                'Application ID',
                'Status',
                'Current Stage',
                // Personal Details
                'Full Name',
                "Father's Name",
                "Mother's Name",
                'Date of Birth',
                'Gender',
                'Aadhar Number',
                'Category/Status',
                // Contact Details
                'Email',
                'Primary Phone',
                'WhatsApp Number',
                'Address',
                'City',
                'State',
                'Pincode',
                // Course Details
                'College',
                'Course',
                'Stream',
                'Academic Year',
                'Semester',
                // Additional Info
                'Referral Code',
                'Created Date',
                // Document Links - separate column for each document type
                ...sortedDocTypes.map(docType => `Document: ${docType}`)
            ];

            const csvRows = [headers.join(',')];

            allStudents.forEach((student, index) => {
                // Format address (combine street, city, state, pincode)
                const address = [
                    student.contactDetails?.permanentAddress?.street,
                    student.contactDetails?.permanentAddress?.city,
                    student.contactDetails?.permanentAddress?.state,
                    student.contactDetails?.permanentAddress?.pincode
                ].filter(Boolean).join(', ');

                // Create a map of document types to their file paths
                const documentMap = {};
                if (student.documents && student.documents.length > 0) {
                    student.documents.forEach(doc => {
                        const docType = doc.documentType || doc.fileName || 'Other';
                        const docLink = doc.filePath || '';

                        if (docLink) {
                            // If multiple documents of same type, combine them with line break (Excel supports this)
                            if (documentMap[docType]) {
                                documentMap[docType] += '\n' + docLink;
                            } else {
                                documentMap[docType] = docLink;
                            }
                        }
                    });
                }

                // Get college name if available - handle both ObjectId and populated object
                let collegeName = 'N/A';
                if (student.courseDetails?.selectedCollege) {
                    if (typeof student.courseDetails.selectedCollege === 'string') {
                        // It's an ObjectId string - we can't resolve it here, use institutionName as fallback
                        collegeName = student.courseDetails?.institutionName || 'N/A';
                    } else if (typeof student.courseDetails.selectedCollege === 'object') {
                        // It's a populated object
                        collegeName = student.courseDetails.selectedCollege.name ||
                            student.courseDetails.selectedCollege.code ||
                            'N/A';
                    }
                } else {
                    collegeName = student.courseDetails?.institutionName || 'N/A';
                }

                const row = [
                    index + 1,
                    escapeCSV(student.applicationId),
                    escapeCSV(student.status),
                    escapeCSV(student.currentStage),
                    // Personal Details
                    escapeCSV(student.personalDetails?.fullName),
                    escapeCSV(student.personalDetails?.fathersName),
                    escapeCSV(student.personalDetails?.mothersName),
                    formatDate(student.personalDetails?.dateOfBirth),
                    escapeCSV(student.personalDetails?.gender),
                    formatAsText(student.personalDetails?.aadharNumber),
                    escapeCSV(student.personalDetails?.status || student.personalDetails?.category),
                    // Contact Details
                    escapeCSV(student.contactDetails?.email),
                    formatAsText(student.contactDetails?.primaryPhone),
                    formatAsText(student.contactDetails?.whatsappNumber),
                    escapeCSV(address),
                    escapeCSV(student.contactDetails?.permanentAddress?.city),
                    escapeCSV(student.contactDetails?.permanentAddress?.state),
                    formatAsText(student.contactDetails?.permanentAddress?.pincode),
                    // Course Details
                    escapeCSV(collegeName),
                    escapeCSV(student.courseDetails?.selectedCourse || student.courseDetails?.courseName),
                    escapeCSV(student.courseDetails?.stream),
                    escapeCSV(student.courseDetails?.academicYear),
                    escapeCSV(student.courseDetails?.semester),
                    // Additional Info
                    escapeCSV(student.referralCode || student.referralInfo?.referralCode),
                    formatDate(student.createdAt),
                    // Document Links - one column per document type (formatted as clickable links)
                    ...sortedDocTypes.map(docType => {
                        const link = documentMap[docType] || 'N/A';
                        return formatAsLink(link);
                    })
                ];
                csvRows.push(row.join(','));
            });

            // Create blob and download
            const csvContent = csvRows.join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const sessionName = selectedSession || 'all';
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `students_export_${sessionName}_${timestamp}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showSuccess(`Exported ${allStudents.length} student(s) to Excel file with essential details and document links!`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showError('Failed to export data to Excel');
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'COMPLETE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'A': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'B1': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'B2': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'B3': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'B4': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'C1': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
            case 'C2': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
            case 'C3': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Student Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all student applications from agents, students, staff, and super admins
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems > 0 ? (
                        <>
                            {totalItems} {totalItems === 1 ? 'Student' : 'Students'}
                            {totalPages > 1 && (
                                <span className="ml-2 text-gray-400">
                                    (Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems})
                                </span>
                            )}
                        </>
                    ) : (
                        'No students found'
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, Aadhar, phone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="all">Total Students</option>
                    {(filters.statuses || []).map(status => {
                        // Map status codes to readable labels
                        const statusLabels = {
                            'DRAFT': 'Draft',
                            'SUBMITTED': 'Submitted',
                            'UNDER_REVIEW': 'Under Review',
                            'APPROVED': 'Approved',
                            'REJECTED': 'Rejected',
                            'COMPLETE': 'Complete'
                        };
                        return (
                            <option key={status} value={status}>{statusLabels[status] || status}</option>
                        );
                    })}
                </select>
                <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="all">All Courses</option>
                    {(filters.courses || []).map(course => (
                        <option key={course} value={course}>{course}</option>
                    ))}
                </select>
                <select
                    value={filterSubmitterRole}
                    onChange={(e) => setFilterSubmitterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="all">All Submitters</option>
                    <option value="student">Student</option>
                    <optgroup label="Agents">
                        {(filters.submitters || [])
                            .filter(s => s.role === 'agent')
                            .map(submitter => (
                                <option key={submitter.id} value={submitter.id}>
                                    {submitter.name} ({submitter.count} submissions)
                                </option>
                            ))}
                    </optgroup>
                    <optgroup label="Staff">
                        {(filters.submitters || [])
                            .filter(s => s.role === 'staff')
                            .map(submitter => (
                                <option key={submitter.id} value={submitter.id}>
                                    {submitter.name} ({submitter.count} submissions)
                                </option>
                            ))}
                    </optgroup>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            {/* Action Buttons */}
            <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
                {/* Export to Excel Button */}
                {students.length > 0 && (
                    <button
                        onClick={handleExportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <i className="fa-solid fa-file-excel"></i>
                        <span>Export to Excel</span>
                    </button>
                )}

                {/* Bulk Delete Button (Super Admin Only) */}
                {isSuperAdmin && selectedStudents.length > 0 && (
                    <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex-1 min-w-[300px]">
                        <div className="flex items-center space-x-2">
                            <i className="fa-solid fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                            <span className="text-sm font-medium text-red-900 dark:text-red-100">
                                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                            <i className="fa-solid fa-trash"></i>
                            <span>Delete Selected</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {isSuperAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.length === students.length && students.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                S.No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Aadhar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Submitted By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={isSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No students found
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            {searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all'
                                                ? 'Try adjusting your search criteria or filters.'
                                                : selectedSession
                                                    ? `No admissions found for the ${selectedSession} academic session.`
                                                    : 'No student applications have been submitted yet.'}
                                        </p>
                                        {(searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilterStatus('all');
                                                    setFilterCourse('all');
                                                    setFilterSubmitterRole('all');
                                                }}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            students.map((student, index) => {
                                // Calculate serial number based on current page
                                const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
                                return (
                                    <motion.tr
                                        key={student._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student._id)}
                                                    onChange={(e) => handleSelectStudent(student._id, e.target.checked)}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                            {serialNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                                                            {student.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {student.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        ID: {student.applicationId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                                            {student.aadharNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {student.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {student.course}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            <div className="text-sm">
                                                {(() => {
                                                    // Use referredBy (already computed correctly in backend) or submittedBy object
                                                    let submitterName = 'Direct';

                                                    if (student.referredBy && student.referredBy !== 'Direct' && student.referredBy !== 'Unknown' && student.referredBy.trim() !== '') {
                                                        submitterName = student.referredBy.trim();
                                                    } else if (student.submittedBy && student.submittedBy.fullName) {
                                                        submitterName = student.submittedBy.fullName.trim();
                                                    }

                                                    const role = student.submitterRole || 'student';
                                                    const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);

                                                    return submitterName && submitterName !== 'Direct' && submitterName !== 'Unknown' && submitterName.trim() !== ''
                                                        ? `${submitterName} (${roleCapitalized})`
                                                        : `Direct (${roleCapitalized})`;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Details"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {/* Accept Button - Only for SUBMITTED and UNDER_REVIEW */}
                                                {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                    <button
                                                        onClick={() => handleAcceptApplication(student)}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Accept Application"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Reject Button - Only for SUBMITTED and UNDER_REVIEW */}
                                                {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setStatusData({
                                                                status: 'REJECTED',
                                                                notes: '',
                                                                rejectionReason: '',
                                                                rejectionMessage: '',
                                                                rejectionDetails: []
                                                            });
                                                            setShowRejectionForm(true);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Reject Application"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setStatusData({ status: student.status, notes: '' });
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                    title="Update Status"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setEditData({
                                                            personalDetails: {
                                                                fullName: student.personalDetails?.fullName || student.fullName || '',
                                                                fathersName: student.personalDetails?.fathersName || '',
                                                                mothersName: student.personalDetails?.mothersName || '',
                                                                dateOfBirth: student.personalDetails?.dateOfBirth || '',
                                                                gender: student.personalDetails?.gender || '',
                                                                aadharNumber: student.personalDetails?.aadharNumber || student.aadharNumber || ''
                                                            },
                                                            contactDetails: {
                                                                email: student.contactDetails?.email || student.email || '',
                                                                primaryPhone: student.contactDetails?.primaryPhone || student.phone || '',
                                                                whatsappNumber: student.contactDetails?.whatsappNumber || '',
                                                                permanentAddress: {
                                                                    street: student.contactDetails?.permanentAddress?.street || student.contactDetails?.address || '',
                                                                    city: student.contactDetails?.permanentAddress?.city || student.contactDetails?.city || '',
                                                                    state: student.contactDetails?.permanentAddress?.state || '',
                                                                    pincode: student.contactDetails?.permanentAddress?.pincode || ''
                                                                }
                                                            },
                                                            courseDetails: {
                                                                ...student.courseDetails,
                                                                institutionName: student.courseDetails?.institutionName || (typeof student.courseDetails?.selectedCollege === 'object' ? student.courseDetails.selectedCollege?.name || student.courseDetails.selectedCollege?.code || '' : '') || '',
                                                                selectedCourse: student.courseDetails?.selectedCourse || student.courseDetails?.courseName || '',
                                                                stream: student.courseDetails?.stream || '',
                                                                campus: student.courseDetails?.campus || ''
                                                            },
                                                            guardianDetails: {
                                                                guardianName: student.guardianDetails?.guardianName || '',
                                                                relationship: student.guardianDetails?.relationship || '',
                                                                guardianPhone: student.guardianDetails?.guardianPhone || '',
                                                                guardianEmail: student.guardianDetails?.guardianEmail || ''
                                                            }
                                                        });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    title="Edit"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} students
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Previous
                        </button>
                        <div className="flex space-x-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm ${currentPage === pageNum
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Full Application Details Modal */}
            {showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Full Application Details
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Application ID: {selectedStudent.applicationId} | Status: <span className={`font-semibold ${getStatusColor(selectedStudent.status)}`}>{selectedStudent.status}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Personal Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.fullName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Father's Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.fathersName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Mother's Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.mothersName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.gender || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.personalDetails?.dateOfBirth 
                                                    ? formatDate(selectedStudent.personalDetails.dateOfBirth) 
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Aadhar Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.aadharNumber || selectedStudent.aadharNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.category || selectedStudent.personalDetails?.status || selectedStudent.category || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary Phone</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.phone || selectedStudent.contactDetails?.primaryPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.email || selectedStudent.contactDetails?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">WhatsApp Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails?.whatsappNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                {(selectedStudent.contactDetails?.permanentAddress || selectedStudent.contactDetails?.currentAddress || selectedStudent.contactDetails?.address) && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Address Information
                                        </h4>
                                        <div className="space-y-4">
                                            {/* Permanent Address */}
                                            {(selectedStudent.contactDetails?.permanentAddress || (selectedStudent.contactDetails?.address && selectedStudent.contactDetails?.city)) && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permanent Address</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.permanentAddress?.street || selectedStudent.contactDetails?.address || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.permanentAddress?.city || selectedStudent.contactDetails?.city || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.permanentAddress?.state || selectedStudent.contactDetails?.state || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.permanentAddress?.pincode || selectedStudent.contactDetails?.pincode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">District</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.district || selectedStudent.contactDetails?.permanentAddress?.district || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.permanentAddress?.country || 'India'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Current Address */}
                                            {selectedStudent.contactDetails?.currentAddress?.street && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Address</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.street || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.city || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.state || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.pincode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">District</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.currentAddress?.district || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.country || 'India'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Course Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Course Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Institution Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.institutionName || selectedStudent.institutionName || 'Swagat Group of Institutions'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Course Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.selectedCourse || selectedStudent.course || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stream</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.stream || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Campus</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.courseDetails?.campus?.name || 
                                                 (typeof selectedStudent.courseDetails?.campus === 'string' ? selectedStudent.courseDetails.campus : '') || 
                                                 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Guardian Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianName || selectedStudent.guardianName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Phone</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianPhone || selectedStudent.guardianPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Relation</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.relationship || selectedStudent.guardianDetails?.guardianRelation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Email</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianEmail || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Uploaded Documents ({selectedStudent.documents.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedStudent.documents.map((doc, index) => (
                                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.documentType || doc.fileName}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Status: <span className={`font-semibold ${doc.status === 'APPROVED' ? 'text-green-600' : doc.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                    {doc.status || 'PENDING'}
                                                                </span>
                                                            </p>
                                                            {doc.uploadedAt && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Uploaded: {formatDate(doc.uploadedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {doc.filePath && (
                                                            <a
                                                                href={doc.filePath}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Generate PDF/ZIP Buttons */}
                                        {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                                            <div className="mt-4 flex space-x-3">
                                                <button
                                                    onClick={() => {
                                                        const allApproved = selectedStudent.documents.every(doc => doc.status === 'APPROVED');
                                                        if (!allApproved) {
                                                            showError('Please approve all documents before generating PDF');
                                                            return;
                                                        }
                                                        const approvedDocs = selectedStudent.documents.filter(doc => doc.status === 'APPROVED');
                                                        setSelectedDocumentsForGeneration(approvedDocs.map((doc, idx) => doc._id?.toString() || doc.documentType || `doc_${idx}`));
                                                        setGenerationType('pdf');
                                                        setShowDocumentSelectionModal(true);
                                                    }}
                                                    disabled={!selectedStudent.documents.every(doc => doc.status === 'APPROVED')}
                                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${selectedStudent.documents.every(doc => doc.status === 'APPROVED')
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                        }`}
                                                    title={selectedStudent.documents.every(doc => doc.status === 'APPROVED') ? 'Generate combined PDF' : 'Please approve all documents first'}
                                                >
                                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Generate PDF
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const allApproved = selectedStudent.documents.every(doc => doc.status === 'APPROVED');
                                                        if (!allApproved) {
                                                            showError('Please approve all documents before generating ZIP');
                                                            return;
                                                        }
                                                        const approvedDocs = selectedStudent.documents.filter(doc => doc.status === 'APPROVED');
                                                        setSelectedDocumentsForGeneration(approvedDocs.map((doc, idx) => doc._id?.toString() || doc.documentType || `doc_${idx}`));
                                                        setGenerationType('zip');
                                                        setShowDocumentSelectionModal(true);
                                                    }}
                                                    disabled={!selectedStudent.documents.every(doc => doc.status === 'APPROVED')}
                                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${selectedStudent.documents.every(doc => doc.status === 'APPROVED')
                                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                        }`}
                                                    title={selectedStudent.documents.every(doc => doc.status === 'APPROVED') ? 'Generate ZIP' : 'Please approve all documents first'}
                                                >
                                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                    Generate ZIP
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Referral & Submission Info */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Application Tracking
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Submitted By</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.referredBy || 'Direct Student'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Submitter Role</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.submitterRole || 'Student'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Referral Code</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.referralCode || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedStudent.createdAt)}</p>
                                        </div>
                                        {selectedStudent.submittedAt && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Submitted Date</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedStudent.submittedAt)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Stage</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.currentStage || selectedStudent.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Information (if rejected) */}
                                {selectedStudent.status === 'REJECTED' && selectedStudent.reviewInfo && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-red-800 dark:text-red-200 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Rejection Details
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStudent.reviewInfo.rejectionReason && (
                                                <div>
                                                    <label className="text-xs font-medium text-red-700 dark:text-red-300">Reason</label>
                                                    <p className="text-sm text-red-900 dark:text-red-100">{selectedStudent.reviewInfo.rejectionReason}</p>
                                                </div>
                                            )}
                                            {selectedStudent.reviewInfo.rejectionMessage && (
                                                <div>
                                                    <label className="text-xs font-medium text-red-700 dark:text-red-300">Message</label>
                                                    <p className="text-sm text-red-900 dark:text-red-100">{selectedStudent.reviewInfo.rejectionMessage}</p>
                                                </div>
                                            )}
                                            {selectedStudent.reviewInfo.rejectionDetails && selectedStudent.reviewInfo.rejectionDetails.length > 0 && (
                                                <div>
                                                    <label className="text-xs font-medium text-red-700 dark:text-red-300">Specific Issues</label>
                                                    <ul className="mt-2 space-y-2">
                                                        {selectedStudent.reviewInfo.rejectionDetails.map((detail, idx) => (
                                                            <li key={idx} className="text-sm text-red-900 dark:text-red-100 bg-white dark:bg-gray-800 rounded p-2">
                                                                <strong>{detail.documentType || detail.issue}:</strong> {detail.specificFeedback || detail.actionRequired}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setStatusData({ status: selectedStudent.status, notes: '' });
                                        setShowStatusModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Update Status - {selectedStudent.fullName}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setStatusData({
                                                ...statusData,
                                                status: newStatus,
                                                rejectionReason: '',
                                                rejectionMessage: '',
                                                rejectionDetails: []
                                            });
                                            setShowRejectionForm(newStatus === 'REJECTED');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="DRAFT">Draft</option>
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="COMPLETE">Complete (Graduated)</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                {/* Rejection Form */}
                                {showRejectionForm && (
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                        <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-4">
                                            Rejection Details
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Reason *
                                                </label>
                                                <select
                                                    value={statusData.rejectionReason}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="">Select Rejection Reason</option>
                                                    {Object.values(rejectionReasons).map((category) => (
                                                        <optgroup key={category.category} label={category.category}>
                                                            {category.reasons.map((reason) => (
                                                                <option key={reason.id} value={reason.id}>
                                                                    {reason.title}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Message *
                                                </label>
                                                <textarea
                                                    value={statusData.rejectionMessage}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionMessage: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Explain what the student needs to do to fix the issues..."
                                                />
                                            </div>

                                            {/* Rejection Details */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Specific Issues
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={addRejectionDetail}
                                                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        + Add Issue
                                                    </button>
                                                </div>

                                                {statusData.rejectionDetails.map((detail, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 bg-white dark:bg-gray-800">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Issue #{index + 1}
                                                            </h5>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRejectionDetail(index)}
                                                                className="text-red-600 hover:text-red-800 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Issue Description
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.issue}
                                                                    onChange={(e) => updateRejectionDetail(index, 'issue', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Certificate is too old"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Document Type
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.documentType}
                                                                    onChange={(e) => updateRejectionDetail(index, 'documentType', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., 10th Grade Certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Action Required
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.actionRequired}
                                                                    onChange={(e) => updateRejectionDetail(index, 'actionRequired', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Provide recent certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Priority
                                                                </label>
                                                                <select
                                                                    value={detail.priority}
                                                                    onChange={(e) => updateRejectionDetail(index, 'priority', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                >
                                                                    <option value="High">High</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Low">Low</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2">
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Specific Feedback
                                                            </label>
                                                            <textarea
                                                                value={detail.specificFeedback}
                                                                onChange={(e) => updateRejectionDetail(index, 'specificFeedback', e.target.value)}
                                                                rows={2}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Additional specific feedback for this issue..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusData.notes}
                                        onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Add any notes about this status change..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setShowRejectionForm(false);
                                        setStatusData({
                                            status: '',
                                            notes: '',
                                            rejectionReason: '',
                                            rejectionMessage: '',
                                            rejectionDetails: []
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${statusData.status === 'REJECTED'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                        }`}
                                >
                                    {statusData.status === 'REJECTED' ? 'Reject Application' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Edit Student - {selectedStudent.fullName}
                            </h3>

                            <div className="space-y-4">
                                {/* Personal Details Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Personal Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.fullName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, fullName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Father's Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.fathersName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, fathersName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Mother's Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.mothersName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, mothersName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                value={editData.personalDetails?.dateOfBirth ? new Date(editData.personalDetails.dateOfBirth).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, dateOfBirth: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                value={editData.personalDetails?.gender || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, gender: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Aadhar Number {!isSuperAdmin && <span className="text-xs text-gray-500">(Read-only)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.aadharNumber || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }
                                                })}
                                                disabled={!isSuperAdmin}
                                                maxLength="12"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Contact Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={editData.contactDetails?.email || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, email: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Primary Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={editData.contactDetails?.primaryPhone || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, primaryPhone: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                WhatsApp Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={editData.contactDetails?.whatsappNumber || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, whatsappNumber: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Address Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.permanentAddress?.street || editData.contactDetails?.address || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: {
                                                        ...editData.contactDetails,
                                                        permanentAddress: {
                                                            ...editData.contactDetails?.permanentAddress,
                                                            street: e.target.value
                                                        },
                                                        address: e.target.value
                                                    }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.permanentAddress?.city || editData.contactDetails?.city || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: {
                                                        ...editData.contactDetails,
                                                        permanentAddress: {
                                                            ...editData.contactDetails?.permanentAddress,
                                                            city: e.target.value
                                                        },
                                                        city: e.target.value
                                                    }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.permanentAddress?.state || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: {
                                                        ...editData.contactDetails,
                                                        permanentAddress: {
                                                            ...editData.contactDetails?.permanentAddress,
                                                            state: e.target.value
                                                        }
                                                    }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.permanentAddress?.pincode || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: {
                                                        ...editData.contactDetails,
                                                        permanentAddress: {
                                                            ...editData.contactDetails?.permanentAddress,
                                                            pincode: e.target.value.replace(/\D/g, '').slice(0, 6)
                                                        }
                                                    }
                                                })}
                                                maxLength="6"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Details Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Guardian Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Guardian Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.guardianDetails?.guardianName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Relationship
                                            </label>
                                            <select
                                                value={editData.guardianDetails?.relationship || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, relationship: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Guardian Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={editData.guardianDetails?.guardianPhone || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianPhone: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Guardian Email
                                            </label>
                                            <input
                                                type="email"
                                                value={editData.guardianDetails?.guardianEmail || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianEmail: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Education Details Section - RESTRICTED for Staff */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Education Details {!isSuperAdmin && <span className="text-xs font-normal text-gray-500">(Read-only for Staff)</span>}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Institute
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.institutionName || (typeof editData.courseDetails?.selectedCollege === 'object' ? editData.courseDetails.selectedCollege?.name || editData.courseDetails.selectedCollege?.code || '' : '') || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, institutionName: e.target.value }
                                                })}
                                                disabled={!isSuperAdmin}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Course
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.selectedCourse || editData.courseDetails?.courseName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, selectedCourse: e.target.value, courseName: e.target.value }
                                                })}
                                                disabled={!isSuperAdmin}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Stream
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.stream || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, stream: e.target.value }
                                                })}
                                                disabled={!isSuperAdmin}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Campus
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.campus || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, campus: e.target.value }
                                                })}
                                                disabled={!isSuperAdmin}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Selection Modal */}
            {showDocumentSelectionModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Select Documents for {generationType === 'pdf' ? 'PDF' : 'ZIP'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Choose which documents to include in the {generationType === 'pdf' ? 'combined PDF' : 'ZIP file'}
                                </p>
                            </div>
                            <button
                                onClick={() => !generating && setShowDocumentSelectionModal(false)}
                                disabled={generating}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {(() => {
                                const approvedDocs = selectedStudent.documents.filter(doc => doc.status === 'APPROVED');

                                if (approvedDocs.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <svg className="h-12 w-12 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <p>No approved documents available</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {approvedDocs.length} approved document{approvedDocs.length !== 1 ? 's' : ''} available
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={selectAllDocuments}
                                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    onClick={clearDocumentSelection}
                                                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>

                                        {approvedDocs.map((doc, idx) => {
                                            const label = formatDocumentLabel(doc.documentType, doc.fileName);
                                            const docId = doc._id?.toString() || doc.documentType || `doc_${idx}`;
                                            const isSelected = selectedDocumentsForGeneration.includes(docId);

                                            return (
                                                <div
                                                    key={docId}
                                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    onClick={() => toggleDocumentSelection(docId)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleDocumentSelection(docId)}
                                                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {label}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {doc.fileName || doc.documentType}
                                                        </p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            APPROVED
                                                        </span>
                                                    </div>
                                                    {isSelected && (
                                                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => !generating && setShowDocumentSelectionModal(false)}
                                disabled={generating}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmGeneration}
                                disabled={generating || selectedDocumentsForGeneration.length === 0}
                                className={`px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${generationType === 'pdf'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {generating ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    `Generate ${generationType === 'pdf' ? 'PDF' : 'ZIP'} (${selectedDocumentsForGeneration.length})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
