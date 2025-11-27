# Quick Start: Deploy to Render

## Why Render for Backend?

✅ **Better for Express + MongoDB** - Full Node.js environment (not serverless)  
✅ **Simpler Setup** - No complex serverless function configuration  
✅ **Free Tier** - 750 hours/month (perfect for students)  
✅ **Auto-deploy from Git** - Just like Vercel  

## Step-by-Step Deployment

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub (free)

### 2. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `sebastianfeliciano/url-shortener`
3. Select the repository

### 3. Configure Service

**Basic Settings:**
- **Name:** `url-shortener` (or your choice)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `.` (leave empty)

**Build & Deploy:**
- **Environment:** `Node`
- **Build Command:** 
  ```bash
  npm install && cd client && npm install && npm run build
  ```
- **Start Command:**
  ```bash
  node server.js
  ```

### 4. Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

1. **MONGODB_URI**
   ```
   mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority
   ```

2. **NODE_ENV**
   ```
   production
   ```

3. **PORT** (optional - Render sets this automatically)
   ```
   10000
   ```

### 5. Deploy!

Click **"Create Web Service"**

Render will:
1. Install dependencies
2. Build the React client
3. Start your Express server
4. Give you a URL like: `https://url-shortener.onrender.com`

## After Deployment

✅ Your app: `https://your-app.onrender.com`  
✅ API: `https://your-app.onrender.com/api/health`  
✅ QR codes: `https://your-app.onrender.com/xyz` (auto-detected!)

## MongoDB Atlas Setup

Make sure MongoDB Atlas allows Render's IPs:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Add: `0.0.0.0/0` (allows all IPs - safe for free tier)

## Update Frontend Config (if needed)

The frontend should automatically use the deployed URL. If you need to update it manually:

1. In Render dashboard, go to your service
2. Copy the URL (e.g., `https://url-shortener.onrender.com`)
3. Update `client/src/config.js` if needed (but it should auto-detect)

## Troubleshooting

**Build fails?**
- Check build logs in Render dashboard
- Make sure `package.json` has all dependencies

**500 errors?**
- Check MongoDB connection string
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check Render logs for specific errors

**API not working?**
- Test: `https://your-app.onrender.com/api/health`
- Should return: `{"status":"ok","timestamp":"..."}`

## Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| Express Backend | ✅ Full Node.js | ⚠️ Serverless (complex) |
| Setup | ✅ Simple | ⚠️ Complex config |
| Free Tier | ✅ 750 hrs/month | ✅ Generous |
| **Recommendation** | ✅ **Use for backend** | ✅ Use for frontend only |

**Best Practice:** Use Render for full-stack deployment, or Render for backend + Vercel for frontend.

