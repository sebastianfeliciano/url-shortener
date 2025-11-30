const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP Request Counter - tracks total requests by method, route, and status
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// HTTP Request Duration Histogram - tracks request latency
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30], // buckets in seconds
  registers: [register]
});

// HTTP Errors Counter - tracks errors (4xx, 5xx)
const httpErrorsTotal = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Database Connection Status Gauge
const dbConnectionStatus = new promClient.Gauge({
  name: 'database_connection_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Active Connections Gauge
const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  // Normalize route - use route path if available, otherwise use request path
  // Remove query strings and normalize
  const route = req.route ? req.route.path : (req.path || '/');
  const method = req.method;

  // Track active connections
  activeConnections.inc();

  // Override res.end to capture response status and duration
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const status = res.statusCode || 200;
    const statusStr = String(status); // Convert to string for Prometheus labels
    
    // Decrement active connections
    activeConnections.dec();

    // Record metrics with normalized labels
    const labels = { method, route, status: statusStr };
    
    // Request count metric
    httpRequestsTotal.inc(labels);
    
    // Latency metric (histogram)
    httpRequestDuration.observe(labels, duration);

    // Error count metric (4xx and 5xx status codes)
    if (status >= 400) {
      httpErrorsTotal.inc(labels);
    }

    // Call original end
    originalEnd.apply(this, args);
  };

  next();
};

// Function to update database connection status
const updateDbStatus = (mongoose) => {
  const status = mongoose.connection.readyState === 1 ? 1 : 0;
  dbConnectionStatus.set(status);
};

// Function to get metrics in Prometheus format
const getMetrics = async () => {
  return await register.metrics();
};

module.exports = {
  metricsMiddleware,
  updateDbStatus,
  getMetrics,
  register
};

