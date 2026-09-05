require('dotenv').config();
const mongoose = require('mongoose');

async function checkAgents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const usersCollection = mongoose.connection.collection('users');
    
    const users = await usersCollection.find({ 
      $or: [
        { email: { $regex: /bhupendra/i } },
        { email: { $regex: /narendra/i } },
        { name: { $regex: /bhupendra/i } },
        { name: { $regex: /narendra/i } }
      ]
    }).toArray();
    
    console.log(`Found ${users.length} matching users.`);
    for (const user of users) {
      console.log(`\nUser: ${user.email} (Name: ${user.name})`);
      console.log(`Role: ${user.role}`);
      console.log(`ID: ${user._id}`);
      console.log(JSON.stringify(user, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAgents();
