require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentApplication = require('../models/StudentApplication');

async function run() {
    await connectDB();
    console.log('Connected to DB');

    // Clean old test data
    await User.deleteMany({ email: { $regex: /test\+wf\d+@example\.com/ } });
    await StudentApplication.deleteMany({});

    const createStudent = async (n) => {
        const user = await User.create({
            fullName: `Test Student ${n}`,
            email: `test+wf${n}@example.com`,
            phoneNumber: `90000000${10 + n}`,
            role: 'student',
            password: 'Pass@1234',
            isActive: true
        });
        return user;
    };

    // Create 3 students
    const s1 = await createStudent(1);
    const s2 = await createStudent(2);
    const s3 = await createStudent(3);

    const baseForm = {
        personalDetails: {
            fullName: 'JOHN DOE', fathersName: 'DOE SR', mothersName: 'DOE M', dateOfBirth: '2000-01-01', gender: 'Male', aadharNumber: '123456789012'
        },
        contactDetails: {
            primaryPhone: '9876543210', whatsappNumber: '9876543210', email: 'john@example.com',
            permanentAddress: { street: 'Main St', city: 'BBSR', state: 'Odisha', pincode: '751001', country: 'India' }
        },
        courseDetails: { selectedCourse: 'BCA', customCourse: '', stream: 'CS', campus: 'Sargiguda' },
        guardianDetails: { guardianName: 'GUARDIAN', relationship: 'Father', guardianPhone: '9876543211', guardianEmail: 'g@example.com' },
        financialDetails: {}
    };

    const createApp = async (user) => {
        const app = new StudentApplication({ user: user._id, ...baseForm, progress: { registrationComplete: true } });
        await app.save();
        // documents
        app.documents.push({ documentType: 'Aadhaar', fileName: 'aadhaar.pdf', filePath: '/uploads/documents/mock/aadhaar.pdf', status: 'APPROVED' });
        app.documents.push({ documentType: 'Photo', fileName: 'photo.jpg', filePath: '/uploads/documents/mock/photo.jpg', status: 'APPROVED' });
        app.progress.documentsComplete = true;
        // PDF
        app.applicationPdf = { filePath: '/uploads/processed/mock.pdf', generatedAt: new Date(), version: '1.0' };
        app.progress.applicationPdfGenerated = true;
        // Terms + submit
        app.termsAccepted = true; app.termsAcceptedAt = new Date(); app.progress.termsAccepted = true;
        app.status = 'SUBMITTED'; app.currentStage = 'SUBMITTED'; app.submittedAt = new Date(); app.progress.submitted = true;
        await app.save();
        return app;
    };

    const a1 = await createApp(s1);
    const a2 = await createApp(s2);
    const a3 = await createApp(s3);

    console.log('Created and submitted applications:', a1.applicationId, a2.applicationId, a3.applicationId);

    // Approve one, reject one
    a1.status = 'APPROVED'; a1.currentStage = 'APPROVED'; await a1.save();
    a2.status = 'REJECTED'; a2.currentStage = 'REJECTED'; await a2.save();

    console.log('Approved:', a1.applicationId, 'Rejected:', a2.applicationId, 'Submitted:', a3.applicationId);

    await mongoose.connection.close();
    console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });


