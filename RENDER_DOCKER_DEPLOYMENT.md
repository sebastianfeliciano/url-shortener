# Docker + CI/CD Deployment to Render

This guide explains how to deploy your URL shortener to Render using Docker and GitHub Actions CI/CD.

## Architecture

1. **GitHub Actions** builds Docker image on push to `main`
2. **Docker Hub** stores the image
3. **Render** pulls and deploys the Docker image automatically

## Prerequisites

1. Docker Hub account
2. Render account
3. GitHub repository connected to Render

## Step 1: Set Up Docker Hub

1. Create account at https://hub.docker.com
2. Create a repository named `url-shortener`

## Step 2: Set Up Render Service

### Option A: Using render.yaml (Recommended)

1. Go to Render Dashboard → New → Blueprint
2. Connect your GitHub repository
3. Render will detect `render.yaml` and configure automatically

### Option B: Manual Setup

1. Go to Render Dashboard → New → Web Service
2. Select your GitHub repository
3. Configure:
   - **Name:** `url-shortener`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Context:** `.`
   - **Branch:** `main`

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### Required Secrets:

1. **DOCKER_USERNAME**
   - Your Docker Hub username

2. **DOCKER_PASSWORD**
   - Your Docker Hub password (or access token)

3. **RENDER_API_KEY** (Optional - for manual deployment trigger)
   - Get from: Render Dashboard → Account Settings → API Keys
   - Create a new API key

4. **RENDER_SERVICE_ID** (Optional - for manual deployment trigger)
   - Get from: Render Dashboard → Your Service → Settings
   - Copy the Service ID

### Environment Variables in Render:

1. Go to Render Dashboard → Your Service → Environment
2. Add:
   - **MONGODB_URI**: `mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority`
   - **NODE_ENV**: `production`
   - **PORT**: `10000` (Render sets this automatically, but you can specify)

## Step 4: Configure Render to Use Docker Hub

### Option 1: Auto-deploy from Docker Hub (Recommended)

1. In Render Dashboard → Your Service → Settings
2. Under "Docker", set:
   - **Docker Image URL**: `your-dockerhub-username/url-shortener:latest`
   - **Auto-Deploy**: Enabled
3. Render will automatically pull new images when they're pushed to Docker Hub

### Option 2: Use render.yaml (Already configured)

The `render.yaml` file is already configured for Docker deployment.

## Step 5: How It Works

### CI/CD Flow:

```
Push to main branch
    ↓
GitHub Actions triggers
    ↓
Build Docker image
    ↓
Push to Docker Hub
    ↓
Render detects new image (or triggered via API)
    ↓
Render pulls and deploys
    ↓
App is live!
```

### GitHub Actions Workflow:

The `.github/workflows/cd.yml` workflow:
1. Builds Docker image using `Dockerfile`
2. Pushes to Docker Hub with tags:
   - `latest` (always latest)
   - `${{ github.sha }}` (specific commit)
3. Optionally triggers Render deployment via API

## Step 6: Verify Deployment

After pushing to `main`:

1. Check GitHub Actions: Repository → Actions tab
2. Check Docker Hub: Your repository should show the new image
3. Check Render: Dashboard → Your Service → Events (should show deployment)
4. Test your app: `https://your-app.onrender.com/api/health`

## Troubleshooting

### Build fails in GitHub Actions?

- Check Docker Hub credentials in GitHub Secrets
- Verify Dockerfile is correct
- Check build logs in GitHub Actions

### Render doesn't deploy?

- Verify Docker Image URL in Render settings
- Check if auto-deploy is enabled
- Manually trigger deployment in Render dashboard
- Check Render logs for errors

### 500 errors after deployment?

- Check MongoDB connection string
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly

### Port issues?

- Render sets `PORT` automatically
- Dockerfile uses `EXPOSE ${PORT:-5000}` (defaults to 5000)
- Server.js uses `process.env.PORT || PORT`

## Manual Deployment

If you need to deploy manually:

```bash
# Build locally
docker build -t your-username/url-shortener:latest .

# Push to Docker Hub
docker push your-username/url-shortener:latest

# Render will auto-deploy, or trigger manually in dashboard
```

## Advantages of Docker Deployment

✅ **Consistent builds** - Same image in dev, test, and production  
✅ **Faster deployments** - Pre-built images deploy quickly  
✅ **Version control** - Tag images with commit SHA  
✅ **CI/CD integration** - Automated builds and deployments  
✅ **Easy rollback** - Deploy previous image versions  

## Next Steps

1. Push to `main` branch
2. Watch GitHub Actions build
3. Check Render dashboard for deployment
4. Test your deployed app!

