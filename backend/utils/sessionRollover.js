const StudentApplication = require('../models/StudentApplication');
const CollegeCourse = require('../models/CollegeCourse');
const SessionRollover = require('../models/SessionRollover');

// Odisha sessions start around March-April: a new session begins on 1 March (IST)
const ROLLOVER_MONTH = 2; // March, 0-based
const IST_OFFSET_MS = 330 * 60 * 1000;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const STALE_LOCK_MS = 60 * 60 * 1000;

const getCurrentSession = (date = new Date()) => {
    const ist = new Date(date.getTime() + IST_OFFSET_MS);
    return ist.getUTCMonth() >= ROLLOVER_MONTH ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
};

const courseKey = (collegeId, courseName) => `${collegeId}|${String(courseName || '').trim().toUpperCase()}`;

// Admitted students (status COMPLETE) get an academic record the first time they're seen:
// batch = registration year (same rule as the session filter), 1st year, ACTIVE.
const ensureAcademicRecords = () => {
    const registrationYear = {
        $year: {
            $cond: [
                { $eq: [{ $type: '$personalDetails.registrationDate' }, 'date'] },
                '$personalDetails.registrationDate',
                '$createdAt'
            ]
        }
    };
    return StudentApplication.collection.updateMany(
        { status: 'COMPLETE', 'academic.status': { $exists: false } },
        [{
            $set: {
                'academic.admissionSession': registrationYear,
                'academic.currentSession': registrationYear,
                'academic.yearOfStudy': 1,
                'academic.status': 'ACTIVE',
                'academic.statusChangedAt': '$$NOW'
            }
        }]
    );
};

// Moves every ACTIVE student behind the current session up to it. Safe to run any number of times:
// only students with currentSession < session are touched, and each update re-checks that in its filter.
const runSessionRollover = async ({ trigger, runBy = null, now = new Date() }) => {
    const session = getCurrentSession(now);
    await ensureAcademicRecords();

    // Work out the changes first (read-only). Students that can't be moved (no course duration,
    // bad registration date) stay behind for good, so they alone must not make the scheduler log a run.
    const counts = { promoted: 0, completed: 0, skippedDiscontinued: 0, skippedNoDuration: 0, skippedStale: 0 };
    const durations = new Map();
    const courses = await CollegeCourse.collection.find({ durationYears: { $gte: 1 } }, { projection: { college: 1, courseName: 1, durationYears: 1 } }).toArray();
    courses.forEach(c => durations.set(courseKey(c.college, c.courseName), c.durationYears));

    const promoteOps = [];
    const completeOps = [];
    const candidateFilter = { status: 'COMPLETE', 'academic.status': 'ACTIVE', 'academic.currentSession': { $lt: session } };
    const candidates = StudentApplication.collection.find(candidateFilter, { projection: { academic: 1, courseDetails: 1 } });
    for await (const app of candidates) {
        const duration = durations.get(courseKey(app.courseDetails?.selectedCollege, app.courseDetails?.selectedCourse));
        if (!duration) { counts.skippedNoDuration++; continue; }
        const gap = session - app.academic.currentSession;
        // Further behind than the whole course lasts: bad registration date, leave it for an admin
        if (gap > duration) { counts.skippedStale++; continue; }

        const nextYear = app.academic.yearOfStudy + gap;
        const completed = nextYear > duration;
        const yearOfStudy = completed ? duration : nextYear;
        const status = completed ? 'COMPLETED' : 'ACTIVE';
        (completed ? completeOps : promoteOps).push({
            updateOne: {
                filter: { _id: app._id, 'academic.status': 'ACTIVE', 'academic.currentSession': app.academic.currentSession },
                update: {
                    $set: {
                        'academic.currentSession': session,
                        'academic.yearOfStudy': yearOfStudy,
                        'academic.status': status,
                        ...(completed && { 'academic.statusChangedAt': now, 'academic.statusChangedBy': runBy })
                    },
                    $push: { 'academic.history': { session, yearOfStudy, status, at: now, by: runBy } }
                }
            }
        });
    }
    if (trigger === 'scheduler' && !promoteOps.length && !completeOps.length) {
        return { session, skipped: true, counts };
    }

    // A run that crashed keeps its lock; release it after an hour
    await SessionRollover.updateMany(
        { lock: true, startedAt: { $lt: new Date(Date.now() - STALE_LOCK_MS) } },
        { $set: { status: 'FAILED', error: 'Run did not finish' }, $unset: { lock: 1 } }
    );
    await SessionRollover.init(); // make sure the lock index exists before relying on it
    let run;
    try {
        run = await SessionRollover.create({ session, trigger, runBy, counts, lock: true, startedAt: new Date() });
    } catch (error) {
        if (error.code === 11000) {
            const busy = new Error('A session rollover is already running');
            busy.code = 'ROLLOVER_RUNNING';
            throw busy;
        }
        throw error;
    }

    try {
        // Each update re-checks the student's currentSession, so ops computed before another run finished change nothing
        if (promoteOps.length) run.counts.promoted = (await StudentApplication.collection.bulkWrite(promoteOps, { ordered: false })).modifiedCount;
        if (completeOps.length) run.counts.completed = (await StudentApplication.collection.bulkWrite(completeOps, { ordered: false })).modifiedCount;
        run.counts.skippedDiscontinued = await StudentApplication.collection.countDocuments({
            'academic.status': 'DISCONTINUED', 'academic.currentSession': { $lt: session }
        });
        run.status = 'DONE';
    } catch (error) {
        run.status = 'FAILED';
        run.error = error.message;
        throw error;
    } finally {
        run.lock = undefined;
        run.finishedAt = new Date();
        await run.save();
    }
    return run.toObject();
};

// Checks on start-up and every 6 hours, so a sleeping server still rolls over once it wakes
const startSessionRolloverScheduler = () => {
    const tick = () => runSessionRollover({ trigger: 'scheduler' })
        .then(result => { if (!result.skipped) console.log('🎓 Session rollover:', result.session, result.counts); })
        .catch(error => console.error('Session rollover failed:', error.message));
    setTimeout(tick, 60 * 1000).unref();
    setInterval(tick, CHECK_INTERVAL_MS).unref();
};

module.exports = { getCurrentSession, ensureAcademicRecords, runSessionRollover, startSessionRolloverScheduler };
