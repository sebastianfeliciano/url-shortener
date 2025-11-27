# Frontend URL Setup for Password Reset

## Problem

Reset password links were going to the Render backend (`url-shortener-udw9.onrender.com`) instead of the Vercel frontend (`url-shortener-five-peach.vercel.app`).

## Solution

Add `FRONTEND_URL` environment variable to Render.

## Setup

### In Render Dashboard:

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://url-shortener-five-peach.vercel.app`
   - Click **Save**

### Alternative: Use REACT_APP_API_URL

If you already have `REACT_APP_API_URL` set in Vercel, the code will use that as a fallback.

## How It Works

- **FRONTEND_URL**: Used for password reset links (goes to Vercel frontend)
- **BASE_URL**: Used for QR codes and short URLs (goes to Render backend)

## After Adding Variable

1. **Redeploy** your Render service
2. Test the forgot password flow:
   - Click "Forgot Password"
   - Enter your email
   - Check email for reset link
   - Link should now go to Vercel frontend

## Environment Variables Summary

**In Render:**
```
FRONTEND_URL = https://url-shortener-five-peach.vercel.app
```

**In Vercel:**
```
REACT_APP_API_URL = https://url-shortener-udw9.onrender.com
```

This way:
- Frontend (Vercel) → Backend API (Render) ✅
- Reset links → Frontend (Vercel) ✅
- QR codes → Backend (Render) ✅

