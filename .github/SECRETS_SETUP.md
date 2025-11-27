# GitHub Secrets Setup Guide

## Required Secrets for CI/CD

Add these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. MONGODB_URI (Required)
```
Name: MONGODB_URI
Value: mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority
```

### 2. VERCEL_TOKEN (Required for Vercel Deployment)
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token
5. Add to GitHub secrets:
```
Name: VERCEL_TOKEN
Value: [your-vercel-token]
```

### 3. DOCKER_USERNAME (Optional - for Docker Hub)
```
Name: DOCKER_USERNAME
Value: [your-docker-hub-username]
```

### 4. DOCKER_PASSWORD (Optional - for Docker Hub)
1. Go to https://hub.docker.com/settings/security
2. Create an access token
3. Add to GitHub secrets:
```
Name: DOCKER_PASSWORD
Value: [your-docker-access-token]
```

## How It Works

- **CI Pipeline**: Runs on every push/PR, uses MONGODB_URI for tests
- **CD Pipeline**: Only runs on `main` branch, uses all secrets for deployment
- **Branch Protection**: Configure in Settings → Branches to require CI to pass before merging to main

## Testing Locally

You can test the Docker build locally:
```bash
docker build -t url-shortener .
docker run -p 5000:5000 -e MONGODB_URI="your-uri" url-shortener
```

