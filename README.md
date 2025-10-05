# URL Shortener

A high-performance URL shortener with analytics, QR code generation, and real-time tracking built with Node.js, Express, React, and MongoDB.

## 🚀 Features

- **URL Shortening**: Create short 8-character URLs from long URLs
- **QR Code Generation**: Automatic QR code generation for each short URL
- **Analytics**: Track clicks, redirect times, and user agents
- **Real-time Stats**: View overall statistics and individual URL analytics
- **Dynamic IP Detection**: Automatically detects local IP for QR codes
- **Rate Limiting**: Built-in protection against abuse
- **Security**: Helmet.js security headers and CORS protection
- **Caching**: LRU cache for improved performance

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v7.0 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sebastianfeliciano/url-shortener.git
   cd url-shortener
   ```

2. **Quick setup (recommended)**
   ```bash
   npm run setup
   npm install
   ```

   **OR manual setup:**
   ```bash
   npm install
   cp env.example .env
   ```

3. **No MongoDB setup required!**
   - This project uses a shared MongoDB Atlas cloud database
   - No need to install or start MongoDB locally
   - Just run the application and it will connect automatically

## 🏃‍♂️ Running Locally

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5001` (or your local IP)

2. **Start the React frontend** (in a new terminal)
   ```bash
   npm run client
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`
   - Network access: `http://[your-local-ip]:3000` and `http://[your-local-ip]:5001`

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/create` | Create a short URL | `{"longUrl": "https://example.com"}` |
| `GET` | `/:shortUrl` | Redirect to original URL | - |
| `GET` | `/api/health` | Health check | - |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/:shortUrl` | Get analytics for a specific URL |
| `GET` | `/api/stats` | Get overall statistics |
| `GET` | `/api/urls` | Get all URLs (limited to 100) |

## 🔢 HTTP Status Codes

The API uses specific HTTP status codes to indicate the result of operations:

### 201 Created
- **Used for**: `POST /api/create`
- **Meaning**: A new short URL has been successfully created
- **Response**: Returns the created short URL with QR code and metadata
- **Example**: When you create a new short URL, the server responds with 201 to indicate successful creation

### 301 Moved Permanently
- **Used for**: `GET /:shortUrl` (redirect endpoint)
- **Meaning**: The short URL redirects to the original long URL
- **Response**: Browser automatically redirects to the target URL
- **Example**: When someone clicks `http://yoursite.com/abc12345`, they get a 301 redirect to the original URL

### Other Status Codes

| Code | Method | Endpoint | Meaning |
|------|--------|----------|---------|
| `200` | `GET` | `/api/health`, `/api/analytics/:shortUrl`, `/api/stats`, `/api/urls` | Success - data returned |
| `302` | `GET` | `/:shortUrl` | Alternative redirect (also used for redirects) |
| `400` | `POST` | `/api/create` | Bad Request - invalid URL format or missing data |
| `404` | `GET` | `/:shortUrl`, `/api/analytics/:shortUrl` | Not Found - short URL doesn't exist |
| `429` | `ALL` | All endpoints | Too Many Requests - rate limit exceeded |
| `500` | `ALL` | All endpoints | Internal Server Error - server-side error |

### Why These Status Codes?

**201 Created vs 200 OK:**
- `201` specifically indicates that a new resource (short URL) was created
- `200` would just mean "request processed successfully"
- `201` is more semantically correct for resource creation

**301 Moved Permanently:**
- Indicates that the short URL permanently redirects to the long URL
- Search engines understand this is a permanent redirect
- Browsers cache the redirect for better performance
- Alternative: `302 Found` could be used for temporary redirects

### Example API Usage

**Create a short URL:**
```bash
curl -X POST http://localhost:5001/api/create \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://www.google.com"}'
```

**Response:**
```json
{
  "shortUrl": "abc12345",
  "longUrl": "https://www.google.com",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "clickCount": 0
}
```

