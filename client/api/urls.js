const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://snfelexstudents2025_db_user:9vvR5qZVJGqWJ0Vt@cluster0.frj5vmg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
    await client.connect();
    const db = client.db('urlshortener');
    const collection = db.collection('urls');
    
    const urls = await collection.find({}, {
      projection: { shortUrl: 1, longUrl: 1, clickCount: 1, createdAt: 1, lastAccessed: 1 }
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

    res.status(200).json(urls);

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
