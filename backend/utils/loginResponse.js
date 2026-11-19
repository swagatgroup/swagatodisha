const jwt = require('jsonwebtoken');

const JWT_SECRET = () => process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development';
// Separate secret so a face-challenge token can never be used as a login token
const FACE_SECRET = () => `${JWT_SECRET()}:face-challenge`;

const generateToken = (id, role = 'user') =>
    jwt.sign({ id, role }, JWT_SECRET(), { expiresIn: '7d' });

const generateRefreshToken = (id) =>
    jwt.sign({ id, type: 'refresh' }, JWT_SECRET(), { expiresIn: '30d' });

const generateFaceChallenge = (id, userType) =>
    jwt.sign({ id, userType, type: 'face_challenge' }, FACE_SECRET(), { expiresIn: '5m' });

const verifyFaceChallenge = (token) => {
    const decoded = jwt.verify(token, FACE_SECRET());
    if (decoded.type !== 'face_challenge') throw new Error('Invalid face challenge');
    return decoded;
};

// Shared by password login and face login: finishes the login and builds
// the same response body the frontend already understands.
const buildLoginResponse = async (user, userType) => {
    if (!user.referralCode) {
        try {
            user.referralCode = user.generateReferralCode();
            if (user.role === 'agent') {
                user.isReferralActive = true;
            }
        } catch (e) { console.error('Error generating referralCode:', e); }
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role || 'user');
    const refreshToken = generateRefreshToken(user._id);

    let studentData = null;
    if (user.role === 'student') {
        const Student = require('../models/Student');
        const student = await Student.findOne({ user: user._id });
        if (student) {
            student.lastLogin = new Date();
            await student.save({ validateBeforeSave: false });

            studentData = {
                id: student._id,
                studentId: student.studentId,
                course: student.course,
                isProfileComplete: student.isProfileComplete,
                status: student.status
            };
        }
    }

    let userData = {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'user',
        referralCode: user.referralCode || undefined,
        isFaceRegistered: !!user.isFaceRegistered
    };

    if (userType === 'admin') {
        userData.fullName = user.fullName || `${user.firstName} ${user.lastName}`;
    } else {
        userData.fullName = user.fullName;
        userData.phoneNumber = user.phoneNumber || '';
    }

    if (studentData) {
        userData = { ...userData, ...studentData };
    }

    return {
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: userData,
        sessionExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
};

module.exports = {
    generateToken,
    generateRefreshToken,
    generateFaceChallenge,
    verifyFaceChallenge,
    buildLoginResponse
};
