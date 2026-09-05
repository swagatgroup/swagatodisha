require('dotenv').config();
const mongoose = require('mongoose');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check audit logs for deleted agents
    const logsCol = mongoose.connection.collection('auditlogs');
    const logs = await logsCol.find({
      $and: [
        { "action": { $regex: /delete/i } },
        { "metadata.userType": "agent" }
      ]
    }).sort({ timestamp: -1 }).toArray();
    
    console.log(`Found ${logs.length} agent deletions.`);
    for (const log of logs) {
      console.log(`Time: ${log.timestamp}, targetId: ${log.targetId}`);
      // find what the email was? auditlogs might not contain the email, but maybe it does.
      console.log(JSON.stringify(log, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLogs();
