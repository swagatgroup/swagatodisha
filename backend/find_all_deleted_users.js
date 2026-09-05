require('dotenv').config();
const mongoose = require('mongoose');

async function findDeleted() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const logsCol = mongoose.connection.collection('auditlogs');
    
    // Find all delete logs
    const logs = await logsCol.find({
      $and: [
        { "action": { $regex: /delete/i } }
      ]
    }).sort({ timestamp: -1 }).toArray();
    
    console.log(`Found ${logs.length} delete logs.`);
    for (const log of logs) {
      if (log.resourceType === 'User' || log.metadata?.associatedWith === 'StudentApplication' || log.result?.message?.includes('user')) {
        console.log(`\nTime: ${log.timestamp}, Action: ${log.action}, Resource: ${log.resourceType}`);
        console.log(`Target ID: ${log.targetId}, Target IDs: ${JSON.stringify(log.targetIds)}`);
        console.log(`Result: ${log.result?.message}`);
        console.log(`Metadata: ${JSON.stringify(log.metadata)}`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
findDeleted();
