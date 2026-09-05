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
      const existing = await usersCol.findOne({ email });
      const namePart = email.split('@')[0].substring(0, 4);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const referralCode = `${namePart}${randomNum}`.toLowerCase();
      const agentId = `AGT-${randomNum}${Date.now().toString().slice(-4)}`;
      
      let userId;
      if (!existing) {
        console.log(`Recreating missing user ${email}...`);
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
        userId = result.insertedId;
      } else {
        userId = existing._id;
      }
      
      const agentProf = await agentsCol.findOne({ user: userId });
      if (!agentProf) {
        await agentsCol.insertOne({
          user: userId,
          agentId: agentId,
          email: email,
          phone: "",
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Successfully recreated agent profile for ${email}`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
recoverAgents();
