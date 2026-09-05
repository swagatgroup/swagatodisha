require('dotenv').config();
const mongoose = require('mongoose');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check audit logs
    const logsCol = mongoose.connection.collection('auditlogs');
    const logs = await logsCol.find({
      $or: [
        { "details.email": { $regex: /bhupendra|narendra/i } },
        { "details.user.email": { $regex: /bhupendra|narendra/i } },
        { "action": { $regex: /delete/i } }
      ]
    }).sort({ timestamp: -1 }).limit(10).toArray();
    
    console.log("Recent delete logs or logs involving these emails:");
    for (const log of logs) {
      console.log(`Action: ${log.action}, Time: ${log.timestamp}`);
      console.log(JSON.stringify(log, null, 2));
    }

    // Also check if they exist in users with exact match
    const usersCol = mongoose.connection.collection('users');
    const user1 = await usersCol.findOne({ email: "bhupendrameher@gmail.com" });
    const user2 = await usersCol.findOne({ email: "nagnarendra92@gmail.com" });
    
    console.log("\nExact match for bhupendrameher@gmail.com:", user1 ? user1._id : "Not found");
    console.log("Exact match for nagnarendra92@gmail.com:", user2 ? user2._id : "Not found");
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLogs();
