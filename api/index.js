const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const { LRUCache } = require('lru-cache');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// LRU Cache for low latency
const urlCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60 // 1 hour
});

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

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  redirectTime: { type: Number } // in milliseconds
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

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

// POST /api/create - Create short URL
app.post('/api/create', async (req, res) => {
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

    // Add to cache
    urlCache.set(shortUrl, {
      longUrl,
      clickCount: 0,
      createdAt: newUrl.createdAt
    });

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
});

// GET /api/urls - Get all URLs
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find({}, 'shortUrl longUrl clickCount createdAt lastAccessed')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent large responses

    res.json(urls);

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/:shortUrl - Get analytics for a short URL
app.get('/api/analytics/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const analytics = await Analytics.find({ shortUrl })
      .sort({ timestamp: -1 })
      .limit(100);

    const totalClicks = analytics.length;
    const avgRedirectTime = analytics.reduce((sum, a) => sum + a.redirectTime, 0) / totalClicks || 0;

    res.json({
      shortUrl,
      longUrl: url.longUrl,
      totalClicks,
      avgRedirectTime: Math.round(avgRedirectTime),
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed,
      recentClicks: analytics.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats - Get overall statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();
    const totalClicks = await Analytics.countDocuments();
    const cacheSize = urlCache.size;

    res.json({
      totalUrls,
      totalClicks,
      cacheSize,
      cacheHitRate: 'N/A' // Could be implemented with more sophisticated tracking
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root path handler
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      create: 'POST /api/create',
      analytics: 'GET /api/analytics/:shortUrl',
      stats: 'GET /api/stats',
      health: 'GET /api/health',
      urls: 'GET /api/urls'
    }
  });
});

module.exports = app;
