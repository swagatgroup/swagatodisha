const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const CloudinaryService = require('../utils/cloudinary');
const { protect, authorize, requirePower } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { loadWithDescriptor, matchFace } = require('../utils/face');

const router = express.Router();
router.use(protect);

// Under this many hours between check-in and check-out the day counts as Half-Day
const HALF_DAY_HOURS = 4;

// Calendar day in India time
const istDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RX = /^\d{4}-\d{2}$/;

// Staff (Admin collection) and agents (User collection) both mark attendance
const ATTENDEE_ROLES = ['staff', 'agent'];
const modelFor = (user) => (user.role === 'agent' ? 'User' : 'Admin');

// Everyone who should mark attendance, as { id, name, role, ... }
const loadAttendees = async () => {
    const [staff, agents] = await Promise.all([
        Admin.find({ role: 'staff', isActive: { $ne: false } })
            .select('firstName lastName email employeeId isFaceRegistered').sort({ firstName: 1 }).lean(),
        User.find({ role: 'agent', isActive: { $ne: false } })
            .select('fullName email isFaceRegistered').sort({ fullName: 1 }).lean()
    ]);
    return [
        ...staff.map((s) => ({
            id: String(s._id), role: 'staff', name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
            email: s.email, employeeId: s.employeeId || '', isFaceRegistered: !!s.isFaceRegistered
        })),
        ...agents.map((a) => ({
            id: String(a._id), role: 'agent', name: a.fullName || a.email,
            email: a.email, employeeId: '', isFaceRegistered: !!a.isFaceRegistered
        }))
    ];
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/'))
});

const parseDescriptor = (raw) => {
    try { return Array.isArray(raw) ? raw.map(Number) : JSON.parse(raw); } catch (e) { return null; }
};

// Compressed selfie for the admin to review. Attendance is still saved if
// Cloudinary is unavailable, so staff are never stopped from checking in.
const saveSelfie = async (file, userId, kind) => {
    if (!file) return '';
    try {
        const small = await sharp(file.buffer).rotate()
            .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 60 }).toBuffer();
        const result = await CloudinaryService.uploadImage(small, 'swagat-odisha/attendance', {
            public_id: `${userId}_${istDate()}_${kind}`,
            overwrite: true
        });
        return result.url;
    } catch (err) {
        console.error('Attendance selfie upload failed:', err.message);
        return '';
    }
};

// Shared face check for check-in and check-out
const verifyLiveFace = async (req) => {
    const found = await loadWithDescriptor(req.user._id);
    if (!found) return { error: 'Account not found', status: 404 };
    const result = matchFace(found.doc, parseDescriptor(req.body.descriptor));
    // 422, not 401: a 401 makes the app sign the person out
    if (!result.ok) return { error: result.reason, status: 422 };
    return { distance: result.distance };
};

const withFile = (handler) => (req, res) => upload.single('selfie')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: 'Selfie must be an image under 3MB' });
    handler(req, res).catch((e) => {
        console.error('Attendance error:', e);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    });
});

const safe = (fn) => (req, res) => fn(req, res).catch((e) => {
    console.error('Attendance error:', e);
    res.status(500).json({ success: false, message: 'Something went wrong' });
});

// @route GET /api/attendance/today
router.get('/today', authorize(...ATTENDEE_ROLES), safe(async (req, res) => {
    const record = await Attendance.findOne({ user: req.user._id, date: istDate() }).lean();
    res.json({ success: true, data: record, date: istDate(), isFaceRegistered: !!req.user.isFaceRegistered });
}));

// @route POST /api/attendance/check-in  multipart: descriptor (JSON), selfie (image)
router.post('/check-in', authorize(...ATTENDEE_ROLES), withFile(async (req, res) => {
    const date = istDate();
    if (await Attendance.exists({ user: req.user._id, date })) {
        return res.status(409).json({ success: false, message: 'You have already checked in today' });
    }
    const check = await verifyLiveFace(req);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    const selfie = await saveSelfie(req.file, req.user._id, 'in');
    try {
        const record = await Attendance.create({
            user: req.user._id, userModel: modelFor(req.user), date,
            checkInTime: new Date(), checkInSelfieUrl: selfie, matchDistance: check.distance, status: 'Present'
        });
        res.json({ success: true, message: 'Checked in', data: record });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ success: false, message: 'You have already checked in today' });
        throw err;
    }
}));

