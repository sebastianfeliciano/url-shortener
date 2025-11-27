# SendGrid API Setup (Recommended for Render)

## Why Use API Instead of SMTP?

- ✅ **No port blocking** - Uses HTTPS (port 443) instead of SMTP (port 587)
- ✅ **More reliable** on cloud platforms like Render
- ✅ **Faster** - Direct API calls
- ✅ **Better error handling**

## Setup Steps

### Step 1: Update Render Environment Variables

Go to **Render Dashboard** → Your Service → **Environment** → Update/Add:

**Remove these SMTP variables** (if you added them):
- ❌ SMTP_HOST
- ❌ SMTP_PORT
- ❌ SMTP_SECURE
- ❌ SMTP_USER
- ❌ SMTP_PASS

**Add these instead**:

1. **SENDGRID_API_KEY**
   - **Key**: `SENDGRID_API_KEY`
   - **Value**: `your-sendgrid-api-key-here` (the API key you copied from SendGrid)
   - Save

2. **SENDGRID_FROM** (or keep SMTP_FROM)
   - **Key**: `SENDGRID_FROM`
   - **Value**: Your verified sender email from SendGrid
   - Save

### Step 2: Verify Sender Email

1. Go to SendGrid → **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Enter your email and verify it
4. Use this email as `SENDGRID_FROM`

### Step 3: Redeploy

After updating environment variables:
1. Go to **Events** tab
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment

## Environment Variables Summary

```
SENDGRID_API_KEY = your-sendgrid-api-key-here
SENDGRID_FROM = your-verified-email@example.com
```

That's it! Just 2 variables needed.

## How It Works

The code now:
1. **First tries SendGrid API** (if `SENDGRID_API_KEY` is set)
2. **Falls back to SMTP** (if API fails or not configured)
3. **Logs to console** (if neither is configured)

## Test It

After redeploy:
1. Go to your app
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox!

## Troubleshooting

### Still getting errors?
- Check Render logs for specific error messages
- Verify `SENDGRID_API_KEY` is correct (no extra spaces)
- Make sure sender email is verified in SendGrid
- Check SendGrid Activity Feed: Dashboard → Activity

### API key not working?
- Verify the API key has "Mail Send" permissions
- Try creating a new API key
- Make sure there are no spaces in the key

## Benefits

✅ **No DNS changes needed**  
✅ **No port configuration**  
✅ **Works through firewalls**  
✅ **More reliable on cloud platforms**  

