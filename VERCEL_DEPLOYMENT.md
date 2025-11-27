# Vercel Deployment Guide

## Option 1: Deploy via Vercel Dashboard (Easiest - Recommended)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (free for students)
3. Apply for student program: https://vercel.com/education

### Step 2: Import Your Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Project Settings

**Framework Preset:** 
- Select **"Other"** or **"No Framework"**
- This is because you have a custom Express + React setup
- Vercel will not auto-configure, so you'll set build commands manually

**Root Directory:** Leave as `.` (root)

**Build Command:**
```
cd client && npm install && npm run build
```

**Output Directory:**
```
client/build
```

**Install Command:**
```
npm install
```

### Step 4: Add Environment Variables

Click "Environment Variables" and add:

1. **MONGODB_URI**
   ```
   mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority
   ```

2. **NODE_ENV**
   ```
   production
   ```

3. **BASE_URL** (Optional - will auto-detect)
   ```
   https://your-project-name.vercel.app
   ```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd /Users/sebastianfeliciano/Desktop/softwateDevassignment1
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time)
- Project name? (e.g., `url-shortener`)
- Directory? **./client**
- Override settings? **No**

### Step 4: Add Environment Variables
```bash
vercel env add MONGODB_URI
# Paste: mongodb+srv://giuseppi:supersecretpassword@kambaz.auzwwz1.mongodb.net/urlshortener?retryWrites=true&w=majority

vercel env add NODE_ENV
# Paste: production
```

### Step 5: Deploy
```bash
vercel --prod
```

## Option 3: Automated Deployment via GitHub Actions (Already Set Up!)

Your CI/CD pipeline is already configured! Just:

1. **Add Vercel Token to GitHub Secrets:**
   - Go to: https://vercel.com/account/tokens
   - Create a new token
   - Copy it
   - Go to GitHub → Settings → Secrets → Actions
   - Add secret: `VERCEL_TOKEN` = [your-token]

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **CD pipeline will automatically deploy!**

## Important: Vercel Configuration

Since your app has both backend (server.js) and frontend (client/), you need to configure Vercel properly.

### Create `vercel.json` in root (Already created!)

The `vercel.json` file routes:
- `/api/*` → server.js (backend)
- `/*` → client/build (frontend)

## MongoDB Atlas IP Whitelist

**CRITICAL:** Before deploying, update MongoDB Atlas:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add: `0.0.0.0/0` (allows all IPs)
4. Click "Confirm"

This allows Vercel's servers to connect to your database.

## Testing Your Deployment

After deployment, test:
- ✅ `https://your-app.vercel.app/api/health`
- ✅ `https://your-app.vercel.app/` (should show frontend)
- ✅ Register a user
- ✅ Create a short URL
- ✅ Check QR code (should show your Vercel URL, not localhost!)

## Troubleshooting

### Build Fails:
- Check that `client/package.json` has correct build script
- Ensure all dependencies are in `package.json`

### API Routes Don't Work:
- Check `vercel.json` configuration
- Ensure server.js exports the app correctly

### Database Connection Fails:
- Verify MongoDB IP whitelist includes `0.0.0.0/0`
- Check MONGODB_URI environment variable is set correctly

### QR Codes Still Show Localhost:
- Check BASE_URL environment variable
- Or let it auto-detect from VERCEL_URL (automatic)

