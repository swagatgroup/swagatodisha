require('dotenv').config();
const mongoose = require('mongoose');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if they appear in any other collection! Let's search all collections for their email.
    const collections = await mongoose.connection.db.listCollections().toArray();
    const emails = ["bhupendrameher@gmail.com", "nagnarendra92@gmail.com"];
    
    for (const c of collections) {
      const col = mongoose.connection.collection(c.name);
      const docs = await col.find({
        $or: [
          { email: { $in: emails } },
          { "user.email": { $in: emails } },
          { "details.email": { $in: emails } }
        ]
      }).toArray();
      if (docs.length > 0) {
        console.log(`\nFound in ${c.name}:`);
        console.log(JSON.stringify(docs, null, 2));
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLogs();