**Get analytics:**
```bash
curl http://localhost:5001/api/analytics/abc12345
```

**Response:**
```json
{
  "shortUrl": "abc12345",
  "longUrl": "https://www.google.com",
  "totalClicks": 5,
  "avgRedirectTime": 45,
  "createdAt": "2025-10-05T20:30:30.375Z",
  "lastAccessed": "2025-10-05T21:15:22.123Z",
  "recentClicks": [...]
}
```

## 🗄️ MongoDB Database

**This project uses a shared MongoDB Atlas cloud database, so you don't need to set up your own database!**

### Collections

**`urls` Collection:**
```javascript
{
  _id: ObjectId,
  shortUrl: String,        // 8-character short code
  longUrl: String,         // Original URL
  clickCount: Number,      // Total clicks
  qrCode: String,          // Base64 QR code image
  createdAt: Date,         // Creation timestamp
  lastAccessed: Date,      // Last click timestamp
  __v: Number
}
```

**`analytics` Collection:**
```javascript
{
  _id: ObjectId,
  shortUrl: String,        // Reference to short URL
  timestamp: Date,         // Click timestamp
  ip: String,              // User IP address
  userAgent: String,       // Browser/client info
  redirectTime: Number,    // Redirect time in ms
  __v: Number
}
```

### MongoDB Commands

**Connect to the shared Atlas database:**
```bash
mongosh "mongodb+srv://sebastian:your-password@cluster0.xxxxx.mongodb.net/urlshortener"
```

**View all URLs:**
```javascript
db.urls.find().pretty()
```

**View analytics:**
```javascript
db.analytics.find().limit(10).pretty()
```

**Count total URLs:**
```javascript
db.urls.countDocuments()
```

**Count total clicks:**
```javascript
db.analytics.countDocuments()
```

**Clear all data:**
```javascript
db.urls.deleteMany({})
db.analytics.deleteMany({})
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
Tests cover:
- API endpoint functionality
- URL creation and validation
- Redirect functionality
- Analytics tracking
- Error handling

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/urlshortener` |
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `BASE_URL` | Base URL for QR codes | Auto-detected |

### Dynamic IP Detection

The application automatically detects your local IP address for QR code generation, making it work seamlessly across different networks without manual configuration.

## 🚀 Deployment

### Docker (Recommended)

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 5001
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t url-shortener .
   docker run -p 5001:5001 -e MONGODB_URI=mongodb://host.docker.internal:27017/urlshortener url-shortener
   ```

### Traditional Deployment

1. **Set up production environment variables**
2. **Build the application:** `npm run build`
3. **Start with PM2:** `pm2 start server.js --name url-shortener`
4. **Set up reverse proxy** (nginx/Apache)
5. **Configure SSL certificate**

## 📱 Mobile Access

The application automatically detects your local IP address, so you can:
1. Access the frontend on your phone: `http://[your-ip]:3000`
2. Scan QR codes directly - they'll work on your phone
3. Share short URLs with others on the same network

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: URL format validation
- **MongoDB Injection Protection**: Mongoose ODM protection

## 📈 Performance

- **LRU Cache**: 1000 URLs cached for 1 hour
- **MongoDB Indexing**: Optimized queries
- **Compressed Responses**: Gzip compression
- **Static File Serving**: Optimized React build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sebastian Feliciano**
- GitHub: [@sebastianfeliciano](https://github.com/sebastianfeliciano)

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Check your internet connection
ping google.com
# Verify the Atlas connection string is correct
# Make sure your IP is whitelisted in MongoDB Atlas
```

**Port Already in Use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

**QR Codes Show Localhost:**
- Make sure you're using a new short URL created after the IP detection fix
- Check that both frontend and backend are using the same IP address

**Frontend Can't Connect to Backend:**
- Verify the client config is using the correct IP address
- Check that both servers are running
- Ensure no firewall is blocking the ports

### Getting Help

1. Check the [Issues](https://github.com/sebastianfeliciano/url-shortener/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages