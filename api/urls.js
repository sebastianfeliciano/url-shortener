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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const urls = await Url.find({}, 'shortUrl longUrl clickCount createdAt lastAccessed')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent large responses

    res.status(200).json(urls);

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
