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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortUrl } = req.query;

    if (!shortUrl) {
      return res.status(400).json({ error: 'Short URL is required' });
    }

    const { db } = await connectToDatabase();
    const urlsCollection = db.collection('urls');
    const analyticsCollection = db.collection('analytics');

    // Find the URL
    const url = await urlsCollection.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Update click count and last accessed
    await urlsCollection.updateOne(
      { shortUrl },
      { 
        $inc: { clickCount: 1 },
        $set: { lastAccessed: new Date() }
      }
    );

    // Log analytics
    await analyticsCollection.insertOne({
      shortUrl,
      longUrl: url.longUrl,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown'
    });

    // Redirect to the long URL
    res.redirect(302, url.longUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
