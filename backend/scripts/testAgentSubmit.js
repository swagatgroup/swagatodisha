const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swagatodisha');
    
    // Find an agent
    const agent = await User.findOne({ role: 'agent' });
    console.log('Agent:', agent ? agent.email : 'None found');
    
    if (!agent) {
        process.exit(0);
    }
    
    // Find a draft submitted by this agent
    const draft = await StudentApplication.findOne({ submittedBy: agent._id, status: 'DRAFT' });
    console.log('Draft Application:', draft ? draft._id : 'None found');
    
    if (draft) {
        console.log('Application User:', draft.user);
        console.log('Application SubmittedBy:', draft.submittedBy);
        
        // This is exactly what the backend submitApplication controller now does:
        let application = await StudentApplication.findOne({
            applicationId: draft.applicationId,
            user: agent._id,
        });
        console.log('Found with user: req.user._id?', !!application);
        
        if (!application && agent.role !== 'student') {
            application = await StudentApplication.findOne({
                applicationId: draft.applicationId,
                submittedBy: agent._id,
            });
            console.log('Found with submittedBy fallback?', !!application);
        }
    }
    
    process.exit(0);
}
test();
