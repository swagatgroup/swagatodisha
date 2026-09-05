require('dotenv').config();
const mongoose = require('mongoose');

async function checkDBs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check list of databases
    const admin = mongoose.connection.db.admin();
    const result = await admin.listDatabases();
    console.log("Databases:", result.databases.map(db => db.name));
    
    // Let's search the other databases for the user!
    for (const dbInfo of result.databases) {
      if (dbInfo.name === 'admin' || dbInfo.name === 'local') continue;
      console.log(`\nChecking DB: ${dbInfo.name}`);
      const db = mongoose.connection.client.db(dbInfo.name);
      
      const usersCol = db.collection('users');
      const agents = await usersCol.find({
        $or: [
          { email: { $regex: /bhupendra|narendra/i } }
        ]
      }).toArray();
      
      if (agents.length > 0) {
        console.log(`Found ${agents.length} users in DB ${dbInfo.name}:`);
        agents.forEach(a => console.log(`- ${a.email} (Role: ${a.role})`));
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDBs();
