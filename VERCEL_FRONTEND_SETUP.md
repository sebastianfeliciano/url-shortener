# Vercel Frontend + Render Backend Setup

This guide explains how to deploy the frontend to Vercel while using Render for the backend.

## Architecture

```
Frontend (Vercel) → Backend API (Render)
```

- **Frontend**: React app deployed on Vercel
- **Backend**: Express API deployed on Render (Docker)
- **Database**: MongoDB Atlas

## Step 1: Deploy Backend to Render

First, deploy your backend to Render following `RENDER_DOCKER_DEPLOYMENT.md`.

After deployment, you'll get a URL like:
```
https://url-shortener.onrender.com
```

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Other` or `Create React App`
   - **Root Directory**: `client` (or leave empty if Vercel detects it)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Option B: Using Vercel CLI

```bash
cd client
npm install -g vercel
vercel
```

## Step 3: Set Environment Variables in Vercel

**Critical Step!** You must set the backend URL:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:

   **Name**: `REACT_APP_API_URL`  
   **Value**: `https://your-app.onrender.com`  
   (Replace with your actual Render backend URL)

   **Example**:
   ```
   REACT_APP_API_URL=https://url-shortener.onrender.com
   ```

3. Make sure it's set for:
   - ✅ Production
   - ✅ Preview (optional, but recommended)
   - ✅ Development (optional)

4. **Redeploy** your Vercel project after adding the environment variable

## Step 4: How It Works

### Frontend (Vercel)
- Serves static React files
- Makes API calls to Render backend
- Uses `REACT_APP_API_URL` environment variable

### Backend (Render)
- Handles all API requests (`/api/*`)
- Connects to MongoDB Atlas
- Serves the Express API

### API Flow
```
User → Vercel Frontend → Render Backend → MongoDB Atlas
```

## Step 5: CORS Configuration

The backend (`server.js`) already has CORS enabled, so it should accept requests from Vercel.

If you encounter CORS errors, verify in `server.js`:
```javascript
app.use(cors()); // This allows all origins
```

## Step 6: Testing

1. **Frontend**: `https://your-app.vercel.app`
2. **Backend Health**: `https://your-app.onrender.com/api/health`
3. **Test API from Frontend**: Try logging in or creating a short URL

## Troubleshooting

### Frontend can't connect to backend?

1. Check `REACT_APP_API_URL` in Vercel environment variables
2. Verify the Render backend is running: `https://your-app.onrender.com/api/health`
3. Check browser console for CORS errors
4. Verify the URL doesn't have a trailing slash

### 401/403 errors?

- Check MongoDB connection in Render
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Environment variable not working?

- **Redeploy** Vercel after adding environment variables
- Environment variables are injected at build time
- Check Vercel build logs to verify the variable is set

### Build fails in Vercel?

- Make sure `client/package.json` has a `build` script
- Check that all dependencies are in `package.json` (not just `devDependencies`)
- Verify the build command: `npm run build`

## Advantages of This Setup

✅ **Vercel**: Fast CDN for static frontend  
✅ **Render**: Full Node.js environment for backend  
✅ **Separation**: Frontend and backend can scale independently  
✅ **Free Tier**: Both platforms offer free tiers for students  

## Alternative: Full-Stack on Render

If you prefer simplicity, you can deploy everything on Render:
- Frontend and backend together
- Single deployment
- See `RENDER_QUICK_START.md`

## Quick Reference

**Render Backend URL**: `https://your-app.onrender.com`  
**Vercel Frontend URL**: `https://your-app.vercel.app`  
**Environment Variable**: `REACT_APP_API_URL=https://your-app.onrender.com`

