# Deployment Guide

## Free Cloud Providers for Students

### Option 1: Vercel (Recommended - Easiest)
- **Free tier**: Unlimited for students
- **URL**: https://vercel.com
- **Student program**: https://vercel.com/education

### Option 2: Render
- **Free tier**: Available
- **URL**: https://render.com
- **Student program**: Check their education page

### Option 3: Railway
- **Free tier**: $5 credit/month
- **URL**: https://railway.app
- **Student program**: GitHub Student Pack

## Deployment Steps for Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables in Vercel Dashboard
Go to your project settings → Environment Variables and add:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `BASE_URL`: Will be auto-set by Vercel (or set manually to your Vercel URL)
- `NODE_ENV`: `production`

### 5. Your deployed URL will be:
`https://your-project-name.vercel.app`

## Important Notes

1. **QR Codes**: Will automatically use your deployed URL (e.g., `https://urlshort.vercel.app/xyz`)
2. **MongoDB Atlas**: Make sure your IP whitelist includes `0.0.0.0/0` (allow all IPs) for cloud deployment
3. **Environment Variables**: Set them in your cloud provider's dashboard
4. **Base URL**: The server will auto-detect the deployed URL from environment variables

## MongoDB Atlas IP Whitelist

For cloud deployment, update your MongoDB Atlas Network Access:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs)
3. Or add your cloud provider's IP ranges

## Testing Locally with Production URL

To test QR codes with your deployed URL locally:
```bash
BASE_URL=https://your-app.vercel.app npm run dev
```

