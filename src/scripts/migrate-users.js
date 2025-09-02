// Migration script to add new fields to existing users
// Run this once to update existing user documents

const { MongoClient } = require('mongodb');

async function migrateUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    console.log('Starting user migration...');
    
    const result = await users.updateMany(
      {}, // Update all users
      {
        $set: {
          fullname: "$name", // Use name as fallback for fullname
          number: "", // Empty string as default
          idAssigned: false,
          idAssignedAt: null,
          employeeId: null,
          clientId: null,
          otpEmail: null
        }
      }
    );
    
    console.log(`Migration completed: ${result.modifiedCount} users updated`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateUsers();