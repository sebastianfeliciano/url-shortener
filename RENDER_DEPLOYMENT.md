# Render Deployment Guide

## Why Render?

Render is a great alternative to Vercel, especially for full-stack apps with Express backends. It's also free for students!

## Render vs Vercel

| Feature | Vercel | Render |
|---------|--------|--------|
| Free Tier | ✅ Yes (students) | ✅ Yes |
| Express Backend | ⚠️ Serverless functions | ✅ Full Node.js |
| Static Frontend | ✅ Excellent | ✅ Good |
| Setup Complexity | Medium | Easy |
| Database | External (MongoDB Atlas) | External (MongoDB Atlas) |

**For your app, Render might be easier** because:
- Your Express server runs as a full Node.js app (not serverless)
- Simpler configuration
- Better for traditional Express + React setup

## Deploy to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free)
3. Student program: Check their education page

### Step 2: Create Web Service
1. Go to Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:

**Name:** `url-shortener` (or your choice)

**Environment:** `Node`

**Build Command:**
```bash
npm install && cd client && npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** `.` (root)

### Step 3: Environment Variables
Add these in Render dashboard:

1. **MONGODB_URI**
   ```
   mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority
   ```

2. **NODE_ENV**
   ```
   production
   ```

3. **PORT** (Render sets this automatically, but you can set it)
   ```
   10000
   ```

4. **BASE_URL** (Will auto-detect from RENDER_EXTERNAL_URL)

### Step 4: Deploy
1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Your app will be at: `https://your-app.onrender.com`

## Render Configuration File

Create `render.yaml` for easier setup:

```yaml
services:
  - type: web
    name: url-shortener
    env: node
    buildCommand: npm install && cd client && npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: mongodb-atlas
          property: connectionString
```

## Advantages of Render

✅ **Full Node.js environment** - No serverless limitations
✅ **Simpler setup** - Just point to your repo
✅ **Automatic HTTPS** - Included
✅ **Free tier** - 750 hours/month
✅ **Auto-deploy from Git** - Like Vercel

## MongoDB Atlas for Render

Same as Vercel:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs)

## After Deployment

- Your app: `https://your-app.onrender.com`
- QR codes: `https://your-app.onrender.com/xyz` (auto-detected!)

## Which Should You Use?

**Use Vercel if:**
- You want serverless functions
- You prefer Vercel's ecosystem
- You're already familiar with it

**Use Render if:**
- You want a traditional Node.js server
- You want simpler configuration
- You prefer full control over the server

**Recommendation:** Try Render first - it's simpler for your Express + React setup!

