# Quick Vercel Setup (3 Methods)

## 🎯 Method 1: Vercel Dashboard (Easiest - 5 minutes)

1. **Go to**: https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** your repository
4. **Configure**:
   - Framework Preset: **Other** (or "No Framework")
     - *Why? Your app has Express backend + React frontend in /client folder*
     - *Vercel needs manual configuration for this setup*
   - Root Directory: **.** (leave as root)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`
5. **Add Environment Variables**:
   - `MONGODB_URI` = `mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority`
   - `NODE_ENV` = `production`
6. **Click "Deploy"**
7. **Done!** Your app will be at `https://your-project.vercel.app`

## 🖥️ Method 2: Vercel CLI (Command Line)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
cd /Users/sebastianfeliciano/Desktop/softwateDevassignment1
vercel

# Add environment variables
vercel env add MONGODB_URI
# Paste: mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority

vercel env add NODE_ENV
# Paste: production

# Deploy to production
vercel --prod
```

## 🤖 Method 3: Automated via GitHub Actions (Already Set Up!)

1. **Get Vercel Token**:
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Copy the token

2. **Add to GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VERCEL_TOKEN`
   - Value: [paste your token]
   - Click "Add secret"

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

4. **CD pipeline automatically deploys!** 🚀

## ⚠️ Important: MongoDB Atlas IP Whitelist

Before deploying, update MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter: `0.0.0.0/0` (allows all IPs)
4. Click "Confirm"

This allows Vercel's servers to connect to your database.

## ✅ After Deployment

Your app will be live at: `https://your-project-name.vercel.app`

QR codes will automatically show: `https://your-project-name.vercel.app/xyz`

Test it:
- Health: `https://your-app.vercel.app/api/health`
- Frontend: `https://your-app.vercel.app/`
