# Deployment Checklist

## ✅ Backend Deployed to Render

**Backend URL**: `https://url-shortener-udw9.onrender.com`

### Test Backend Endpoints:

1. **Health Check**: 
   ```
   https://url-shortener-udw9.onrender.com/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **API Root**:
   ```
   https://url-shortener-udw9.onrender.com/api/
   ```
   Should return API documentation

3. **Test Profile Registration** (optional):
   ```bash
   curl -X POST https://url-shortener-udw9.onrender.com/api/profiles/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

## 🔧 Next Steps: Configure Vercel Frontend

### Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository: `sebastianfeliciano/url-shortener`
4. Configure:
   - **Framework Preset**: `Other` or `Create React App`
   - **Root Directory**: Leave empty (Vercel will detect `client/`)
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`

### Step 2: Set Environment Variable (CRITICAL!)

**This is the most important step!**

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://url-shortener-udw9.onrender.com`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Click **"Save"**

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Make sure to check **"Use existing Build Cache"** is **unchecked** (so it rebuilds with the new env var)

## ✅ Verify Deployment

### Test Frontend:
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to:
   - Sign up / Sign in
   - Create a short URL
   - View analytics

### Check Browser Console:
- Open Developer Tools (F12)
- Go to **Console** tab
- Look for any API errors
- Check **Network** tab to see if API calls are going to Render backend

### Expected API Calls:
All API calls should go to: `https://url-shortener-udw9.onrender.com/api/*`

## 🐛 Troubleshooting

### Frontend shows errors?
- Check that `REACT_APP_API_URL` is set correctly in Vercel
- Verify you **redeployed** after adding the environment variable
- Check browser console for errors

### CORS errors?
- Backend already has `cors()` enabled, should work
- If issues persist, check Render logs

### Backend not responding?
- Check Render dashboard → Your Service → Logs
- Verify MongoDB connection
- Test backend directly: `https://url-shortener-udw9.onrender.com/api/health`

## 📝 Quick Reference

**Backend (Render)**: `https://url-shortener-udw9.onrender.com`  
**Frontend (Vercel)**: `https://your-app.vercel.app` (after deployment)  
**Environment Variable**: `REACT_APP_API_URL=https://url-shortener-udw9.onrender.com`

## 🎉 Success Criteria

✅ Backend health check works  
✅ Frontend loads on Vercel  
✅ Can sign up / sign in  
✅ Can create short URLs  
✅ QR codes work  
✅ Analytics display correctly  

