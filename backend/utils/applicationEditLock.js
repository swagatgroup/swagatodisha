// Who may edit application data at which status.
// Students and agents: only before review starts (Draft, Rejected, Submitted).
// Staff: also while Under Review, i.e. until the application is approved.
// Super admin (and senior staff with the edit_any_status power, passed as canEditAny): any status.
// Status changes, financial updates and document reviews use their own endpoints and are not covered here.
const EDITABLE_STATUSES = ['DRAFT', 'REJECTED', 'SUBMITTED'];

const canEditApplication = (role, status, canEditAny = false) =>
    role === 'super_admin' || canEditAny || EDITABLE_STATUSES.includes(status) || (role === 'staff' && status === 'UNDER_REVIEW');

const editLockedMessage = (status) =>
    `Cannot edit application when status is ${status}. Applications can only be edited while status is Draft, Rejected or Submitted.`;

module.exports = { EDITABLE_STATUSES, canEditApplication, editLockedMessage };
