require('dotenv').config();
const mongoose = require('mongoose');

async function checkAgents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const usersCollection = mongoose.connection.collection('users');
    const emails = ["bhupendrameher@gmail.com", "nagnarendra92@gmail.com"];
    const users = await usersCollection.find({ email: { $in: emails } }).toArray();
    
    console.log(`Found ${users.length} users with these emails.`);
    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`IsActive: ${user.isActive}`);
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
