const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const { LRUCache } = require('lru-cache');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

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

// POST /create - Create short URL
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
    const qrCodeDataURL = await QRCode.toDataURL(`${BASE_URL}/${shortUrl}`);

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

// GET /:shortUrl - Redirect to long URL
app.get('/:shortUrl', async (req, res) => {
  const startTime = Date.now();
  const { shortUrl } = req.params;

  try {
    // Check cache first
    let urlData = urlCache.get(shortUrl);
    
    if (!urlData) {
      // If not in cache, check database
      const url = await Url.findOne({ shortUrl });
      if (!url) {
        return res.status(404).json({ error: 'Short URL not found' });
      }
      
      urlData = {
        longUrl: url.longUrl,
        clickCount: url.clickCount,
        createdAt: url.createdAt
      };
      
      // Add to cache
      urlCache.set(shortUrl, urlData);
    }

    const redirectTime = Date.now() - startTime;

    // Update analytics
    const analytics = new Analytics({
      shortUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      redirectTime
    });
    await analytics.save();

    // Update click count
    await Url.updateOne(
      { shortUrl },
      { 
        $inc: { clickCount: 1 },
        $set: { lastAccessed: new Date() }
      }
    );

    // Update cache
    urlData.clickCount += 1;
    urlCache.set(shortUrl, urlData);

    // Return 301 redirect
    res.status(301).redirect(urlData.longUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
