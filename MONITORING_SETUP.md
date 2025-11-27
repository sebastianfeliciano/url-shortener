# Prometheus & Grafana Monitoring Setup

This guide explains how to set up Prometheus and Grafana to monitor your URL Shortener application.

## 📊 Metrics Exposed

The application exposes the following Prometheus metrics:

### HTTP Metrics
- **`http_requests_total`**: Total number of HTTP requests (labeled by method, route, status)
- **`http_request_duration_seconds`**: Request latency histogram (labeled by method, route, status)
- **`http_errors_total`**: Total number of HTTP errors (4xx, 5xx status codes)

### System Metrics
- **`database_connection_status`**: Database connection status (1 = connected, 0 = disconnected)
- **`active_connections`**: Number of active connections
- **Default Node.js metrics**: CPU, memory, process metrics (via prom-client)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start Prometheus and Grafana:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. **Access the services:**
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3001
     - Username: `admin`
     - Password: `admin`

3. **Update Prometheus configuration** (if needed):
   - Edit `prometheus/prometheus.yml`
   - Update the target URL if your app is running on a different port
   - Restart Prometheus: `docker-compose -f docker-compose.monitoring.yml restart prometheus`

### Option 2: Manual Setup

#### Prometheus

1. **Download Prometheus:**
   ```bash
   wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
   tar xvfz prometheus-*.tar.gz
   cd prometheus-*
   ```

2. **Copy configuration:**
   ```bash
   cp ../prometheus/prometheus.yml /etc/prometheus/prometheus.yml
   ```

3. **Start Prometheus:**
   ```bash
   ./prometheus --config.file=/etc/prometheus/prometheus.yml
   ```

#### Grafana

1. **Install Grafana:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y software-properties-common
   sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
   sudo apt-get update
   sudo apt-get install grafana

   # Or use Docker
   docker run -d -p 3001:3000 grafana/grafana
   ```

2. **Configure Grafana:**
   - Access http://localhost:3001
   - Login with admin/admin
   - Add Prometheus as data source: http://localhost:9090
   - Import the dashboard from `grafana/dashboards/url-shortener-dashboard.json`

## 📈 Viewing Metrics

### Prometheus UI

1. Open http://localhost:9090
2. Go to **Status** → **Targets** to verify your app is being scraped
3. Go to **Graph** to query metrics:
   - `rate(http_requests_total[5m])` - Request rate
   - `histogram_quantile(0.95, http_request_duration_seconds_bucket)` - 95th percentile latency
   - `rate(http_errors_total[5m])` - Error rate

### Grafana Dashboard

1. Open http://localhost:3001
2. Login with `admin`/`admin`
3. The dashboard should auto-load, or import from `grafana/dashboards/url-shortener-dashboard.json`

## 🔧 Configuration

### Prometheus Configuration

Edit `prometheus/prometheus.yml` to update scrape targets:

```yaml
scrape_configs:
  - job_name: 'url-shortener'
    static_configs:
      - targets: ['localhost:5001']  # Your app URL
```

**For Production (Render):**
```yaml
scrape_configs:
  - job_name: 'url-shortener'
    static_configs:
      - targets: ['url-shortener-udw9.onrender.com']
```

**Note:** Render may require Prometheus to scrape via HTTPS. You may need to use a service like [Grafana Cloud](https://grafana.com/products/cloud/) or run Prometheus on a server that can access your Render app.

### Application Metrics Endpoint

Your application exposes metrics at:
- **Local**: http://localhost:5001/metrics
- **Production**: https://url-shortener-udw9.onrender.com/metrics

## 📊 Example Queries

### Request Rate
```
sum(rate(http_requests_total[5m])) by (method)
```

### Error Rate
```
sum(rate(http_errors_total[5m])) by (status)
```

### 95th Percentile Latency
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### Average Latency
```
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### Database Connection Status
```
database_connection_status
```

## 🐳 Docker Compose Commands

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Stop monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# Stop and remove volumes
docker-compose -f docker-compose.monitoring.yml down -v
```

## 🔍 Troubleshooting

### Prometheus can't scrape metrics

1. **Check if metrics endpoint is accessible:**
   ```bash
   curl http://localhost:5001/metrics
   ```

2. **Check Prometheus targets:**
   - Go to http://localhost:9090/status/targets
   - Verify the target is "UP"

3. **Check firewall/network:**
   - Ensure Prometheus can reach your app
   - For Docker, use `host.docker.internal` instead of `localhost`

### Grafana can't connect to Prometheus

1. **Check Prometheus is running:**
   ```bash
   curl http://localhost:9090/-/healthy
   ```

2. **Verify data source URL:**
   - In Grafana: Configuration → Data Sources → Prometheus
   - URL should be `http://prometheus:9090` (Docker) or `http://localhost:9090` (local)

## 📝 Notes

- Metrics are collected automatically via middleware
- No code changes needed to add new metrics
- Default Node.js metrics (CPU, memory) are included
- Database connection status updates automatically

## 🚀 Production Deployment

For production, consider:
1. **Grafana Cloud**: Free tier available, no self-hosting needed
2. **Prometheus on VPS**: Run Prometheus on a separate server
3. **Service Mesh**: Use Istio/Linkerd for advanced metrics
4. **Alerting**: Set up Prometheus Alertmanager for notifications

