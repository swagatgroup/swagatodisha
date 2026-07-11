const express = require('express');
const router = require('../routes/adminStudents');

const app = express();
app.use('/api/admin/students', router);

// Mock protect and authorize middlewares to pass through
// (Since we are testing routing, not auth)
jest.mock('../middleware/auth', () => ({
    protect: (req, res, next) => next(),
    authorize: () => (req, res, next) => next()
}));

// Route not found handler
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.url} not found`
    });
});

const request = require('supertest');

request(app)
    .put('/api/admin/students/6a2cedae8d895ca607ef3904/status')
    .send({ status: 'COMPLETE' })
    .expect(200)
    .end((err, res) => {
        if (err) {
            console.error('❌ Test failed:', err);
            console.log('Response:', res.body);
        } else {
            console.log('✅ Test succeeded!');
            console.log('Response:', res.body);
        }
        process.exit(0);
    });
