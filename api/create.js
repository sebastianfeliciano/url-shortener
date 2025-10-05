const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// URL Schema
const urlSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clickCount: { type: Number, default: 0 },
  lastAccessed: { type: Date },
  qrCode: { type: String }
});

const Url = mongoose.model('Url', urlSchema);

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

export default async function handler(req, res) {
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

    // Check if URL already exists
    let existingUrl = await Url.findOne({ longUrl });
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
      const exists = await Url.findOne({ shortUrl });
      if (!exists) {
        isUnique = true;
      }
    }

    // Generate QR code
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5001';
    const qrCodeDataURL = await QRCode.toDataURL(`${baseUrl}/${shortUrl}`);

    // Save to database
    const newUrl = new Url({
      shortUrl,
      longUrl,
      qrCode: qrCodeDataURL
    });

    await newUrl.save();

    res.status(201).json({
      shortUrl,
      longUrl,
      qrCode: qrCodeDataURL,
      clickCount: 0
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
