const express = require('express');
const crypto = require('crypto');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { isValidDescriptor, loadWithDescriptor, matchFace } = require('../utils/face');
const { verifyFaceChallenge, buildLoginResponse } = require('../utils/loginResponse');

const router = express.Router();

const FACE_ROLES = ['staff', 'agent', 'super_admin'];

// Failed face attempts per login challenge (in memory, challenges last 5 minutes)
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const tokenKey = (t) => crypto.createHash('sha256').update(t).digest('hex');
setInterval(() => attempts.clear(), 10 * 60 * 1000).unref();

// @route POST /api/face/verify-login  { faceToken, descriptor }
// Second step after the password, for people who must log in with face.
router.post('/verify-login', async (req, res) => {
    try {
        const { faceToken, descriptor } = req.body || {};
        let challenge;
        try {
            challenge = verifyFaceChallenge(String(faceToken || ''));
        } catch (e) {
            return res.status(401).json({ success: false, message: 'Your sign-in expired. Please enter your password again.' });
        }

        const key = tokenKey(faceToken);
        const used = attempts.get(key) || 0;
        if (used >= MAX_ATTEMPTS) {
            return res.status(429).json({ success: false, message: 'Too many failed attempts. Please sign in again.' });
        }

        const found = await loadWithDescriptor(challenge.id);
        if (!found || found.doc.isActive === false) {
            return res.status(401).json({ success: false, message: 'Account not available' });
        }

        const result = matchFace(found.doc, descriptor);
        if (!result.ok) {
            attempts.set(key, used + 1);
            return res.status(401).json({ success: false, message: result.reason, attemptsLeft: MAX_ATTEMPTS - used - 1 });
        }

        attempts.delete(key);
        const user = found.doc;
        if (found.userType === 'admin') user.role = user.role || 'super_admin';
        res.json(await buildLoginResponse(user, found.userType));
    } catch (err) {
        console.error('Face login error:', err);
        res.status(500).json({ success: false, message: 'Server error during face login' });
    }
});

router.use(protect);

// @route GET /api/face/status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            isFaceRegistered: !!req.user.isFaceRegistered,
            requireFaceLogin: !!req.user.requireFaceLogin,
            faceRegisteredAt: req.user.faceRegisteredAt || null,
            canRegister: FACE_ROLES.includes(req.user.role)
        }
    });
});

// @route POST /api/face/register  { descriptor: number[128], consent: true }
// Once registered, only the super admin can reset it (stops a borrowed session
// from replacing someone's face).
router.post('/register', authorize(...FACE_ROLES), async (req, res) => {
    try {
        const { descriptor, consent } = req.body || {};
        if (consent !== true) return res.status(400).json({ success: false, message: 'Please give consent to store your Face ID' });
        if (!isValidDescriptor(descriptor)) return res.status(400).json({ success: false, message: 'No clear face data received. Please try again.' });

        const found = await loadWithDescriptor(req.user._id);
        if (!found) return res.status(404).json({ success: false, message: 'Account not found' });
        if (found.doc.isFaceRegistered) {
            return res.status(409).json({ success: false, message: 'Face ID is already registered. Ask the admin to reset it first.' });
        }

        found.doc.faceDescriptor = descriptor;
        found.doc.isFaceRegistered = true;
        found.doc.faceRegisteredAt = new Date();
        found.doc.faceConsentAt = new Date();
        await found.doc.save({ validateBeforeSave: false });
        res.json({ success: true, message: 'Face ID registered' });
    } catch (err) {
        console.error('Face register error:', err);
        res.status(500).json({ success: false, message: 'Could not save Face ID' });
    }
});

// ─── Super admin ───────────────────────────────────────────────────────────
const FIELDS = 'firstName lastName fullName email role isActive isFaceRegistered requireFaceLogin faceRegisteredAt employeeId';
const row = (d, model) => ({
    id: String(d._id),
    model,
    name: d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || d.email,
    email: d.email,
    role: d.role,
    employeeId: d.employeeId || '',
    isFaceRegistered: !!d.isFaceRegistered,
    requireFaceLogin: !!d.requireFaceLogin,
    faceRegisteredAt: d.faceRegisteredAt || null
});

// @route GET /api/face/users  Staff and agents with their Face ID status
router.get('/users', authorize('super_admin'), async (req, res) => {
    try {
        const [staff, agents] = await Promise.all([
            Admin.find({ role: 'staff', isActive: { $ne: false } }).select(FIELDS).sort({ firstName: 1 }).lean(),
            User.find({ role: 'agent', isActive: { $ne: false } }).select(FIELDS).sort({ fullName: 1 }).lean()
        ]);
        res.json({ success: true, data: [...staff.map((d) => row(d, 'Admin')), ...agents.map((d) => row(d, 'User'))] });
    } catch (err) {
        console.error('Face users error:', err);
        res.status(500).json({ success: false, message: 'Could not load staff' });
    }
});

// @route PATCH /api/face/require/:userId  { required: boolean }
router.patch('/require/:userId', authorize('super_admin'), async (req, res) => {
    try {
        const found = await loadWithDescriptor(req.params.userId);
        if (!found || !['staff', 'agent'].includes(found.doc.role)) return res.status(404).json({ success: false, message: 'Staff or agent not found' });
        const required = req.body && req.body.required === true;
        if (required && !found.doc.isFaceRegistered) {
            return res.status(400).json({ success: false, message: 'They need to register their Face ID first' });
        }
        found.doc.requireFaceLogin = required;
        await found.doc.save({ validateBeforeSave: false });
        res.json({ success: true, message: required ? 'Face login is now required' : 'Face login turned off' });
    } catch (err) {
        console.error('Face require error:', err);
        res.status(500).json({ success: false, message: 'Could not update' });
    }
});

// @route PATCH /api/face/reset/:userId  Clears Face ID so they can register again
router.patch('/reset/:userId', authorize('super_admin'), async (req, res) => {
    try {
        const found = await loadWithDescriptor(req.params.userId);
        if (!found) return res.status(404).json({ success: false, message: 'Person not found' });
        found.doc.faceDescriptor = [];
        found.doc.isFaceRegistered = false;
        found.doc.requireFaceLogin = false;
        found.doc.faceRegisteredAt = undefined;
        await found.doc.save({ validateBeforeSave: false });
        res.json({ success: true, message: 'Face ID reset. Face login is off until they register again.' });
    } catch (err) {
        console.error('Face reset error:', err);
        res.status(500).json({ success: false, message: 'Could not reset Face ID' });
    }
});

module.exports = router;
