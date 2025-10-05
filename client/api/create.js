const { MongoClient, ServerApiVersion } = require('mongodb');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

const uri = "mongodb+srv://snfelexstudents2025_db_user:9vvR5qZVJGqWJ0Vt@cluster0.frj5vmg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Generate short URL
function generateShortUrl() {
  return nanoid(8);
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    await client.connect();
    const db = client.db('urlshortener');
    const collection = db.collection('urls');

    // Check if URL already exists
    const existingUrl = await collection.findOne({ longUrl });
    if (existingUrl) {
      return res.status(201).json({
        shortUrl: existingUrl.shortUrl,
        longUrl: existingUrl.longUrl,
        qrCode: existingUrl.qrCode,
        clickCount: existingUrl.clickCount
      });
    }

    // Generate unique short URL
    let shortUrl;
    let isUnique = false;
    while (!isUnique) {
      shortUrl = generateShortUrl();
      const exists = await collection.findOne({ shortUrl });
      if (!exists) {
        isUnique = true;
      }
    }

    // Generate QR code
    const baseUrl = 'https://urs-mauve.vercel.app';
    const qrCodeDataURL = await QRCode.toDataURL(`${baseUrl}/${shortUrl}`);

    // Save to database
    const newUrl = {
      shortUrl,
      longUrl,
      qrCode: qrCodeDataURL,
      clickCount: 0,
      createdAt: new Date()
    };

    await collection.insertOne(newUrl);

    res.status(201).json({
      shortUrl,
      longUrl,
      qrCode: qrCodeDataURL,
      clickCount: 0
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
