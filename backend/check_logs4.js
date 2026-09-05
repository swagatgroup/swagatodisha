require('dotenv').config();
const mongoose = require('mongoose');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check audit logs for ANY mention of the emails in stringified form
    const logsCol = mongoose.connection.collection('auditlogs');
    const logs = await logsCol.find({
      $or: [
        { requestDetails: { $regex: /bhupendrameher|nagnarendra92/i } },
        { "requestDetails.body": { $regex: /bhupendrameher|nagnarendra92/i } },
        { "requestDetails.url": { $regex: /bhupendrameher|nagnarendra92/i } }
      ]
    }).toArray();
    
    console.log(`Found ${logs.length} logs matching regex in requestDetails`);
    
    // Let's do a full text search in auditlogs if possible, or just fetch recent logs and manually search
    const allLogs = await logsCol.find({}).sort({ timestamp: -1 }).limit(1000).toArray();
    
    const matched = allLogs.filter(l => JSON.stringify(l).toLowerCase().includes('bhupendrameher') || JSON.stringify(l).toLowerCase().includes('nagnarendra'));
    
    console.log(`Found ${matched.length} logs via full stringify search`);
    for (const m of matched) {
      console.log(`Time: ${m.timestamp}, Action: ${m.action}`);
      console.log(JSON.stringify(m, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLogs();
