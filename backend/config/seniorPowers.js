// Senior staff powers: things only the super admin could do, which the super admin can hand to
// individual staff members one by one. A staff member with at least one power is "senior staff".
// Keep this list in sync with frontend/src/utils/seniorPowers.js.
// Assigning powers, security/performance tools and data-repair routes stay super admin only.
const SENIOR_POWERS = {
    delete_applications: 'Delete student applications (e.g. duplicate entries)',
    migrate_students: 'Bulk migrate selected students (single-student migrate is open to all staff)',
    edit_any_status: 'Edit applications at any status (Approved, Complete)',
    override_status: 'Set any application status, skipping workflow steps',
    mark_complete: 'Approve completion requests (mark a course complete)',
    delete_verified_payments: 'Delete payment slips that are already verified',
    sessions: 'Switch dashboard session and run the session rollover',
    manage_staff: 'Staff tab: add, edit and delete staff (not senior staff or super admin)',
    create_agents: 'Add new agents',
    delete_agents: 'Delete agents',
    website_management: 'Website Management tab and gallery approval',
    activity_logs: 'Recent Activity tab (audit logs)',
    attendance_admin: 'Attendance reports, manual attendance override and Face ID settings',
    chat_moderation: 'Read student chats and block or unblock chat users',
    payment_alerts: 'Recent payments notification bell'
};

const POWER_KEYS = Object.keys(SENIOR_POWERS);

// Super admin has every power; staff only the ones assigned to them.
const hasPower = (user, power) =>
    !!user && (user.role === 'super_admin' ||
        (user.role === 'staff' && Array.isArray(user.seniorPowers) && user.seniorPowers.includes(power)));

module.exports = { SENIOR_POWERS, POWER_KEYS, hasPower };
