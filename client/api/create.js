const { MongoClient, ServerApiVersion } = require('mongodb');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

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

// Generate short URL
function generateShortUrl() {
  return nanoid(8);
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }

    // Validate URL format
    try {
      new URL(longUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('urls');

    // Check if URL already exists
    const existingUrl = await collection.findOne({ longUrl });
    if (existingUrl) {
      return res.json({
        shortUrl: existingUrl.shortUrl,
        longUrl: existingUrl.longUrl,
        qrCode: existingUrl.qrCode,
        message: 'URL already shortened'
      });
    }

    // Generate unique short URL
    let shortUrl;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortUrl = generateShortUrl();
      const existing = await collection.findOne({ shortUrl });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique short URL' });
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(longUrl);

    // Save to database
    const urlData = {
      shortUrl,
      longUrl,
      qrCode,
      clickCount: 0,
      createdAt: new Date(),
      lastAccessed: null
    };

    await collection.insertOne(urlData);

    res.status(201).json({
      shortUrl,
      longUrl,
      qrCode,
      message: 'URL shortened successfully'
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
