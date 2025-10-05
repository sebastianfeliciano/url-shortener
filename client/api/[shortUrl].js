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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shortUrl } = req.query;
  const startTime = Date.now();

  try {
    // Check if it's a valid 8-character short URL
    if (!shortUrl || shortUrl.length !== 8 || !/^[a-zA-Z0-9]+$/.test(shortUrl)) {
      return res.status(404).json({ 
        error: 'Short URL not found',
        code: 'NOT_FOUND',
        message: 'The requested short URL does not exist'
      });
    }

    await client.connect();
    const db = client.db('urlshortener');
    const urlsCollection = db.collection('urls');
    const analyticsCollection = db.collection('analytics');

    // Find the URL in database
    const url = await urlsCollection.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ 
        error: 'Short URL not found',
        code: 'NOT_FOUND',
        message: 'The requested short URL does not exist'
      });
    }

    const redirectTime = Date.now() - startTime;

    // Update analytics
    const analytics = {
      shortUrl,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      redirectTime,
      timestamp: new Date()
    };
    await analyticsCollection.insertOne(analytics);

    // Update click count
    await urlsCollection.updateOne(
      { shortUrl },
      { 
        $inc: { clickCount: 1 },
        $set: { lastAccessed: new Date() }
      }
    );

    // Return 301 redirect
    res.status(301).redirect(url.longUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
