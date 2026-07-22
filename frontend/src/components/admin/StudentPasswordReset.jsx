import React, { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import api from '../../utils/api';
import {
    showLoading,
    closeLoading,
    showError,
    showSuccess,
} from '../../utils/sweetAlert';
import Swal from 'sweetalert2';

const StudentPasswordReset = () => {
    const { selectedSession } = useSession();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [filterType, setFilterType] = useState('all');

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (currentPage !== 1 && searchTerm !== '') {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    useEffect(() => {
        if (!selectedSession) return;
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearchTerm, selectedSession, filterType]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            
            if (!selectedSession) {
                setStudents([]);
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                session: selectedSession,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(filterType !== 'all' && { referralType: filterType }),
                listType: 'main'
            });

            const response = await api.get(`/api/admin/students?${params}`);

            if (response.data.success) {
                setStudents(response.data.data.students || []);
                const pagination = response.data.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
            } else {
                showError(response.data.message || 'Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showError('Failed to fetch students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordClick = (student) => {
        Swal.fire({
            title: `<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-2">Reset Password</h3>`,
            html: `
                <div class="text-left mt-2 mb-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Please enter the new password for <span class="font-semibold text-purple-600 dark:text-purple-400">${student.personalDetails?.fullName || 'Student'}</span>'s account.</p>
                </div>
                <div class="relative w-full mx-auto group">
                    <input type="text" id="new-password-input" 
                        class="w-full px-4 py-3 pr-12 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" 
                        placeholder="New Password (min. 6 chars)">
                    <button type="button" id="toggle-password" 
                        class="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors duration-200 focus:outline-none">
                        <svg id="eye-icon-open" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg id="eye-icon-closed" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.52-3.414M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                        </svg>
                    </button>
                </div>
            `,
            icon: 'info',
            iconColor: '#8b5cf6', // purple-500
            showCancelButton: true,
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl shadow-xl dark:bg-gray-800 dark:border-gray-700',
                title: 'p-0 text-left',
                htmlContainer: 'text-left m-0',
                confirmButton: 'px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm ml-2',
                cancelButton: 'px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium rounded-xl transition-colors mr-2',
                actions: 'mt-6 w-full flex justify-end gap-2'
            },
            confirmButtonText: 'Reset Password',
            didOpen: () => {
                const input = document.getElementById('new-password-input');
                const toggleBtn = document.getElementById('toggle-password');
                const eyeOpen = document.getElementById('eye-icon-open');
                const eyeClosed = document.getElementById('eye-icon-closed');

                setTimeout(() => {
                    if(input) {
                        input.type = "password";
                        eyeOpen.classList.add('hidden');
                        eyeClosed.classList.remove('hidden');
                    }
                }, 1500);

                toggleBtn.addEventListener('click', () => {
                    if (input.type === 'password') {
                        input.type = 'text';
                        eyeOpen.classList.remove('hidden');
                        eyeClosed.classList.add('hidden');
                    } else {
                        input.type = 'password';
                        eyeOpen.classList.add('hidden');
                        eyeClosed.classList.remove('hidden');
                    }
                });
            },
            preConfirm: () => {
                const newPassword = document.getElementById('new-password-input').value;
                if (!newPassword || newPassword.length < 6) {
                    Swal.showValidationMessage('Password must be at least 6 characters long');
                    return false;
                }
                return newPassword;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    showLoading('Resetting password...');
                    const targetUserId = student.user?._id || student.user || student.userId || student._id;
                    const studentEmail = student.contactDetails?.email || student.personalDetails?.email || student.email;

                    const response = await api.post('/api/admin/reset-password', {
                        userId: targetUserId,
                        studentId: student._id,
                        email: studentEmail,
                        userType: 'student',
                        newPassword: result.value
                    });

                    closeLoading();
                    
                    if (response.data.success) {
                        showSuccess('Password reset successfully!');
                    } else {
                        showError(response.data.message || 'Failed to reset password');
                    }
                } catch (error) {
                    closeLoading();
                    console.error('Error resetting password:', error);
                    showError(error.response?.data?.message || 'Error occurred while resetting password');
                }
            }
        });
    };

    const getRegistrationType = (student) => {
        if (student.registeredBy) {
            return student.registeredBy === 'direct' ? 'Direct' : 'Referral';
        }
        return 'Direct';
    };

    const getSubmitterName = (student) => {
        if (student.agentDetails?.name) {
            return student.agentDetails.name;
        }
        if (student.staffDetails?.name) {
            return student.staffDetails.name;
        }
        return 'Self';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Student Password Reset
                </h3>
            </div>

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="w-full sm:w-1/3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                                placeholder="Search by name, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-1/4">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="all">All Registrations</option>
                            <option value="direct">Direct Students</option>
                            <option value="agent">Referral (Agent)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Student Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Registration Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Submitted By
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading students...</p>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                        {student.personalDetails?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {student.personalDetails?.fullName || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {student.contactDetails?.email || student.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                getRegistrationType(student) === 'Direct' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                                {getRegistrationType(student)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            {getSubmitterName(student)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleResetPasswordClick(student)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                                    <span className="font-medium">{totalItems}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {/* Page numbers would go here, simplified for now */}
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPasswordReset;
