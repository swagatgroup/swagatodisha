const mongoose = require('mongoose');

// Statuses that don't hold a seat in a course batch
const SEAT_FREE_STATUSES = ['DRAFT', 'REJECTED', 'CANCELLED'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Batch = calendar year of registration, the same rule the session filter uses.
// registrationDate isn't in the schema (older records have it), so read it with get().
const batchYear = (app) => {
    const registrationDate = app.get('personalDetails.registrationDate');
    const date = registrationDate instanceof Date ? registrationDate : (app.createdAt || new Date());
    return date.getUTCFullYear();
};

const batchDateFilter = (year) => {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return {
        $or: [
            { 'personalDetails.registrationDate': { $gte: start, $lte: end } },
            { 'personalDetails.registrationDate': { $in: [null] }, createdAt: { $gte: start, $lte: end } }
        ]
    };
};

// Returns an error message when the application's course has LIMITED seats and its batch is full, otherwise null.
// Native collection queries: course names are stored in mixed case and selectedCollege is an id string or ObjectId.
const checkSeatAvailability = async (app) => {
    const collegeId = app.courseDetails?.selectedCollege && String(app.courseDetails.selectedCollege);
    const courseName = app.courseDetails?.selectedCourse?.trim();
    if (!collegeId || !courseName || !mongoose.isValidObjectId(collegeId)) return null;

    const nameMatch = { $regex: `^${escapeRegex(courseName)}$`, $options: 'i' };
    const course = await require('../models/CollegeCourse').collection.findOne({
        college: new mongoose.Types.ObjectId(collegeId),
        courseName: nameMatch
    });
    if (!course || course.seatType !== 'LIMITED' || !course.seatLimit) return null;

    const batch = batchYear(app);
    const used = await mongoose.model('StudentApplication').collection.countDocuments({
        _id: { $ne: app._id },
        'courseDetails.selectedCollege': { $in: [collegeId, new mongoose.Types.ObjectId(collegeId)] },
        'courseDetails.selectedCourse': nameMatch,
        status: { $nin: SEAT_FREE_STATUSES },
        'academic.status': { $ne: 'DISCONTINUED' },
        ...batchDateFilter(batch)
    });
    if (used >= course.seatLimit) {
        return `All ${course.seatLimit} seats for ${course.courseName} (${batch} batch) are full`;
    }
    return null;
};

module.exports = { SEAT_FREE_STATUSES, batchYear, checkSeatAvailability };
