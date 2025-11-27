const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const { LRUCache } = require('lru-cache');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-detect IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) addresses and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();

// Use environment variable for BASE_URL, or detect from cloud provider
// For deployment, this will auto-detect from VERCEL_URL, RAILWAY_PUBLIC_DOMAIN, or RENDER_EXTERNAL_URL
let BASE_URL = process.env.BASE_URL;
if (!BASE_URL) {
  if (process.env.VERCEL_URL) {
    BASE_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    BASE_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  } else if (process.env.RENDER_EXTERNAL_URL) {
    BASE_URL = process.env.RENDER_EXTERNAL_URL;
  } else {
    BASE_URL = `http://${LOCAL_IP}:${PORT}`;
  }
}

// Log the detected IP for reference
console.log('Server running on:', BASE_URL);
console.log('Environment:', process.env.NODE_ENV || 'development');

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

// MongoDB connection - Using Atlas database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority';

// For serverless environments (Vercel), reuse existing connection
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  }).then(() => {
    console.log('MongoDB connected successfully');
    const db = mongoose.connection.db;
    console.log('Database:', db.databaseName);
    db.listCollections().toArray().then(cols => {
      console.log('Available collections:', cols.map(c => c.name));
    }).catch(err => console.error('Error listing collections:', err));
  }).catch((error) => {
    console.error('MongoDB connection error:', error);
    console.error('Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
  });
} else {
  console.log('MongoDB connection already established');
}

// Profile Schema
const profileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
profileSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
profileSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Profile = mongoose.model('Profile', profileSchema);

// Ensure Profile collection exists
mongoose.connection.once('open', async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:', collectionNames);
    
    if (!collectionNames.includes('profiles')) {
      console.log('Creating profiles collection...');
      // The collection will be created automatically on first save
    }
  } catch (error) {
    console.error('Error checking collections:', error);
  }
});

// URL Schema
const urlSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clickCount: { type: Number, default: 0 },
  lastAccessed: { type: Date },
  qrCode: { type: String },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', default: null }
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