// @route POST /api/attendance/check-out  multipart: descriptor (JSON), selfie (image)
router.post('/check-out', authorize(...ATTENDEE_ROLES), withFile(async (req, res) => {
    const record = await Attendance.findOne({ user: req.user._id, date: istDate() });
    if (!record || !record.checkInTime) return res.status(400).json({ success: false, message: 'Please check in first' });
    if (record.checkOutTime) return res.status(409).json({ success: false, message: 'You have already checked out today' });

    const check = await verifyLiveFace(req);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    record.checkOutTime = new Date();
    record.checkOutSelfieUrl = await saveSelfie(req.file, req.user._id, 'out');
    record.checkOutMatchDistance = check.distance;
    const hours = (record.checkOutTime - record.checkInTime) / 3600000;
    if (!record.isManual) record.status = hours < HALF_DAY_HOURS ? 'Half-Day' : 'Present';
    await record.save();
    res.json({ success: true, message: 'Checked out', data: record });
}));

// @route GET /api/attendance/my-logs?month=YYYY-MM
router.get('/my-logs', authorize(...ATTENDEE_ROLES), safe(async (req, res) => {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : istDate().slice(0, 7);
    const logs = await Attendance.find({ user: req.user._id, date: { $regex: `^${month}` } })
        .sort({ date: -1 }).select('-checkInSelfieUrl -checkOutSelfieUrl').lean();
    res.json({ success: true, data: logs, month });
}));

// @route GET /api/attendance/admin-report?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=
router.get('/admin-report', requirePower('attendance_admin'), safe(async (req, res) => {
    const today = istDate();
    const from = DATE_RX.test(req.query.from || '') ? req.query.from : today;
    const to = DATE_RX.test(req.query.to || '') ? req.query.to : from;
    const filter = { date: { $gte: from, $lte: to } };
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) filter.user = req.query.userId;

    const [records, staff] = await Promise.all([
        Attendance.find(filter).sort({ date: -1, checkInTime: 1 }).limit(2000).lean(),
        loadAttendees()
    ]);
    res.json({ success: true, from, to, staff, data: records });
}));

// @route GET /api/attendance/monthly-summary?month=YYYY-MM
// Per person: days present, half-days, absent and days with no attendance in the month
// (up to today for the current month). Days run midnight to midnight, India time.
router.get('/monthly-summary', requirePower('attendance_admin'), safe(async (req, res) => {
    const today = istDate();
    const month = MONTH_RX.test(req.query.month || '') && req.query.month <= today.slice(0, 7) ? req.query.month : today.slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const daysSoFar = month === today.slice(0, 7) ? Number(today.slice(8, 10)) : daysInMonth;

    const [people, counts] = await Promise.all([
        loadAttendees(),
        Attendance.aggregate([
            { $match: { date: { $regex: `^${month}-` } } },
            { $group: { _id: { user: '$user', status: '$status' }, n: { $sum: 1 } } }
        ])
    ]);
    const byUser = {};
    counts.forEach((c) => {
        const id = String(c._id.user);
        byUser[id] = byUser[id] || {};
        byUser[id][c._id.status] = c.n;
    });
    const data = people.map((p) => {
        const c = byUser[p.id] || {};
        const present = c.Present || 0;
        const halfDay = c['Half-Day'] || 0;
        const absent = c.Absent || 0;
        return { ...p, present, halfDay, absent, notMarked: Math.max(0, daysSoFar - present - halfDay - absent) };
    });
    res.json({ success: true, month, daysInMonth, daysSoFar, data });
}));

// @route POST /api/attendance/manual-override  { userId, date, status, checkInTime?, checkOutTime?, note? }
router.post('/manual-override', requirePower('attendance_admin'), async (req, res) => {
    try {
        const { userId, date, status, checkInTime, checkOutTime, note = '' } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: 'Choose a staff member or agent' });
        if (!DATE_RX.test(date || '')) return res.status(400).json({ success: false, message: 'Choose a date' });
        if (!['Present', 'Half-Day', 'Absent'].includes(status)) return res.status(400).json({ success: false, message: 'Choose a status' });
        if (req.user.role !== 'super_admin' && String(userId) === String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot change your own attendance' });
        }
        let userModel = 'Admin';
        if (!(await Admin.exists({ _id: userId, role: 'staff' }))) {
            if (!(await User.exists({ _id: userId, role: 'agent' }))) return res.status(404).json({ success: false, message: 'Staff member or agent not found' });
            userModel = 'User';
        }

        const toDate = (v) => { const d = v ? new Date(v) : null; return d && !Number.isNaN(d.getTime()) ? d : undefined; };
        const update = { status, isManual: true, note: String(note).slice(0, 300), markedBy: req.user._id, userModel };
        if (toDate(checkInTime)) update.checkInTime = toDate(checkInTime);
        if (toDate(checkOutTime)) update.checkOutTime = toDate(checkOutTime);

        const record = await Attendance.findOneAndUpdate(
            { user: userId, date },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, message: 'Attendance updated', data: record });
    } catch (err) {
        console.error('Attendance override error:', err);
        res.status(500).json({ success: false, message: 'Could not update attendance' });
    }
});

module.exports = router;
