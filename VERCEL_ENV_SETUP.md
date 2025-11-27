# Vercel Environment Variable Setup

## Quick Setup for Render Backend

Your backend is deployed at: **https://url-shortener-udw9.onrender.com**

### Step 1: Add Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Click **"Add New"**

3. Add this environment variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://url-shortener-udw9.onrender.com`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

4. Click **"Save"**

### Step 2: Redeploy

**IMPORTANT**: After adding the environment variable, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **"..."** menu (three dots) on the latest deployment
3. Click **"Redeploy"**
4. **Uncheck** "Use existing Build Cache" (so it rebuilds with the new env var)
5. Click **"Redeploy"**

### Step 3: Verify

After redeployment, test your frontend:
- Visit your Vercel URL
- Try to sign up / sign in
- Create a short URL
- Check browser console (F12) → Network tab to verify API calls go to Render

## How It Works

The frontend (`client/src/config.js`) checks for `REACT_APP_API_URL`:
- If set → Uses that URL (your Render backend)
- If not set → Uses same origin (for full-stack on same domain)

## QR Codes

QR codes are automatically generated using the Render URL:
- Format: `https://url-shortener-udw9.onrender.com/xyz`
- The backend detects `RENDER_EXTERNAL_URL` and uses it for QR code generation
- QR codes will point to your Render backend

## Troubleshooting

### Frontend still uses wrong URL?
- Make sure you **redeployed** after adding the environment variable
- Environment variables are injected at **build time**, not runtime
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### CORS errors?
- Backend already has CORS enabled
- If issues persist, check Render logs

### API calls failing?
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check browser console for the actual API URL being used
- Test backend directly: `https://url-shortener-udw9.onrender.com/api/health`

## Quick Reference

**Backend URL**: `https://url-shortener-udw9.onrender.com`  
**Vercel Env Var**: `REACT_APP_API_URL=https://url-shortener-udw9.onrender.com`  
**QR Code Format**: `https://url-shortener-udw9.onrender.com/{shortUrl}`

