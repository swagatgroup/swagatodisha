require('dotenv').config();
const mongoose = require('mongoose');

async function checkApps() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const appsCol = mongoose.connection.collection('studentapplications');
    const apps = await appsCol.find({
      $or: [
        { submitterEmail: { $regex: /bhupendra|narendra/i } },
        { agentEmail: { $regex: /bhupendra|narendra/i } },
        { "referredBy.email": { $regex: /bhupendra|narendra/i } },
        { "agentDetails.email": { $regex: /bhupendra|narendra/i } },
        { "createdBy.email": { $regex: /bhupendra|narendra/i } }
      ]
    }).toArray();
    
    console.log(`Found ${apps.length} applications.`);
    if (apps.length > 0) {
      console.log(JSON.stringify(apps[0], null, 2));
    }
    
    // Also stringify the entire collection and search for the email? (Might be too large)
    // Let's do a text search on the whole collection for the emails
    const allApps = await appsCol.find({}).toArray();
    const matched = allApps.filter(app => JSON.stringify(app).toLowerCase().includes('bhupendrameher') || JSON.stringify(app).toLowerCase().includes('nagnarendra'));
    
    console.log(`Found ${matched.length} apps via full stringify search.`);
    if (matched.length > 0) {
      console.log(`Example match for full stringify:`);
      // print only the keys that contain the string
      for (const key in matched[0]) {
        if (JSON.stringify(matched[0][key]).toLowerCase().includes('bhupendrameher') || JSON.stringify(matched[0][key]).toLowerCase().includes('nagnarendra')) {
          console.log(`Key: ${key}`, JSON.stringify(matched[0][key]));
        }
      }
      console.log(`Submitter Role: ${matched[0].submitterRole}`);
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkApps();
