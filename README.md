# URL Shortener

A high-performance URL shortener with analytics, QR code generation, and real-time tracking built with Node.js, Express, React, and MongoDB.

## 🚀 Features

- **URL Shortening**: Create short 8-character URLs from long URLs
- **QR Code Generation**: Automatic QR code generation for each short URL
- **Analytics**: Track clicks, redirect times, and user agents
- **Real-time Stats**: View overall statistics and individual URL analytics
- **User Profiles**: User registration, authentication, and profile-linked URL management
- **Prometheus Metrics**: Built-in monitoring with Prometheus metrics endpoint
- **Security**: Helmet.js security headers and CORS protection
- **Rate Limiting**: Built-in protection against abuse

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sebastianfeliciano/url-shortener.git
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: Server port (default: 5001)
   - `NODE_ENV`: Environment mode (development/production)
   - `BASE_URL`: Base URL for QR codes (auto-detected in production)

## 🏃 Running Locally

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5001`

2. **Start the React frontend** (in a new terminal)
   ```bash
   npm run client
   ```
   Frontend runs on `http://localhost:3000`

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`
   - Health Check: `http://localhost:5001/api/health`
   - Metrics: `http://localhost:5001/metrics`

### Production Mode

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5001` and serves both API and frontend

### Docker

1. **Build the Docker image**
   ```bash
   docker build -t url-shortener .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 \
     -e MONGODB_URI=your_mongodb_uri \
     -e NODE_ENV=production \
     -e BASE_URL=http://localhost:5000 \
     url-shortener
   ```

3. **Using Docker Compose** (for monitoring with Prometheus)
   ```bash
   # Start the application
   docker-compose up -d
   
   # Start monitoring stack
   docker-compose -f docker-compose.monitoring.yml up -d
   ```
   - Application: `http://localhost:5000`
   - Prometheus: `http://localhost:9090`

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes:
- **Unit Tests**: Service logic, utilities, and models
- **Integration Tests**: End-to-end API endpoint tests
- **Coverage Threshold**: 70% minimum for branches, functions, lines, and statements

Coverage reports are generated in the `coverage/` directory.

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is deployed on **Vercel**:

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
   - Install Command: `cd client && npm install`

3. **Set environment variables** in Vercel:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`) in this case: `https://url-shortener-udw9.onrender.com`

4. **Deploy**: Vercel automatically deploys on push to main branch

**Current Deployment**: The frontend is live on Vercel and automatically deploys via GitHub Actions.

### Backend Deployment (Render)

The backend is deployed on **Render** using Docker:

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - Environment: Docker
   - Dockerfile Path: `./Dockerfile`
   - Docker Context: `.`

4. **Set environment variables** in Render:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: `10000` (Render's default)
   - `BASE_URL`: Your Render service URL

5. **Deploy**: Render automatically builds and deploys from Docker Hub

**Current Deployment**: The backend is live on Render and automatically deploys via GitHub Actions CD pipeline.

### Automated CI/CD

The project uses **GitHub Actions** for automated deployment:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs tests on every push/PR
  - Validates test coverage (70% threshold)
  - Builds Docker image on main branch

- **CD Pipeline** (`.github/workflows/cd.yml`):
  - Deploys frontend to Vercel
  - Builds and pushes Docker image to Docker Hub
  - Triggers Render deployment

### Manual Deployment Steps

If you need to deploy manually:

**Vercel (Frontend)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

**Render (Backend)**:
1. Push Docker image to Docker Hub
2. Render will auto-deploy from Docker Hub, or
3. Use Render dashboard to trigger manual deployment

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/create` | Create a short URL | `{"longUrl": "https://example.com"}` |
| `GET` | `/:shortUrl` | Redirect to original URL | - |
| `GET` | `/api/health` | Health check | - |
| `GET` | `/metrics` | Prometheus metrics | - |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/:shortUrl` | Get analytics for a specific URL |
| `GET` | `/api/stats` | Get overall statistics |
| `GET` | `/api/urls` | Get all URLs (limited to 100) |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profile/register` | Register a new user |
| `POST` | `/api/profile/login` | User login |
| `GET` | `/api/profile/:username` | Get user profile |

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

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `BASE_URL` | Base URL for QR codes | Auto-detected |
| `REACT_APP_API_URL` | Frontend API URL (production) | Auto-detected |

### Monitoring with Prometheus

The application exposes Prometheus metrics at `/metrics`:
- HTTP request metrics (total, duration, errors)
- System metrics (CPU, memory, process)

#### Running Prometheus with Docker Compose (Recommended)

1. **Start the application** (if not already running)
   ```bash
   npm run dev
   # Or use Docker:
   docker-compose up -d
   ```

2. **Start Prometheus**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

3. **Access Prometheus**
   - Prometheus UI: `http://localhost:9090`
   - Application metrics: `http://localhost:5001/metrics`

4. **Query metrics in Prometheus**
   - Open `http://localhost:9090` in your browser
   - Go to the "Graph" tab
   - Try these example queries:
     - `http_requests_total` - Total HTTP requests
     - `http_request_duration_seconds` - Request duration
     - `http_errors_total` - Total HTTP errors
     - `rate(http_requests_total[5m])` - Request rate over 5 minutes

5. **Stop Prometheus**
   ```bash
   docker-compose -f docker-compose.monitoring.yml down
   ```

#### Running Prometheus Standalone

1. **Download Prometheus**
   ```bash
   # macOS
   brew install prometheus
   
   # Or download from https://prometheus.io/download/
   ```

2. **Start Prometheus**
   ```bash
   # Using the provided configuration
   prometheus --config.file=./prometheus/prometheus.yml
   ```

3. **Access Prometheus**
   - Prometheus UI: `http://localhost:9090`
   - Make sure your application is running and accessible at the target in `prometheus.yml`

#### Prometheus Configuration

The Prometheus configuration is in `prometheus/prometheus.yml`:
- **Scrape interval**: 15 seconds (10 seconds for URL shortener)
- **Targets**: 
  - Local: `host.docker.internal:5001` (for Docker)
  - Production: `url-shortener-udw9.onrender.com` (Render backend)

To scrape a different target, edit `prometheus/prometheus.yml` and update the `targets` section.

#### Example Prometheus Queries

```promql
# Total requests per second
rate(http_requests_total[5m])

# Average request duration
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_errors_total[5m])

# Requests by status code
sum by (status) (http_requests_total)

# Requests by method
sum by (method) (http_requests_total)
```

## 📱 Project Structure

```
.
├── api/                 # API routes (Vercel serverless functions)
├── client/              # React frontend application
├── middleware/         # Express middleware (metrics, error handling)
├── tests/               # Test suite
├── coverage/            # Test coverage reports
├── prometheus/          # Prometheus configuration
├── server.js            # Main server file
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose for app
├── docker-compose.monitoring.yml  # Docker Compose for monitoring
└── render.yaml          # Render deployment configuration
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Protection against abuse
- **Input Validation**: URL validation and sanitization
- **bcrypt**: Password hashing for user authentication

## 📝 License

MIT

## 👤 Author

Sebastian Feliciano
