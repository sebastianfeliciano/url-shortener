# Branch Protection Setup

To ensure only the `main` branch deploys automatically, configure branch protection rules in GitHub:

## Steps to Configure Branch Protection

1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Add a rule for `main` branch:
   - **Branch name pattern**: `main`
   - **Require a pull request before merging**: ✅ Enabled
   - **Require status checks to pass before merging**: ✅ Enabled
     - Select: `test` (from CI workflow)
   - **Require branches to be up to date before merging**: ✅ Enabled
   - **Require conversation resolution before merging**: ✅ Enabled (optional)
   - **Do not allow bypassing the above settings**: ✅ Enabled

## Workflow Behavior

- **Pull Requests**: CI runs tests and checks coverage, but does NOT deploy
- **Push to `main`**: CI runs tests, and if passing, CD deploys automatically
- **Push to other branches**: Only CI runs (no deployment)

## Required Secrets

Add these secrets in GitHub Settings → Secrets and variables → Actions:

1. **MONGODB_URI**: Your MongoDB Atlas connection string
2. **VERCEL_TOKEN**: Your Vercel authentication token (for Vercel deployment)
3. **DOCKER_USERNAME**: Your Docker Hub username (optional, for Docker deployment)
4. **DOCKER_PASSWORD**: Your Docker Hub password/token (optional)

## Getting Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy and add to GitHub secrets as `VERCEL_TOKEN`

