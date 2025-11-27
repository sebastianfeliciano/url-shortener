# CI/CD Pipeline Setup

## Overview

This project has a complete CI/CD pipeline configured with GitHub Actions that:
- ✅ Runs tests and checks coverage (must be ≥70%)
- ✅ Builds the application
- ✅ Containerizes with Docker
- ✅ Deploys automatically only from `main` branch

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Actions:**
- Installs dependencies
- Runs linter (if configured)
- Runs test suite with coverage
- **Fails if coverage is below 70%**
- Builds the application
- Builds and tests Docker image

### 2. CD Pipeline (`.github/workflows/cd.yml`)
**Triggers:**
- **Only** push to `main` branch
- Manual trigger via `workflow_dispatch`

**Actions:**
- Deploys to Vercel (production)
- Pushes Docker image to Docker Hub (if credentials provided)

## Required GitHub Secrets

Add these in: **Settings → Secrets and variables → Actions**

1. **MONGODB_URI** (Required)
   - Your MongoDB Atlas connection string
   - Used for running tests

2. **VERCEL_TOKEN** (Required for Vercel deployment)
   - Get from: https://vercel.com/account/tokens
   - Used to deploy to Vercel

3. **DOCKER_USERNAME** (Optional)
   - Your Docker Hub username
   - Only needed if deploying Docker images

4. **DOCKER_PASSWORD** (Optional)
   - Your Docker Hub access token
   - Get from: https://hub.docker.com/settings/security

## Branch Protection Setup

To ensure only `main` branch deploys:

1. Go to **Settings → Branches**
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: `test` (from CI workflow)
   - ✅ Require branches to be up to date
   - ✅ Do not allow bypassing

## How It Works

### Development Flow:
1. Developer pushes to `develop` branch
2. CI runs: tests + coverage check
3. If passing, create PR to `main`

### Production Flow:
1. PR merged to `main` branch
2. CI runs: tests + coverage check
3. If passing, CD automatically:
   - Deploys to Vercel
   - Pushes Docker image

### Coverage Enforcement:
- Pipeline **fails** if any metric is below 70%:
  - Lines coverage
  - Statements coverage
  - Functions coverage
  - Branches coverage

## Testing Locally

### Run tests with coverage:
```bash
npm run test:coverage
```

### Build Docker image:
```bash
docker build -t url-shortener .
```

### Run Docker container:
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI="your-connection-string" \
  -e NODE_ENV=production \
  url-shortener
```

### Using docker-compose:
```bash
docker-compose up
```

## Deployment URLs

After deployment, your app will be available at:
- **Vercel**: `https://your-project.vercel.app`
- **QR Codes**: Will automatically use the deployed URL (e.g., `https://your-project.vercel.app/xyz`)

## Troubleshooting

### CI Fails on Coverage:
- Add more tests to increase coverage
- Check `coverage/coverage-summary.json` for details

### CD Doesn't Deploy:
- Check that you're pushing to `main` branch
- Verify `VERCEL_TOKEN` secret is set correctly
- Check GitHub Actions logs for errors

### Docker Build Fails:
- Ensure all dependencies are in `package.json`
- Check `.dockerignore` isn't excluding needed files

