# SendGrid Setup Guide

## Option 1: SMTP (Easiest - Works with Current Code)

### Step 1: Get SendGrid API Key

1. Go to SendGrid Dashboard: https://app.sendgrid.com
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name it: `URL Shortener`
5. Select permissions: **"Full Access"** or **"Mail Send"** (restricted)
6. Click **"Create & View"**
7. **Copy the API key** (you can only see it once!)

### Step 2: Add to Render Environment Variables

Go to Render Dashboard → Your Service → Environment → Add:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key-here
SMTP_FROM=your-verified-email@yourdomain.com
```

**Important Notes:**
- `SMTP_USER` must be exactly `apikey` (not your SendGrid username)
- `SMTP_PASS` is your SendGrid API key
- `SMTP_FROM` must be a verified sender email in SendGrid

### Step 3: Verify Sender Email

1. Go to SendGrid → **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Enter your email and verify it
4. Use this email as `SMTP_FROM`

### Step 4: Redeploy

After adding environment variables, redeploy your Render service.

## Option 2: SendGrid API (More Reliable - Requires Code Update)

This uses SendGrid's Node.js SDK instead of SMTP.

### Step 1: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

### Step 2: Get API Key

Same as Option 1, Step 1.

### Step 3: Add to Render

```
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM=your-verified-email@yourdomain.com
```

### Step 4: Update Code

The code would need to be updated to use `@sendgrid/mail` instead of nodemailer.

## Recommended: Option 1 (SMTP)

**Use Option 1** because:
- ✅ Works with existing code (no changes needed)
- ✅ Easy setup
- ✅ Reliable for cloud deployments
- ✅ Free tier: 100 emails/day

## Testing

After setup:

1. Go to your app
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox (and spam folder)
5. You should receive the password reset email

## Troubleshooting

### "Authentication failed"?
- Make sure `SMTP_USER` is exactly `apikey`
- Verify the API key is correct (no extra spaces)
- Check API key has "Mail Send" permissions

### "Sender not verified"?
- Verify your sender email in SendGrid
- Use the verified email as `SMTP_FROM`

### Emails not arriving?
- Check SendGrid Activity Feed: Dashboard → Activity
- Check spam folder
- Verify sender email is correct

## SendGrid Dashboard

Monitor your emails:
- **Activity Feed**: See sent emails and delivery status
- **Statistics**: View email metrics
- **Settings**: Manage API keys and verified senders

## Free Tier Limits

- **100 emails/day** on free tier
- Perfect for development and small projects
- Upgrade if you need more

