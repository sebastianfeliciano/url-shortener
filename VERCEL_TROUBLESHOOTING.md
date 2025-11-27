# Vercel Deployment Troubleshooting

## Recent Fixes Applied

1. **Updated `vercel.json`**:
   - Changed API route destination from `/server.js` to `/api/index.js`
   - Properly configured `@vercel/static-build` for the React client
   - Set `distDir` to `build` for the client build output

2. **Improved MongoDB Connection**:
   - Added connection reuse check for serverless environments
   - Added timeouts to prevent hanging connections

3. **Removed Conflicting Files**:
   - Deleted `client/vercel.json` (conflicted with root `vercel.json`)

4. **Updated Client Config**:
   - Client now uses `window.location.origin` in production for API calls

## Vercel Configuration Checklist

### Environment Variables
Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

- `MONGODB_URI`: `mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority`
- `NODE_ENV`: `production`
- `PORT`: (optional, Vercel handles this)

### Build Settings
In Vercel Dashboard → Settings → General:

- **Framework Preset**: `Other` (not Create React App)
- **Root Directory**: Leave empty (or set to `.` if needed)
- **Build Command**: Leave empty (handled by `vercel.json`)
- **Output Directory**: Leave empty (handled by `vercel.json`)

### Common Issues

#### Issue: "No Output Directory found"
**Solution**: The `vercel.json` now correctly specifies `distDir: "build"` in the static-build config.

#### Issue: "Build failed"
**Solution**: 
1. Check that `client/package.json` has a `build` script
2. Ensure all dependencies are in `package.json` (not just `devDependencies`)
3. Check Vercel build logs for specific errors

#### Issue: "API routes not working"
**Solution**: 
1. Verify `api/index.js` exists and exports the Express app
2. Check that routes in `vercel.json` point to `/api/index.js`
3. Ensure API routes start with `/api/` prefix

#### Issue: "MongoDB connection timeout"
**Solution**:
1. Whitelist Vercel IPs in MongoDB Atlas (or use `0.0.0.0/0` for all IPs)
2. Check that `MONGODB_URI` environment variable is set correctly
3. The connection now has shorter timeouts for serverless environments

## Testing the Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **API Root**: `https://your-app.vercel.app/api/`
3. **Frontend**: `https://your-app.vercel.app/`

## Manual Deployment Steps

If automatic deployment fails:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables: `vercel env add MONGODB_URI`

## Next Steps

1. Check Vercel deployment logs for specific errors
2. Verify environment variables are set
3. Test the deployed API endpoints
4. Check MongoDB Atlas network access settings

