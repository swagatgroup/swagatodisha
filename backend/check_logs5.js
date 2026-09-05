require('dotenv').config();
const mongoose = require('mongoose');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usersCol = mongoose.connection.collection('users');
    const u1 = await usersCol.findOne({ email: "bhupendrameher@gmail.com" });
    const u2 = await usersCol.findOne({ email: "nagnarendra92@gmail.com" });
    
    console.log("u1:", u1);
    console.log("u2:", u2);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkLogs();
