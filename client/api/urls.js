const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://snfelexstudents2025_db_user:9vvR5qZVJGqWJ0Vt@urlshortener.nay4npn.mongodb.net/?retryWrites=true&w=majority&appName=urlshortener";

// Use a global connection to avoid SSL issues
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  });

  await client.connect();
  const db = client.db('urlshortener');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting MongoDB connection...');
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB');
    
    const collection = db.collection('urls');
    console.log('Accessing urls collection');
    
    const urls = await collection.find({}, {
      projection: { shortUrl: 1, longUrl: 1, clickCount: 1, createdAt: 1, lastAccessed: 1 }
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

    console.log('Found', urls.length, 'URLs');
    res.status(200).json(urls);

  } catch (error) {
    console.error('Error fetching URLs:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
