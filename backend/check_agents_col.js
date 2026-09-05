require('dotenv').config();
const mongoose = require('mongoose');

async function checkAgentsCol() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const agentsCol = mongoose.connection.collection('agents');
    const usersCol = mongoose.connection.collection('users');
    
    const agents = await agentsCol.find({ 
      $or: [
        { email: { $regex: /bhupendra/i } },
        { email: { $regex: /narendra/i } },
        { email: { $regex: /nagnarendra/i } }
      ]
    }).toArray();
    
    console.log(`Found ${agents.length} matching agents in 'agents' collection.`);
    for (const agent of agents) {
      console.log(`\nAgent: ${agent.email}`);
      console.log(`ID: ${agent._id}`);
      console.log(`User ref: ${agent.user}`);
      console.log(JSON.stringify(agent, null, 2));
      
      if (agent.user) {
        const user = await usersCol.findOne({ _id: agent.user });
        console.log("Associated User in 'users' col:", user ? user.email + " (" + user.role + ")" : "NULL/DELETED!");
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAgentsCol();
