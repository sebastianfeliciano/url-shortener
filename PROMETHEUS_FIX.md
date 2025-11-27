# Prometheus Configuration Fix

## Problem
Prometheus was trying to scrape metrics from the Vercel frontend URL (`url-shortener-five-peach.vercel.app`), which serves HTML instead of Prometheus metrics.

## Solution
The `/metrics` endpoint is on the **Render backend**, not the Vercel frontend.

## Correct Configuration

### For Local Development
```yaml
- targets: ['host.docker.internal:5001']  # Your local backend
```

### For Production
```yaml
- targets: ['url-shortener-udw9.onrender.com']  # Render backend
```

**NOT:**
- ❌ `url-shortener-five-peach.vercel.app` (This is the frontend, serves HTML)
- ✅ `url-shortener-udw9.onrender.com` (This is the backend, serves metrics)

## Verify Metrics Endpoint

Test that metrics are accessible:

```bash
# Local
curl http://localhost:5001/metrics

# Production (Render backend)
curl https://url-shortener-udw9.onrender.com/metrics
```

You should see Prometheus-formatted metrics, not HTML.

## Update Your Prometheus Config

If you're running Prometheus locally (not via Docker), update your `prometheus.yml`:

1. **Find your Prometheus config file** (usually in the Prometheus directory)
2. **Update the target** to point to your Render backend:
   ```yaml
   - targets: ['url-shortener-udw9.onrender.com']
   ```
3. **Restart Prometheus** or reload the config:
   ```bash
   # Send SIGHUP to reload config
   kill -HUP <prometheus-pid>
   
   # Or restart Prometheus
   ./prometheus --config.file=prometheus.yml
   ```

## Check Prometheus Targets

1. Open http://localhost:9090
2. Go to **Status** → **Targets**
3. Verify the target shows **UP** and is scraping successfully
4. The endpoint should be `url-shortener-udw9.onrender.com:443/metrics` (HTTPS)

