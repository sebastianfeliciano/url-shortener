# Email Connection Timeout Troubleshooting

## Problem: Connection Timeout Error

If you're seeing `ETIMEDOUT` errors, Render might be blocking outbound SMTP connections, or Gmail requires different settings.

## Solutions

### Solution 1: Use SendGrid (Recommended for Production)

SendGrid is more reliable for cloud deployments and has a free tier.

1. **Sign up for SendGrid**: https://sendgrid.com (free tier: 100 emails/day)

2. **Create API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Add to Render Environment Variables**:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=your-verified-sender@yourdomain.com
   ```

### Solution 2: Use Mailgun (Alternative)

1. **Sign up for Mailgun**: https://www.mailgun.com (free tier: 5,000 emails/month)

2. **Get SMTP Credentials**:
   - Go to Sending → Domain Settings
   - Copy SMTP credentials

3. **Add to Render**:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.com
   ```

### Solution 3: Fix Gmail Configuration

If you want to stick with Gmail, try these fixes:

1. **Verify Environment Variables**:
   - Make sure `GMAIL_USER` and `GMAIL_PASS` are set correctly
   - App password should have no spaces

2. **Check Render Network**:
   - Some cloud providers block port 587
   - Try port 465 with `secure: true`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Use OAuth2** (More complex but more reliable):
   - Gmail OAuth2 is more reliable than app passwords
   - Requires additional setup with Google Cloud Console

### Solution 4: Use Resend (Modern Alternative)

1. **Sign up for Resend**: https://resend.com (free tier: 3,000 emails/month)

2. **Get API Key**:
   - Go to API Keys
   - Create new API key

3. **Update server.js to use Resend API** (requires code change):
   - Resend uses REST API, not SMTP
   - More reliable for serverless/cloud deployments

## Quick Fix: Test Email Configuration

Add this test endpoint to verify email setup:

```javascript
// Test email endpoint (add to server.js)
app.get('/api/test-email', async (req, res) => {
  try {
    if (typeof emailTransporter.verify === 'function') {
      await emailTransporter.verify();
    }
    res.json({ message: 'Email server connection successful' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Email server connection failed',
      details: error.message 
    });
  }
});
```

Then test: `https://url-shortener-udw9.onrender.com/api/test-email`

## Recommended: Use SendGrid

For production deployments on Render, **SendGrid is the most reliable option**:

✅ Free tier: 100 emails/day  
✅ Reliable SMTP connection  
✅ Works well with cloud providers  
✅ Easy setup  
✅ Good deliverability  

## Current Status

The code has been updated with:
- Increased connection timeouts (15 seconds)
- Better error logging
- Connection verification before sending

Try one of the solutions above, or test the email connection using the test endpoint.

