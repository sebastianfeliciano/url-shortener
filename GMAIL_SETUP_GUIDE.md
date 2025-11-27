# Gmail Setup for Password Reset

## Quick Setup Steps

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable it
5. This is required to generate App Passwords

### Step 2: Generate App Password

1. Go to App Passwords: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App Passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "URL Shortener" or "Render Backend"
5. Click **Generate**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: You can only see this password once!

### Step 3: Add to Render Environment Variables

1. Go to **Render Dashboard** → Your Service (`url-shortener-udw9`)
2. Click **Environment** in the left sidebar
3. Click **Add Environment Variable**

4. Add **First Variable**:
   - **Key**: `GMAIL_USER`
   - **Value**: Your Gmail address (e.g., `yourname@gmail.com`)
   - Click **Save**

5. Add **Second Variable**:
   - **Key**: `GMAIL_PASS`
   - **Value**: The 16-character app password you generated (remove spaces: `abcdefghijklmnop`)
   - Click **Save**

### Step 4: Redeploy

After adding the environment variables:
1. Go to **Events** tab in Render
2. Click **Manual Deploy** → **Deploy latest commit**
3. Or wait for auto-deploy if you just pushed changes

## Testing

1. Go to your app: `https://url-shortener-five-peach.vercel.app`
2. Click **"Forgot Password?"** on the login page
3. Enter your email address
4. Check your inbox for the password reset email
5. Click the reset link and set a new password

## Troubleshooting

### "Invalid login" error?
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify the app password doesn't have spaces (remove them if copied with spaces)
- Check that 2-Step Verification is enabled

### Emails not sending?
- Check Render logs: Dashboard → Your Service → Logs
- Look for email-related errors
- Verify both `GMAIL_USER` and `GMAIL_PASS` are set correctly

### Emails going to spam?
- This is normal for automated emails
- Check your spam/junk folder
- The email will be from your Gmail address

## Security Notes

- ✅ App Passwords are safer than using your main password
- ✅ You can revoke app passwords anytime from Google Account settings
- ✅ Each app password is unique and can be deleted independently
- ⚠️ Never commit app passwords to Git or share them publicly

## Example Environment Variables

In Render, your environment variables should look like:

```
GMAIL_USER = yourname@gmail.com
GMAIL_PASS = abcdefghijklmnop
```

(No quotes needed, just the values)

## Need Help?

If you're having issues:
1. Check Render logs for specific error messages
2. Verify the app password is correct (try generating a new one)
3. Make sure 2-Step Verification is enabled
4. Test with a different Gmail account if needed

