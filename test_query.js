const mongoose = require('mongoose');
require('dotenv').config();

const StudentApplication = require('./backend/models/StudentApplication.js');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha').then(async () => {
    console.log("Connected to DB");
    const apps = await StudentApplication.find({ submitterRole: 'agent' }).select('_id user submittedBy').limit(5);
    console.log("Agent submitted apps:", apps);
    process.exit(0);
});
