const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { app, server } = require('../server');

// Helper to ensure backend is running and Mongo connected
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

describe('File Upload Flow', function () {
    this.timeout(20000);

    let token = null;

    before(async function () {
        // Give server some time to initialize connections
        await wait(1000);

        // Register a user or login existing
        const email = `test_uploader_${Date.now()}@example.com`;
        const password = 'Test@12345';

        // Try register
        await request(app)
            .post('/api/auth/register')
            .send({ fullName: 'Test Uploader', email, phoneNumber: '9999999999', password, confirmPassword: password })
            .set('Accept', 'application/json');

        // Login
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email, password })
            .set('Accept', 'application/json');

        if (!loginRes.body || !loginRes.body.token) {
            throw new Error('Login failed in test');
        }

        token = loginRes.body.token;
    });

    it('should upload a file to Cloudinary via /api/files/upload-multiple', async function () {
        // Create a small temp file
        const tmpFile = path.join(__dirname, 'sample.txt');
        fs.writeFileSync(tmpFile, 'sample upload');

        const res = await request(app)
            .post('/api/files/upload-multiple')
            .set('Authorization', `Bearer ${token}`)
            .attach('files', tmpFile);

        // Cleanup
        fs.unlinkSync(tmpFile);

        if (!res.body || !res.body.success) {
            console.error('Upload response:', res.status, res.body);
        }

        // Assertions
        if (res.status !== 201) throw new Error('Expected 201 on upload');
        if (!res.body.success) throw new Error('Upload success false');
        if (!res.body.data || !Array.isArray(res.body.data) || res.body.data.length === 0) {
            throw new Error('Upload data missing');
        }

        const file = res.body.data[0];
        if (!file.downloadUrl) throw new Error('downloadUrl missing');
    });

    after(function (done) {
        try {
            server.close(() => done());
        } catch (e) {
            done();
        }
    });
});
