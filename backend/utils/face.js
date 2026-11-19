const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Face descriptors are computed in the browser (face-api, 128 numbers).
// The server only compares two arrays, which costs next to nothing.
const MATCH_THRESHOLD = 0.5;

const isValidDescriptor = (d) =>
    Array.isArray(d) && d.length === 128 && d.every((n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 2);

const faceDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < 128; i += 1) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

// Returns { doc, model } with the stored descriptor selected
const loadWithDescriptor = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id).select('+faceDescriptor');
    if (user) return { doc: user, model: 'User', userType: 'user' };
    const admin = await Admin.findById(id).select('+faceDescriptor');
    if (admin) return { doc: admin, model: 'Admin', userType: 'admin' };
    return null;
};

// Compares a live descriptor with the stored one
const matchFace = (doc, live) => {
    if (!doc.isFaceRegistered || !isValidDescriptor(doc.faceDescriptor ? Array.from(doc.faceDescriptor) : null)) {
        return { ok: false, reason: 'Face ID is not registered for this account' };
    }
    if (!isValidDescriptor(live)) return { ok: false, reason: 'No face data received. Please try again.' };
    const distance = faceDistance(Array.from(doc.faceDescriptor), live);
    return { ok: distance < MATCH_THRESHOLD, distance: Math.round(distance * 1000) / 1000, reason: 'Face did not match. Please try again in good light.' };
};

module.exports = { MATCH_THRESHOLD, isValidDescriptor, faceDistance, loadWithDescriptor, matchFace };
