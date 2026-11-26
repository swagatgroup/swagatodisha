// Senior staff powers. Mirrors backend/config/seniorPowers.js (the backend enforces them; this only decides what to show).
// The super admin has every power; a staff member with at least one power is "senior staff".
export const SENIOR_POWERS = [
    { key: 'delete_applications', label: 'Delete applications', description: 'Delete student applications, e.g. duplicate entries' },
    { key: 'migrate_students', label: 'Bulk migrate', description: 'Migrate many selected students at once' },
    { key: 'edit_any_status', label: 'Edit at any status', description: 'Edit applications even after they are Approved or Complete' },
    { key: 'override_status', label: 'Override status', description: 'Set any application status, skipping workflow steps' },
    { key: 'mark_complete', label: 'Mark course complete', description: 'Approve completion requests' },
    { key: 'delete_verified_payments', label: 'Delete verified payments', description: 'Delete payment slips that are already verified' },
    { key: 'sessions', label: 'Sessions', description: 'Switch the dashboard session and run the session rollover' },
    { key: 'manage_staff', label: 'Manage staff', description: 'Staff tab: add, edit and delete staff (not senior staff or super admin)' },
    { key: 'create_agents', label: 'Add agents', description: 'Create new agent accounts' },
    { key: 'delete_agents', label: 'Delete agents', description: 'Delete agent accounts' },
    { key: 'website_management', label: 'Website management', description: 'Website Management tab and gallery approval' },
    { key: 'activity_logs', label: 'Activity logs', description: 'Recent Activity tab (audit logs)' },
    { key: 'attendance_admin', label: 'Attendance admin', description: 'Attendance reports, manual override and Face ID settings' },
    { key: 'chat_moderation', label: 'Chat moderation', description: 'Read student chats and block or unblock chat users' },
    { key: 'payment_alerts', label: 'Payment alerts', description: 'Recent payments notification bell' },
];

export const hasPower = (user, power) =>
    !!user && (user.role === 'super_admin' ||
        (user.role === 'staff' && Array.isArray(user.seniorPowers) && user.seniorPowers.includes(power)));

export const isSeniorStaff = (user) =>
    user?.role === 'staff' && Array.isArray(user.seniorPowers) && user.seniorPowers.length > 0;
