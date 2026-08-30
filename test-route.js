const express = require('express');
const app = express();

const router = express.Router();
router.put('/:applicationId/save-draft', (req, res) => res.json({ success: true }));

app.use('/api/student-application', router);

app.use((req, res, next) => {
    res.status(404).json({ error: 'ROUTE_NOT_FOUND', originalUrl: req.originalUrl });
});

const server = app.listen(0, () => {
  const http = require('http');
  const req = http.request({
    port: server.address().port,
    method: 'PUT',
    path: '/api/student-application/APP123/save-draft'
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      server.close();
    });
  });
  req.end();
});
