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

// Mock the model call to avoid database connection
jest.mock('../models/StudentApplication', () => ({
    findById: jest.fn().mockImplementation(() => ({
        _id: '6a2cedae8d895ca607ef3904',
        status: 'UNDER_REVIEW',
        save: jest.fn().mockResolvedValue(true)
    }))
}));

const request = require('supertest');

describe('PUT /api/admin/students/:id/status', () => {
    it('should match the route and return a response', async () => {
        const res = await request(app)
            .put('/api/admin/students/6a2cedae8d895ca607ef3904/status')
            .send({ status: 'COMPLETE' });
        
        console.log('Response body:', res.body);
        expect(res.statusCode).not.toBe(404);
    });
});
