# Email Configuration for Password Reset

## Overview

The forgot password feature requires email configuration to send password reset links. The system supports multiple email providers.

## Environment Variables

Add these to your `.env` file or Render environment variables:

### Option 1: Gmail (Easiest for Development)

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

**Note**: You need to use an [App Password](https://support.google.com/accounts/answer/185833) from Google, not your regular password.

### Option 2: SMTP Server (Recommended for Production)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

### Option 3: Development Mode (No Email Sent)

If no email configuration is provided, the system will log emails to the console instead of sending them. This is useful for development and testing.

## Setting Up Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Use that password as `GMAIL_PASS`

## Setting Up for Render

1. Go to Render Dashboard → Your Service → Environment
2. Add the email environment variables:
   - `GMAIL_USER` and `GMAIL_PASS` (for Gmail)
   - OR `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for custom SMTP)

## Email Services

### Free Options:
- **Gmail**: Free, easy setup (requires app password)
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Free tier (5,000 emails/month)
- **Resend**: Free tier (3,000 emails/month)

### For Production:
Consider using a dedicated email service like:
- SendGrid
- Mailgun
- AWS SES
- Postmark

## Testing

1. Register a new account with your email
2. Click "Forgot Password" on the login page
3. Enter your email
4. Check your inbox for the reset link
5. Click the link to reset your password

## Troubleshooting

### Emails not sending?
- Check environment variables are set correctly
- Verify SMTP credentials
- Check Render logs for email errors
- For Gmail, make sure you're using an App Password, not your regular password

### Email in spam folder?
- Configure SPF/DKIM records for your domain
- Use a dedicated email service for better deliverability

### Development mode?
- If no email config is set, emails are logged to console
- Check server logs to see the email content

