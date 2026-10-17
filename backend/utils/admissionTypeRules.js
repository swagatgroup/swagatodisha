const CollegeCourse = require('../models/CollegeCourse');

// Shared by the staff and agent edit routes.

// Free admission: SC/ST, or General/OBC with a PM Kisan / CM Kisan number, and never on a paid-only course/stream.
// Returns an error message, or null when the application's admission type is allowed.
const checkFreeAdmission = async (application) => {
    if (application.courseDetails?.admissionType !== 'free') return null;
    const category = application.personalDetails?.category;
    if (!['SC', 'ST', 'General', 'OBC'].includes(category)) {
        return `Free admission is not available for category ${category || 'N/A'}`;
    }
    const course = application.courseDetails.selectedCollege && application.courseDetails.selectedCourse
        ? await CollegeCourse.findOne({ college: application.courseDetails.selectedCollege, courseName: application.courseDetails.selectedCourse }).lean()
        : null;
    const stream = course?.streams?.find(st => st.name === application.courseDetails.stream);
    if (course?.isPaidOnly || stream?.isPaidOnly) {
        return 'This course/stream is paid-only and cannot be free';
    }
    if (['General', 'OBC'].includes(category) && !application.personalDetails?.pmKisanNumber && !application.personalDetails?.cmKisanNumber) {
        return 'Enter either PM Kisan Number or CM Kisan Number for Free (Kisan) admission';
    }
    return null;
};

// What decides the fee; compare before/after an edit to know whether to recalculate
const feeKey = (application) => JSON.stringify([
    String(application.courseDetails?.selectedCollege || ''),
    application.courseDetails?.selectedCourse || '',
    application.courseDetails?.admissionType || 'paid'
]);

// Recalculate fees after a course/admission type change; payments already made are kept
const recalculateFees = async (application) => {
    const { calculateTotalFees } = require('../controllers/studentApplicationWorkflowController');
    const fees = await calculateTotalFees(application.courseDetails, application.personalDetails?.category);
    if (!application.financialStatus) application.financialStatus = {};
    application.financialStatus.totalFees = fees;
    application.financialStatus.dueAmount = Math.max(fees - (application.financialStatus.paidAmount || 0), 0);
    application.markModified('financialStatus');
};

module.exports = { checkFreeAdmission, feeKey, recalculateFees };
