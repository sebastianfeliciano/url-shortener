const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://snfelexstudents2025_db_user:9vvR5qZVJGqWJ0Vt@cluster0.frj5vmg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function testConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db('urlshortener');
    const collection = db.collection('urls');
    
    console.log('📊 Testing database operations...');
    
    // Test inserting a document
    const testUrl = {
      shortUrl: 'test123',
      longUrl: 'https://example.com',
      clickCount: 0,
      createdAt: new Date()
    };
    
    const insertResult = await collection.insertOne(testUrl);
    console.log('✅ Insert test successful:', insertResult.insertedId);
    
    // Test finding documents
    const urls = await collection.find({}).limit(5).toArray();
    console.log('✅ Find test successful, found', urls.length, 'documents');
    
    // Clean up test document
    await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Cleanup successful');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
