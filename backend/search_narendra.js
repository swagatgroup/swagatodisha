require('dotenv').config();
const mongoose = require('mongoose');

async function search() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const c of collections) {
      const col = mongoose.connection.collection(c.name);
      const docs = await col.find({}).toArray();
      const matched = docs.filter(doc => JSON.stringify(doc).toLowerCase().includes('narendra'));
      if (matched.length > 0) {
        console.log(`Found ${matched.length} in ${c.name}`);
        console.log(JSON.stringify(matched[0], null, 2));
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
search();
