const mongoose = require('mongoose');

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

    // Find the URL in database
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ 
        error: 'Short URL not found',
        code: 'NOT_FOUND',
        message: 'The requested short URL does not exist'
      });
    }

    const redirectTime = Date.now() - startTime;

    // Update analytics
    const analytics = new Analytics({
      shortUrl,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
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

    // Return 301 redirect
    res.status(301).redirect(url.longUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
