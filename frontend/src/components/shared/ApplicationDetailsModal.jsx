import React, { useEffect, useState } from 'react';
import StaffDocumentUploader from './StaffDocumentUploader';
import { canEditApplication } from '../../utils/applicationStatuses';

// One "View Application" used by all four dashboards. Content and layout are identical for every
// role; roles differ only through `role` and the optional action slots that staff/super admin pass:
//   courseExtras, financialHeaderActions, financialForm, bankActions, documentActions, footerActions
// Students and agents can upload/replace documents and edit only until the application reaches
// Under Review (same rule as backend/utils/applicationEditLock.js). Staff can always add documents.

// Returns the application with `doc` added, replacing any earlier document of the same type
export const mergeUploadedDocument = (app, doc) => ({
    ...app,
    documents: [
        ...(Array.isArray(app.documents) ? app.documents : []).filter(d => d.documentType !== doc.documentType),
        { ...doc, uploadedAt: new Date().toISOString() }
    ]
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-[#60A5FA]';
        case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-[#1A1212]/20 dark:text-gray-300';
        case 'COMPLETE': return 'bg-[#F0E6FA] text-purple-800 dark:bg-[#231A2E]/20 dark:text-[#9B6FCC]';
        default: return 'bg-gray-100 text-gray-800 dark:bg-[#1A1212]/20 dark:text-gray-300';
    }
};

const Field = ({ label, value, className = '' }) => (
    <div className={className}>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-300">{label}</label>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || 'N/A'}</p>
    </div>
);

const Section = ({ icon, title, children, headerRight = null }) => (
    <div className="bg-gray-50 dark:bg-[#1A1212] rounded-lg p-4">
        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
            <span className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {title}
            </span>
            {headerRight}
        </h4>
        {children}
    </div>
);

const ICONS = {
    person: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    pin: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    group: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const AddressBlock = ({ title, address = {}, fallback = {} }) => (
    <div>
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2" label="Street Address" value={address.street || fallback.street} />
            <Field label="City" value={address.city || fallback.city} />
            <Field label="State" value={address.state || fallback.state} />
            <Field label="Pincode" value={address.pincode || fallback.pincode} />
            <Field label="District" value={fallback.district || address.district} />
            <Field label="Country" value={address.country || 'India'} />
        </div>
    </div>
);

const ApplicationDetailsModal = ({
    student,
    role,
    onClose,
    colleges = [],
    onDocumentUploaded,
    onEdit,
    courseExtras = null,
    financialHeaderActions = null,
    financialForm = null,
    bankActions = null,
    documentActions = null,
    footerActions = null,
}) => {
    const [app, setApp] = useState(student);
    useEffect(() => { setApp(student); }, [student]);

    if (!app) return null;

    const isStaffSide = role === 'staff' || role === 'super_admin';
    const canEdit = canEditApplication(role, app.status);
    // Staff keep the ability to add missing documents during review
    const canChangeDocuments = canEdit || role === 'staff';
    const documents = Array.isArray(app.documents) ? app.documents : [];

    const handleUploaded = (doc) => {
        setApp(prev => mergeUploadedDocument(prev, doc));
        onDocumentUploaded?.(doc);
    };

    const institutionName = (() => {
        const resolve = (v) => {
            if (typeof v === 'object' && v !== null) return v.name || v.institutionName || 'Swagat Group of Institutions';
            if (/^[0-9a-fA-F]{24}$/.test(v)) {
                const matched = colleges.find(c => c._id === v);
                if (matched) return matched.name;
            }
            return v;
        };
        const inst = app.courseDetails?.institutionName || app.institutionName;
        if (inst) return resolve(inst);
        const college = app.courseDetails?.selectedCollege;
        if (college) return resolve(college);
        return 'Swagat Group of Institutions';
    })();

    const contact = app.contactDetails || {};
    const fin = app.financialStatus || {};
    const bank = app.user?.financialDetails;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#231A2E] rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Full Application Details</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                                Application ID: {app.applicationId} | Status: <span className={`px-2 py-0.5 rounded font-semibold ${getStatusColor(app.status)}`}>{app.status}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Edit lock notice for students and agents */}
                    {!isStaffSide && !canEdit && (
                        <div className="mb-6 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-200">
                            This application is {app.status === 'UNDER_REVIEW' ? 'under review' : app.status.toLowerCase().replace('_', ' ')}. It can no longer be edited and documents can no longer be changed.
                        </div>
                    )}

                    <div className="space-y-6">
                        <Section icon={ICONS.person} title="Personal Information">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Full Name" value={app.fullName || app.personalDetails?.fullName} />
                                <Field label="Father's Name" value={app.personalDetails?.fathersName} />
                                <Field label="Mother's Name" value={app.personalDetails?.mothersName} />
                                <Field label="Gender" value={app.personalDetails?.gender} />
                                <Field label="Date of Birth" value={app.personalDetails?.dateOfBirth ? formatDate(app.personalDetails.dateOfBirth) : 'N/A'} />
                                <Field label="Aadhar Number" value={app.personalDetails?.aadharNumber || app.aadharNumber} />
                                <Field label="Category" value={app.personalDetails?.category || app.personalDetails?.status || app.category} />
                            </div>
                        </Section>

                        <Section icon={ICONS.mail} title="Contact Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Phone Number" value={app.phone || contact.primaryPhone} />
                                <Field label="Email" value={app.email || contact.email} />
                                <Field label="WhatsApp Number" value={contact.whatsappNumber} />
                            </div>
                        </Section>

                        {(contact.permanentAddress || contact.currentAddress || contact.address) && (
                            <Section icon={ICONS.pin} title="Address Information">
                                <div className="space-y-4">
                                    {(contact.permanentAddress || (contact.address && contact.city)) && (
                                        <AddressBlock
                                            title="Permanent Address"
                                            address={contact.permanentAddress || {}}
                                            fallback={{ street: contact.address, city: contact.city, state: contact.state, pincode: contact.pincode, district: contact.district }}
                                        />
                                    )}
                                    {contact.currentAddress?.street && (
                                        <AddressBlock title="Current Address" address={contact.currentAddress} />
                                    )}
                                </div>
                            </Section>
                        )}

                        <Section icon={ICONS.book} title="Course Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-300">Admission Type</label>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${app.courseDetails?.admissionType === 'free' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {app.courseDetails?.admissionType === 'free' ? 'Free' : 'Paid'}
                                        </span>
                                        {courseExtras}
                                    </div>
                                </div>
                                <Field label="Institution Name" value={institutionName} />
                                <Field label="Course Name" value={app.courseDetails?.selectedCourse || app.course} />
                                <Field label="Stream" value={app.courseDetails?.stream} />
                                <Field label="Campus" value={app.courseDetails?.campus?.name || (typeof app.courseDetails?.campus === 'string' ? app.courseDetails.campus : '')} />
                            </div>
                        </Section>

                        <Section icon={ICONS.group} title="Guardian Information">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Guardian Name" value={app.guardianDetails?.guardianName || app.guardianName} />
                                <Field label="Guardian Phone" value={app.guardianDetails?.guardianPhone || app.guardianPhone} />
                                <Field label="Relation" value={app.guardianDetails?.relationship || app.guardianDetails?.guardianRelation} />
                                <Field label="Guardian Email" value={app.guardianDetails?.guardianEmail} />
                            </div>
                        </Section>

                        {/* Financial Information: read-only unless staff/super admin pass actions */}
                        <Section icon={ICONS.money} title="Financial Information" headerRight={financialHeaderActions}>
                            {financialForm}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-[#231A2E] p-3 rounded border border-gray-200 dark:border-gray-700">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-300">Total Course Fee</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{fin.totalFees || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-[#231A2E] p-3 rounded border border-gray-200 dark:border-gray-700">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-300">Total Paid</label>
                                    <p className="text-lg font-bold text-green-600">₹{fin.paidAmount || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-[#231A2E] p-3 rounded border border-gray-200 dark:border-gray-700">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-300">Due Amount</label>
                                    <p className="text-lg font-bold text-red-600">₹{fin.dueAmount || 0}</p>
                                </div>
                            </div>
                        </Section>

                        {/* Documents (same for every role; upload/replace depends on the edit lock) */}
                        <Section icon={ICONS.doc} title={`Uploaded Documents (${documents.length})`}>
                            {documents.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    No documents are saved on this application.
                                    {canChangeDocuments && ' Upload documents below; they are added as pending for review.'}
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {documents.map((doc, index) => (
                                        <div key={doc.documentType || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-[#231A2E]">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{doc.documentType || doc.fileName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                                        Status: <span className={`font-semibold ${doc.status === 'APPROVED' ? 'text-green-600' : doc.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                            {doc.status || 'PENDING'}
                                                        </span>
                                                    </p>
                                                    {doc.uploadedAt && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-300">Uploaded: {formatDate(doc.uploadedAt)}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {canChangeDocuments && doc.documentType && (
                                                        <StaffDocumentUploader applicationId={app._id} replaceType={doc.documentType} onUploaded={handleUploaded} />
                                                    )}
                                                    {doc.filePath && (
                                                        <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-[#387B95] hover:text-blue-800 dark:text-[#60A5FA]" title="View document">
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {canChangeDocuments && (
                                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">Upload Documents</p>
                                    <StaffDocumentUploader
                                        applicationId={app._id}
                                        existingTypes={documents.map(d => d.documentType)}
                                        onUploaded={handleUploaded}
                                    />
                                </div>
                            )}
                            {documentActions}
                        </Section>

                        {/* Bank Information (student's own payout details); agents don't see it */}
                        {role !== 'agent' && bank?.bankAccountNumber && (
                            <div className="bg-gray-50 dark:bg-[#1A1212] rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center">
                                        <i className="fa-solid fa-building-columns text-[#387B95] mr-2"></i>
                                        Bank Information (For Payouts)
                                    </h4>
                                    <div>
                                        {bank.verificationStatus === 'VERIFIED' && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Verified</span>
                                        )}
                                        {bank.verificationStatus === 'PENDING' && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Pending</span>
                                        )}
                                        {bank.verificationStatus === 'REJECTED' && (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">Rejected</span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Field label="Account Holder Name" value={bank.accountHolderName} />
                                    <Field label="Bank Name" value={bank.bankName} />
                                    <Field label="Account Number" value={bank.bankAccountNumber} />
                                    <Field label="IFSC Code" value={bank.ifscCode} />
                                </div>
                                {bank.verificationStatus === 'REJECTED' && bank.verificationNotes && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                                        <p className="text-sm text-red-600 dark:text-red-400"><span className="font-semibold">Rejection Reason:</span> {bank.verificationNotes}</p>
                                    </div>
                                )}
                                {bankActions}
                            </div>
                        )}

                        <Section icon={ICONS.info} title="Application Tracking">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Submitted By" value={app.referredBy || 'Direct Student'} />
                                <Field label="Approved By" value={app.approvedBy || 'Pending'} />
                                <Field label="Referral Code" value={app.referralCode} />
                                <Field label="Submitted Date" value={formatDate(app.submittedAt || app.createdAt)} />
                                {(app.reviewInfo?.reviewedAt || app.reviewStatus?.reviewedAt) && app.status === 'APPROVED' && (
                                    <Field label="Approved Date" value={formatDate(app.reviewInfo?.reviewedAt || app.reviewStatus?.reviewedAt)} />
                                )}
                                <Field label="Current Stage" value={['APPROVED', 'REJECTED'].includes(app.status) ? app.status : (app.currentStage || app.status)} />
                            </div>
                        </Section>

                        {app.status === 'REJECTED' && app.reviewInfo && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h4 className="font-semibold text-lg text-red-800 dark:text-red-200 mb-4 flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.alert} />
                                    </svg>
                                    Rejection Details
                                </h4>
                                <div className="space-y-3">
                                    {app.reviewInfo.rejectionReason && (
                                        <div>
                                            <label className="text-xs font-medium text-red-700 dark:text-red-300">Reason</label>
                                            <p className="text-sm text-red-900 dark:text-red-100">{app.reviewInfo.rejectionReason}</p>
                                        </div>
                                    )}
                                    {app.reviewInfo.rejectionMessage && (
                                        <div>
                                            <label className="text-xs font-medium text-red-700 dark:text-red-300">Message</label>
                                            <p className="text-sm text-red-900 dark:text-red-100">{app.reviewInfo.rejectionMessage}</p>
                                        </div>
                                    )}
                                    {app.reviewInfo.rejectionDetails?.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-red-700 dark:text-red-300">Specific Issues</label>
                                            <ul className="mt-2 space-y-2">
                                                {app.reviewInfo.rejectionDetails.map((detail, idx) => (
                                                    <li key={idx} className="text-sm text-red-900 dark:text-red-100 bg-white dark:bg-[#231A2E] rounded p-2">
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

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-between items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            {footerActions}
                            {onEdit && canEdit && (
                                <button
                                    onClick={() => onEdit(app)}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#4A1D7A] hover:bg-[#351458] rounded-md shadow-sm"
                                >
                                    Edit Application
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;
