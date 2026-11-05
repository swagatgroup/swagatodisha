const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const StudentApplication = require('../models/StudentApplication');

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const VERBS = { POST: 'Added', PUT: 'Updated', PATCH: 'Updated', DELETE: 'Removed' };
const STUDENT_PATH = /^\/api\/(?:admin\/students|student-application)\/([^/]+)/;

// Requests that change nothing worth showing, or that write their own audit entries
const IGNORED_PATHS = [
    /^\/api\/(?:auth|admin-auth)\b/,
    /^\/api\/audit-logs\b/,
    /^\/api\/(?:analytics|performance|security|pdf)\b/,
    /^\/api\/notifications\/.*read/,
    /\/(?:save-draft|stage|workflow-step)$/,
    /\/generate[^/]*$/,
    /^\/api\/admin\/students\/bulk-status$/,
];

// First match wins. `summary` is fixed text or a function; `noun` builds "<verb> <noun>".
const RULES = [
    { path: /^\/api\/admin\/students\/bulk$/, section: 'Students', summary: (req) => `Deleted ${req.body?.studentIds?.length || 'several'} students` },
    { path: /^\/api\/admin\/students\/session-rollover/, section: 'Students', summary: 'Ran the session rollover' },
    { path: /^\/api\/admin\/students\/[^/]+\/financial$/, section: 'Payments', summary: 'Updated payment details' },
    { path: /^\/api\/admin\/students\/[^/]+\/status$/, section: 'Students', summary: (req) => (/^[A-Z_]+$/.test(req.body?.status || '') ? `Changed application status to ${req.body.status}` : 'Changed application status') },
    { path: /^\/api\/admin\/students\/[^/]+\/academic-status$/, section: 'Students', summary: 'Changed academic status' },
    { path: /^\/api\/admin\/students\/[^/]+\/admission-type$/, section: 'Students', summary: 'Changed admission type' },
    { path: /^\/api\/admin\/students\/[^/]+\/migrate$/, section: 'Students', summary: 'Moved student to another list' },
    { path: /^\/api\/admin\/students\/[^/]+\/bank-verification$/, section: 'Payments', summary: 'Updated bank verification' },
    { path: /^\/api\/admin\/applications\/[^/]+\/course-fee$/, section: 'Payments', summary: 'Updated course fee' },
    { path: /^\/api\/admin\/students\/[^/]+$/, section: 'Students', summary: (req) => (req.method === 'DELETE' ? 'Deleted student' : 'Edited student details') },
    { path: /^\/api\/student-application\/[^/]+\/upload-installment-receipt$/, section: 'Payments', summary: 'Uploaded a payment receipt' },
    { path: /^\/api\/student-application\/[^/]+\/submit$/, section: 'Students', summary: 'Submitted an application' },
    { path: /^\/api\/student-application\/[^/]+\/approve$/, section: 'Students', summary: 'Approved an application' },
    { path: /^\/api\/student-application\/[^/]+\/reject$/, section: 'Students', summary: 'Rejected an application' },
    { path: /^\/api\/student-application\/[^/]+\/verify$/, section: 'Students', summary: 'Reviewed application documents' },
    { path: /^\/api\/(?:student-application|workflow|verification)\b/, section: 'Students', noun: 'application details' },
    { path: /^\/api\/(?:students\/)?payments\b/, section: 'Payments', noun: 'a payment' },
    { path: /^\/api\/(?:admin\/)?sliders\b/, section: 'Website', noun: 'a homepage poster' },
    { path: /^\/api\/(?:admin\/)?quick-access\b/, section: 'Website', noun: 'a time table, notification or result' },
    { path: /^\/api\/notifications\b/, section: 'Website', noun: 'a notification' },
    { path: /^\/api\/gallery\b/, section: 'Website', noun: 'a gallery item' },
    { path: /^\/api\/(?:website-content|cms|public-settings)\b/, section: 'Website', noun: 'website content' },
    { path: /^\/api\/(?:admin\/)?colleges\b/, section: 'Institutions', noun: 'a college' },
    { path: /^\/api\/campuses\b/, section: 'Institutions', noun: 'a campus' },
    { path: /^\/api\/courses\b/, section: 'Institutions', noun: 'a course' },
    { path: /^\/api\/(?:admin\/)?agents\b/, section: 'Agents', noun: 'an agent record' },
    { path: /^\/api\/(?:admin\/)?staff\b/, section: 'Staff', noun: 'a staff record' },
    { path: /^\/api\/referral\b/, section: 'Referrals', noun: 'a referral' },
    { path: /\/upload[^/]*$/, section: 'Documents', summary: 'Uploaded a document' },
    { path: /^\/api\/(?:documents|document-types|files)\b/, section: 'Documents', noun: 'a document' },
    { path: /^\/api\/students\b/, section: 'Students', noun: 'a student record' },
    { path: /^\/api\/admin\b/, section: 'Administration', noun: 'an admin setting' },
];

const describe = (req, path) => {
    const rule = RULES.find((candidate) => candidate.path.test(path));
    if (!rule) return { section: 'Other', summary: `${VERBS[req.method]} a record` };
    if (typeof rule.summary === 'function') return { section: rule.section, summary: rule.summary(req) };
    return { section: rule.section, summary: rule.summary || `${VERBS[req.method]} ${rule.noun}` };
};

const findStudent = async (path) => {
    const id = path.match(STUDENT_PATH)?.[1];
    if (!id || !mongoose.isValidObjectId(id)) return null;
    return StudentApplication.findById(id).select('applicationId personalDetails.fullName').lean();
};

const displayName = (user) =>
    user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown';

// Records every successful change made by a signed-in user. Stores what happened and who did it,
// never the request body, so passwords, Aadhaar numbers and other personal details stay out of the log.
const activityLogger = async (req, res, next) => {
    if (!MUTATING_METHODS.has(req.method)) return next();
    const path = req.originalUrl.split('?')[0];
    if (IGNORED_PATHS.some((pattern) => pattern.test(path))) return next();

    // A deleted student can no longer be looked up afterwards
    const studentBeforeDelete = req.method === 'DELETE' ? await findStudent(path).catch(() => null) : null;

    res.on('finish', async () => {
        if (!req.user || res.statusCode < 200 || res.statusCode >= 300) return;
        try {
            const student = studentBeforeDelete || await findStudent(path);
            const { section, summary } = describe(req, path);
            await AuditLog.create({
                action: 'ACTIVITY',
                resourceType: student ? 'StudentApplication' : 'Other',
                targetId: student?._id,
                performedBy: { userId: req.user._id, email: req.user.email, role: req.user.role, fullName: displayName(req.user) },
                requestDetails: { method: req.method, url: path, ip: req.ip, userAgent: req.get('User-Agent') },
                result: { success: true, statusCode: res.statusCode },
                metadata: {
                    section,
                    summary,
                    target: student ? [student.personalDetails?.fullName, student.applicationId].filter(Boolean).join(' · ') : undefined,
                },
            });
        } catch (error) {
            console.error('Failed to record activity:', error.message);
        }
    });

    return next();
};

module.exports = activityLogger;
