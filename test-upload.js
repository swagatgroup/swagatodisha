const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
    try {
        console.log('Testing file upload...');

        // Create a test file
        const testContent = 'This is a test file for upload';
        fs.writeFileSync('test-file.txt', testContent);

        // Create form data
        const formData = new FormData();
        formData.append('files', fs.createReadStream('test-file.txt'));

        // Test without authentication first
        console.log('Testing without authentication...');
        const response = await axios.post('http://localhost:5000/api/files/upload-multiple', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('Response status:', response.status);
        console.log('Response:', response.data);

        // Clean up
        fs.unlinkSync('test-file.txt');

    } catch (error) {
        console.error('Test error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testUpload();
