# URL Shortener

A  URL shortener with analytics, QR code generation, and real-time tracking built with Node.js, Express, React, and MongoDB.

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
  "lastAccessed": "2025-10-05T21:15:22.123Z"
}
```

## 🗄️ MongoDB Database

**This project uses a shared MongoDB Atlas cloud database, so you don't need to set up your own database!**

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


## 📱 Mobile Access

The application automatically detects your local IP address, so you can:
1. Access the frontend on your phone: `http://[your-ip]:3000`
2. Scan QR codes directly - they'll work on your phone
3. Share short URLs with others on the same network
