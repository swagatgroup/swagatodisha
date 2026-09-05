require('dotenv').config();
const mongoose = require('mongoose');

async function fullSearch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    let foundSomething = false;
    
    for (const c of collections) {
      const col = mongoose.connection.collection(c.name);
      const docs = await col.find({}).toArray();
      
      const matched = docs.filter(doc => 
        JSON.stringify(doc).toLowerCase().includes('bhupendrameher') || 
        JSON.stringify(doc).toLowerCase().includes('nagnarendra')
      );
      
      if (matched.length > 0) {
        foundSomething = true;
        console.log(`\nFound ${matched.length} matches in collection: ${c.name}`);
        console.log(`Example doc ID: ${matched[0]._id}`);
        for (const key in matched[0]) {
          if (JSON.stringify(matched[0][key]).toLowerCase().includes('bhupendrameher') || JSON.stringify(matched[0][key]).toLowerCase().includes('nagnarendra')) {
            console.log(`Key matching: ${key}`, JSON.stringify(matched[0][key]));
          }
        }
      }
    }
    
    if (!foundSomething) console.log("Absolutely nothing found in the entire database.");
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fullSearch();
