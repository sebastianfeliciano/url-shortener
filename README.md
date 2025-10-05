# 🔗 URL Shortener

A high-performance URL shortener built with Node.js, Express, MongoDB, and React. Features include low-latency caching, analytics tracking, QR code generation, and a modern web interface.

## ✨ Features

- **Fast URL Shortening**: 8-character random short URLs
- **Low Latency**: LRU cache for sub-millisecond lookups
- **Analytics**: Track clicks, redirect times, and user data
- **QR Codes**: Automatic QR code generation
- **NoSQL Database**: MongoDB for scalable storage
- **Modern UI**: React frontend with responsive design
- **Security**: Rate limiting, CORS, and security headers
- **Real-time Stats**: System statistics and performance metrics

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or run separately:
   npm start          # Backend only
   npm run client     # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Endpoints

#### Create Short URL
```http
POST /api/create
Content-Type: application/json

{
  "longUrl": "https://example.com/very/long/url"
}
```

**Response (201 Created):**
```json
{
  "shortUrl": "abc12345",
  "longUrl": "https://example.com/very/long/url",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "clickCount": 0
}
```

#### Redirect to Original URL
```http
GET /:shortUrl
```

**Response (301 Moved Permanently):**
- Redirects to the original URL

#### Get Analytics
```http
GET /api/analytics/:shortUrl
```

**Response (200 OK):**
```json
{
  "shortUrl": "abc12345",
  "longUrl": "https://example.com/very/long/url",
  "totalClicks": 42,
  "avgRedirectTime": 15,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastAccessed": "2024-01-01T12:00:00.000Z",
  "recentClicks": [...]
}
```

#### Get System Statistics
```http
GET /api/stats
```

**Response (200 OK):**
```json
{
  "totalUrls": 1000,
  "totalClicks": 5000,
  "cacheSize": 100,
  "cacheHitRate": "N/A"
}
```

#### Health Check
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with security middleware
- **Database**: MongoDB with Mongoose ODM
- **Caching**: LRU cache for high-performance lookups
- **Security**: Helmet.js, CORS, rate limiting
- **QR Codes**: qrcode library for QR generation

### Frontend (React)
- **Framework**: React with modern hooks
- **Styling**: CSS3 with responsive design
- **Components**: Modular component architecture
- **API Integration**: Fetch API for backend communication

### Database Schema

#### URLs Collection
```javascript
{
  shortUrl: String,      // 8-character unique identifier
  longUrl: String,       // Original URL
  createdAt: Date,       // Creation timestamp
  clickCount: Number,    // Total clicks
  lastAccessed: Date,    // Last access timestamp
  qrCode: String         // Base64 QR code data
}
```

#### Analytics Collection
```javascript
{
  shortUrl: String,      // Reference to short URL
  timestamp: Date,       // Click timestamp
  ip: String,            // User IP address
  userAgent: String,     // Browser user agent
  redirectTime: Number   // Redirect time in milliseconds
}
```

## 🔧 Configuration

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/urlshortener
PORT=5000
NODE_ENV=development
```

### Cache Configuration

The LRU cache is configured with:
- **Max Size**: 1000 entries
- **TTL**: 1 hour (3,600,000 ms)
- **Strategy**: Least Recently Used eviction

## 📊 Performance Features

### Low Latency Design
- **LRU Cache**: Sub-millisecond URL lookups
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevents abuse and ensures fair usage

### Analytics & Monitoring
- **Click Tracking**: Every redirect is logged
- **Performance Metrics**: Redirect time measurement
- **User Analytics**: IP and user agent tracking
- **Real-time Stats**: Live system statistics

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
