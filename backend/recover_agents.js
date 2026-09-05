require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function recoverAgents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersCol = mongoose.connection.collection('users');
    const agentsCol = mongoose.connection.collection('agents');
    
    const emailsToRecover = [
      "bhupendrameher@gmail.com",
      "nagnarendra92@gmail.com"
    ];
    
    const defaultPassword = await bcrypt.hash("Swagat@123", 12);
    
    for (const email of emailsToRecover) {
      // Check if already exists
      const existing = await usersCol.findOne({ email });
      if (existing) {
        console.log(`User ${email} already exists. Updating role to agent.`);
        await usersCol.updateOne({ email }, { $set: { role: 'agent', isActive: true } });
        
        // Ensure agent profile exists
        const agentProf = await agentsCol.findOne({ user: existing._id });
        if (!agentProf) {
          await agentsCol.insertOne({
            user: existing._id,
            email: existing.email,
            phone: existing.phoneNumber || "",
            status: "approved",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        console.log(`Recreating missing user ${email}...`);
        
        // Generate a referral code
        const namePart = email.split('@')[0].substring(0, 4);
        const referralCode = `${namePart}${Math.floor(1000 + Math.random() * 9000)}`.toLowerCase();
        
        const result = await usersCol.insertOne({
          fullName: email.split('@')[0], // placeholder
          email: email,
          password: defaultPassword,
          role: 'agent',
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          referralCode: referralCode,
          referralStats: {
            totalReferrals: 0,
            pendingReferrals: 0,
            approvedReferrals: 0,
            rejectedReferrals: 0,
            totalCommission: 0
          },
          isReferralActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        });
        
        await agentsCol.insertOne({
          user: result.insertedId,
          email: email,
          phone: "",
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Successfully recreated ${email} with ID ${result.insertedId}`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
recoverAgents();
