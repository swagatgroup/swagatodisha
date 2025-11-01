import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../../contexts/SessionContext';
import api from '../../../utils/api';

const RecentStudentsTable = ({ onStudentUpdate, initialFilter = 'all' }) => {
    const { selectedSession } = useSession();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterSubmitterRole, setFilterSubmitterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filters, setFilters] = useState({
        statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
        courses: [],
        submitters: []
    });
    const [showDocumentSelectionModal, setShowDocumentSelectionModal] = useState(false);
    const [selectedDocumentsForGeneration, setSelectedDocumentsForGeneration] = useState([]);
    const [generationType, setGenerationType] = useState(null); // 'pdf' or 'zip'
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Reset to page 1 when session changes
        setCurrentPage(1);
    }, [selectedSession]);

    useEffect(() => {
        // Update filter when initialFilter prop changes
        if (initialFilter !== filterStatus) {
            setFilterStatus(initialFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFilter]);

    useEffect(() => {
        console.log('🔄 RecentStudentsTable: Fetching students for session:', selectedSession);
        fetchRecentStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedSession, searchTerm, filterStatus, filterCourse, filterSubmitterRole]);

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

            const response = await api.post(endpoint, {
                selectedDocuments: selectedDocumentsForGeneration
            });

            if (response.data?.success) {
                showSuccess(`${generationType.toUpperCase()} generated successfully!`);

                // Download the file using fetch with authentication to prevent session loss
                const fileUrl = response.data.data.url || response.data.data.pdfUrl || response.data.data.zipUrl;
                if (fileUrl) {
                    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;

                    try {
                        // Fetch with credentials to include auth token
                        const fileResponse = await fetch(fullUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                            credentials: 'include'
                        });

                        if (!fileResponse.ok) {
                            throw new Error(`Download failed: ${fileResponse.status}`);
                        }

                        // Create blob and download
                        const blob = await fileResponse.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = fullUrl.split('/').pop() || `file.${generationType === 'pdf' ? 'pdf' : 'zip'}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    } catch (downloadError) {
                        console.error('Download error:', downloadError);
                        showError('File generated but download failed. You can try accessing it directly.');
                        // Fallback: open in new tab
                        window.open(fullUrl, '_blank');
                    }
                }

                setShowDocumentSelectionModal(false);
                setSelectedDocumentsForGeneration([]);
                setGenerationType(null);
            }
        } catch (error) {
            console.error(`Error generating ${generationType}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to generate ${generationType.toUpperCase()}`;
            showError(errorMessage);
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

    const fetchRecentStudents = async () => {
        try {
            setLoading(true);
            // Session is REQUIRED - always include it
            if (!selectedSession) {
                console.error('❌ No session selected!');
                setStudents([]);
                setTotalItems(0);
                setLoading(false);
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                session: selectedSession, // REQUIRED - always pass session
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterCourse !== 'all' && { course: filterCourse }),
                ...(filterSubmitterRole !== 'all' && { submitterRole: filterSubmitterRole })
            });

            const response = await api.get(`/api/admin/students?${params}`);

            if (response.data.success) {
                const pagination = response.data.data.pagination || {};
                setStudents(response.data.data.students || []);
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setFilters(response.data.data.filters || {
                    statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
                    courses: [],
                    categories: [],
                    submitters: []
                });
            }
        } catch (error) {
            console.error('Error fetching recent students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 dark:text-green-400';
            case 'SUBMITTED': return 'text-blue-600 dark:text-blue-400';
            case 'UNDER_REVIEW': return 'text-yellow-600 dark:text-yellow-400';
            case 'REJECTED': return 'text-red-600 dark:text-red-400';
            case 'DRAFT': return 'text-gray-600 dark:text-gray-400';
            case 'CANCELLED': return 'text-gray-600 dark:text-gray-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with count */}
            <div className="flex justify-between items-center">
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

            {/* Filters - EXACT same as StudentManagement */}
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
                            'REJECTED': 'Rejected'
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

            {/* Students Table - EXACT same structure as StudentManagement */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
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
                                <td colSpan="9" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No students found
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            {(searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all')
                                                ? 'Try adjusting your search criteria or filters.'
                                                : selectedSession
                                                    ? `No admissions found for the ${selectedSession} academic session.`
                                                    : 'No student applications in this session yet.'}
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(student.status)}`}>
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
                                                        if (onStudentUpdate) {
                                                            onStudentUpdate(student);
                                                        }
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Details"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Edit"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                    title="Contact"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

            {/* Pagination - EXACT same as StudentManagement */}
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

            {/* Student Details Modal */}
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
                                                {selectedStudent.personalDetails?.dateOfBirth ? new Date(selectedStudent.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Aadhar Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.aadharNumber || 'N/A'}</p>
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
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

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
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Selected Course</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.course || 'N/A'}</p>
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
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Phone</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianPhone || 'N/A'}</p>
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
                                                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
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

                                {/* Application Tracking */}
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
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Selection Modal */}
            <AnimatePresence>
                {showDocumentSelectionModal && selectedStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !generating && setShowDocumentSelectionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecentStudentsTable;

