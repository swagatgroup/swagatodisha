// Single source of truth for application status order/labels across all dashboards.
// Order: Total, Draft, Rejected, Submitted, Under Review, Approved, Complete
export const APPLICATION_STATUSES = [
    { key: 'all',          label: 'Total',        countKey: 'total',       color: '#1F2937', activeClass: 'bg-gray-800 text-white',  inactiveClass: 'bg-white dark:bg-[#231A2E] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700' },
    { key: 'DRAFT',        label: 'Draft',        countKey: 'draft',       color: '#6B7280', activeClass: 'bg-gray-600 text-white',  inactiveClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
    { key: 'REJECTED',     label: 'Rejected',     countKey: 'rejected',    color: '#EF4444', activeClass: 'bg-red-600 text-white',   inactiveClass: 'bg-red-50 dark:bg-gray-700 text-red-700 dark:text-red-300 border border-red-100 dark:border-gray-600' },
    { key: 'SUBMITTED',    label: 'Submitted',    countKey: 'submitted',   color: '#6366F1', activeClass: 'bg-[#4A1D7A] text-white', inactiveClass: 'bg-indigo-50 dark:bg-gray-700 text-[#351458] dark:text-indigo-300 border border-indigo-100 dark:border-gray-600' },
    { key: 'UNDER_REVIEW', label: 'Under Review', countKey: 'underReview', color: '#EAB308', activeClass: 'bg-yellow-600 text-white', inactiveClass: 'bg-yellow-50 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 border border-yellow-100 dark:border-gray-600' },
    { key: 'APPROVED',     label: 'Approved',     countKey: 'approved',    color: '#14B8A6', activeClass: 'bg-teal-500 text-white',  inactiveClass: 'bg-teal-50 dark:bg-gray-700 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-gray-600' },
    { key: 'COMPLETE',     label: 'Complete',     countKey: 'complete',    color: '#22C55E', activeClass: 'bg-green-600 text-white', inactiveClass: 'bg-green-50 dark:bg-gray-700 text-green-800 dark:text-green-200 border border-green-100 dark:border-gray-600' },
];

// Statuses only (no "Total"), for dropdown options and chart slices
export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUSES.filter(s => s.key !== 'all');

// Chart slices built from a counts object ({ draft, rejected, ... })
export const buildStatusChartData = (counts = {}) =>
    APPLICATION_STATUS_OPTIONS.map(s => ({
        label: s.label,
        value: counts[s.countKey] || 0,
        color: s.color,
        filterKey: s.key,
    }));

// Mirrors backend/utils/applicationEditLock.js: students and agents may edit only before review
// starts; staff also while Under Review (until approved); super admin may edit at any status.
export const EDITABLE_STATUSES = ['DRAFT', 'REJECTED', 'SUBMITTED'];
export const canEditApplication = (role, status) =>
    role === 'super_admin' || EDITABLE_STATUSES.includes(status) || (role === 'staff' && status === 'UNDER_REVIEW');

// Only six application statuses are ever shown: Draft, Rejected, Submitted, Under Review, Approved, Complete.
// Legacy/internal values are shown as the status they belong to.
const STATUS_ALIASES = {
    PENDING: 'SUBMITTED',
    IN_PROGRESS: 'UNDER_REVIEW',
    COMPLETION_REQUESTED: 'APPROVED',
    COMPLETED: 'COMPLETE',
};

export const normalizeApplicationStatus = (status) => {
    const key = (status || '').toString().toUpperCase().trim();
    return STATUS_ALIASES[key] || key || 'DRAFT';
};

export const getApplicationStatusLabel = (status) => {
    const key = normalizeApplicationStatus(status);
    const match = APPLICATION_STATUS_OPTIONS.find(o => o.key === key);
    return match ? match.label : key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ');
};
