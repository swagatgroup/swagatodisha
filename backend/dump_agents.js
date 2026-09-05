require('dotenv').config();
const mongoose = require('mongoose');

async function dumpAgents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usersCol = mongoose.connection.collection('users');
    const agents = await usersCol.find({ role: 'agent' }).toArray();
    
    console.log(`Found ${agents.length} agents in 'users' col:`);
    agents.forEach(a => console.log(`- ${a.email} (Name: ${a.fullName || a.name})`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dumpAgents();
