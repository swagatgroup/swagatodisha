const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const clearStudents = async () => {
  try {
    await connectDB();
    
    // Drop the students collection
    await mongoose.connection.db.collection('students').drop();
    console.log('✅ Students collection cleared');
    
    // Drop the users collection
    await mongoose.connection.db.collection('users').drop();
    console.log('✅ Users collection cleared');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing collections:', error.message);
    process.exit(1);
  }
};

clearStudents();

