import React from 'react';

// Admission Type filter (ALL / PAID / FREE) shared by every student table.
// The value is sent to the backend as `admissionType`; records with no admission type only show under ALL.
// allValue: what the page uses for "no filter" ('all' in StudentManagement, '' in AgentStudentsTab)
const AdmissionTypeFilter = ({ value, onChange, allValue = 'all', className = '' }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
    >
        <option value={allValue}>All Admission Types</option>
        <option value="paid">Paid</option>
        <option value="free">Free</option>
    </select>
);

export default AdmissionTypeFilter;
