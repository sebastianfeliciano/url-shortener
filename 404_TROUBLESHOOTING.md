# 404 Error Troubleshooting

## Common Causes

### 1. Vercel Frontend 404

If you're getting 404 on Vercel, check:

**Issue**: Static files not found
- **Solution**: Make sure `vercel.json` has correct `distDir`:
  ```json
  {
    "builds": [{
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }]
  }
  ```

**Issue**: Root directory wrong
- **Solution**: In Vercel Dashboard → Settings → General:
  - **Root Directory**: Leave empty OR set to `client`
  - **Build Command**: `npm run build` (if root is `client`)
  - **Output Directory**: `build`

**Issue**: Build didn't complete
- **Solution**: Check Vercel build logs for errors
- Make sure `client/package.json` has a `build` script

### 2. Render Backend 404

If you're getting 404 on Render:

**Issue**: API route not found
- **Test**: `https://url-shortener-udw9.onrender.com/api/health`
- Should return: `{"status":"ok","timestamp":"..."}`

**Issue**: Frontend route on backend
- **Note**: Render backend serves the React app, but if you're using Vercel for frontend, you shouldn't access frontend routes on Render
- **Solution**: Use Vercel URL for frontend, Render URL for API

### 3. Route Configuration

**API Routes** (should work on Render):
- ✅ `/api/health` - Health check
- ✅ `/api/create` - Create short URL
- ✅ `/api/profiles/register` - Register user
- ✅ `/api/profiles/login` - Login user
- ✅ `/api/urls` - Get URLs
- ✅ `/api/stats` - Get stats

**Frontend Routes** (should work on Vercel):
- ✅ `/` - Home page
- ✅ Any React route (handled by React Router if you add it)

**Short URL Redirects** (should work on Render):
- ✅ `/xyz1234` - 8-character short codes

## Quick Tests

### Test Render Backend:
```bash
# Health check
curl https://url-shortener-udw9.onrender.com/api/health

# API root
curl https://url-shortener-udw9.onrender.com/api/
```

### Test Vercel Frontend:
- Visit your Vercel URL
- Check browser console (F12) for errors
- Check Network tab to see if API calls are working

## Vercel Error Code Format

If you see an error like:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::fzmpd-...
```

This is a Vercel error. Common causes:
1. **Route doesn't exist** - Check if the URL path is correct
2. **Build failed** - Check Vercel build logs
3. **Static files missing** - Verify build output directory
4. **Wrong root directory** - Check Vercel project settings

## Solutions

### For Vercel 404:
1. Check Vercel Dashboard → Deployments → Latest deployment logs
2. Verify `vercel.json` configuration
3. Make sure build completed successfully
4. Check Root Directory setting in Vercel Dashboard

### For Render 404:
1. Check Render Dashboard → Your Service → Logs
2. Test API endpoints directly
3. Verify environment variables are set
4. Check if service is running (not sleeping)

## Still Having Issues?

1. **Check deployment logs** in both Vercel and Render
2. **Test endpoints directly** using curl or browser
3. **Verify environment variables** are set correctly
4. **Check browser console** for client-side errors

