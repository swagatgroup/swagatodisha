// Who may edit application data at which status.
// Students, agents and staff: only before review starts (Draft, Rejected, Submitted).
// Super admin: any status.
// Status changes, financial updates and document reviews use their own endpoints and are not covered here.
const EDITABLE_STATUSES = ['DRAFT', 'REJECTED', 'SUBMITTED'];

const canEditApplication = (role, status) =>
    role === 'super_admin' || EDITABLE_STATUSES.includes(status);

const editLockedMessage = (status) =>
    `Cannot edit application when status is ${status}. Applications can only be edited while status is Draft, Rejected or Submitted.`;

module.exports = { EDITABLE_STATUSES, canEditApplication, editLockedMessage };