// POST /api/profiles/register - Register a new profile
app.post('/api/profiles/register', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection unavailable. Please check MongoDB connection settings.' 
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingProfile = await Profile.findOne({ username });
    if (existingProfile) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const profile = new Profile({ username, password });
    
    try {
      await profile.save();
      console.log('✅ Profile saved successfully:', {
        id: profile._id.toString(),
        username: profile.username,
        collection: Profile.collection.name,
        database: mongoose.connection.db.databaseName
      });
    } catch (saveError) {
      console.error('❌ Error saving profile:', saveError);
      throw saveError;
    }

    res.status(201).json({
      id: profile._id,
      username: profile.username,
      createdAt: profile.createdAt
    });
  } catch (error) {
    console.error('Error registering profile:', error);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/profiles/login - Authenticate a profile
app.post('/api/profiles/login', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection unavailable. Please check MongoDB connection settings.' 
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const profile = await Profile.findOne({ username });
    if (!profile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await profile.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: profile._id,
      username: profile.username,
      createdAt: profile.createdAt
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/profiles/:id/urls - Get all URLs for a profile
app.get('/api/profiles/:id/urls', async (req, res) => {
  try {
    const { id } = req.params;

    const urls = await Url.find({ profileId: id })
      .sort({ createdAt: -1 })
      .select('shortUrl longUrl clickCount createdAt lastAccessed qrCode');

    res.json(urls);
  } catch (error) {
    console.error('Error fetching profile URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profiles/:id/analytics - Get analytics for all URLs of a profile
app.get('/api/profiles/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;

    const urls = await Url.find({ profileId: id }).select('shortUrl');
    const shortUrls = urls.map(url => url.shortUrl);

    const analytics = await Analytics.find({ shortUrl: { $in: shortUrls } })
      .sort({ timestamp: -1 })
      .limit(100);

    const totalClicks = analytics.length;
    const totalUrls = urls.length;
    const totalClicksPerUrl = urls.reduce((sum, url) => sum + url.clickCount, 0);

    res.json({
      profileId: id,
      totalUrls,
      totalClicks,
      totalClicksPerUrl,
      recentClicks: analytics.slice(0, 20),
      urls: urls.map(url => ({
        shortUrl: url.shortUrl,
        longUrl: url.longUrl,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        lastAccessed: url.lastAccessed
      }))
    });
  } catch (error) {
    console.error('Error fetching profile analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /create - Create short URL
app.post('/api/create', async (req, res) => {
  try {
    const { longUrl, profileId } = req.body;

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
      qrCode: qrCodeDataURL,
      profileId: profileId || null
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

// GET /:shortUrl - Redirect to long URL (only for 8-character nanoid strings)
app.get('/:shortUrl([a-zA-Z0-9_-]{8})', async (req, res) => {
  const startTime = Date.now();
  const { shortUrl } = req.params;

  try {
    // Check cache first
    let urlData = urlCache.get(shortUrl);
    
    if (!urlData) {
      // If not in cache, check database
      const url = await Url.findOne({ shortUrl });
      if (!url) {
        return res.status(404).json({ 
          error: 'Short URL not found',
          code: 'NOT_FOUND',
          message: 'The requested short URL does not exist'
        });
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

// GET /api/stats - Get overall statistics (filtered by profileId if provided)
app.get('/api/stats', async (req, res) => {
  try {
    const { profileId } = req.query;
    
    let totalUrls, totalClicks;
    
    if (profileId) {
      // Get stats for specific user
      totalUrls = await Url.countDocuments({ profileId });
      const userUrls = await Url.find({ profileId }).select('shortUrl');
      const shortUrls = userUrls.map(url => url.shortUrl);
      totalClicks = await Analytics.countDocuments({ shortUrl: { $in: shortUrls } });
    } else {
      // Get global stats
      totalUrls = await Url.countDocuments();
      totalClicks = await Analytics.countDocuments();
    }
    
    const cacheSize = urlCache.size;

    res.json({
      totalUrls,
      totalClicks,
      cacheSize,
      cacheHitRate: 'N/A', // Could be implemented with more sophisticated tracking
      isUserStats: !!profileId
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/urls - Get all URLs (filtered by profileId if provided)
app.get('/api/urls', async (req, res) => {
  try {
    const { profileId } = req.query;
    
    // Build query - if profileId provided, only get that user's URLs
    const query = profileId ? { profileId } : {};
    
    const urls = await Url.find(query, 'shortUrl longUrl clickCount createdAt lastAccessed profileId')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent large responses

    res.json(urls);

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root path handler for development
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      create: 'POST /api/create',
      analytics: 'GET /api/analytics/:shortUrl',
      stats: 'GET /api/stats',
      health: 'GET /api/health',
      redirect: 'GET /:shortUrl',
      profiles: {
        register: 'POST /api/profiles/register',
        login: 'POST /api/profiles/login',
        getUrls: 'GET /api/profiles/:id/urls',
        getAnalytics: 'GET /api/profiles/:id/analytics'
      }
    },
    documentation: 'Visit http://localhost:3000 for the frontend interface'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Catch-all handler: send back React's index.html file for any non-API routes
  // This must come AFTER all API routes
  app.get('*', (req, res) => {
    // Skip API routes - let them 404 if not found
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Skip short URL redirects (8-char codes) - they're handled by the redirect route
    if (/^\/[a-zA-Z0-9_-]{8}$/.test(req.path)) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    // For all other routes, serve the React app
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start the server (only if not in serverless environment like Vercel)
// Vercel will handle the serverless function, so we don't need to listen
// Render and Railway need the server to listen
const isServerless = process.env.VERCEL === '1';
const isRender = !!process.env.RENDER_EXTERNAL_URL;
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

if (!isServerless) {
  // Render sets PORT automatically, but we can use process.env.PORT
  const serverPort = process.env.PORT || PORT;
  
  app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Server running on port ${serverPort}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Platform: ${isRender ? 'Render' : isRailway ? 'Railway' : 'Local'}`);
    console.log(`MongoDB URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`Base URL: ${BASE_URL}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${serverPort} is already in use. Please kill the process using this port.`);
      console.error(`   Run: lsof -ti:${serverPort} | xargs kill -9`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
} else {
  // Serverless environment (Vercel) - just log
  console.log('Serverless environment detected (Vercel)');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`MongoDB URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
}

// Export for Vercel serverless functions
module.exports = app;
