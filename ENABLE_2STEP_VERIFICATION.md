# Enable 2-Step Verification for Gmail App Password

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification

1. On the page you're viewing, find **"2-Step Verification"** (it says "2-Step Verification is off")
2. Click on **"2-Step Verification"**
3. Click **"Get Started"** or **"Turn On"**
4. Follow the prompts:
   - You'll need to verify your password
   - Choose a verification method:
     - **Text message** (recommended - easiest)
     - **Authenticator app** (more secure)
     - **Backup codes** (for emergencies)
5. Complete the setup process

### Step 2: Generate App Password

**After 2-Step Verification is enabled:**

1. Go directly to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App Passwords (at the bottom)
2. You'll see a page titled "App passwords"
3. Select:
   - **Select app**: Choose "Mail"
   - **Select device**: Choose "Other (Custom name)"
   - Enter name: `URL Shortener` or `Render Backend`
4. Click **"Generate"**
5. **Copy the 16-character password** that appears
   - It will look like: `abcd efgh ijkl mnop`
   - ⚠️ **Important**: Remove the spaces when using it!
   - You can only see this once, so copy it now!

### Step 3: Add to Render

1. Go to **Render Dashboard** → Your Service
2. Click **Environment** → **Add Environment Variable**

3. **First Variable**:
   - Key: `GMAIL_USER`
   - Value: `your-email@gmail.com`
   - Save

4. **Second Variable**:
   - Key: `GMAIL_PASS`
   - Value: `abcdefghijklmnop` (the 16-char password, **no spaces**)
   - Save

### Step 4: Redeploy

After adding environment variables, redeploy your service in Render.

## Quick Links

- **Enable 2-Step Verification**: https://myaccount.google.com/security
- **Generate App Password**: https://myaccount.google.com/apppasswords
- **Render Dashboard**: https://dashboard.render.com

## Troubleshooting

### Can't find App Passwords?
- Make sure 2-Step Verification is **enabled** first
- Wait a few minutes after enabling 2-Step Verification
- Try refreshing the page
- The link should be at the bottom of the 2-Step Verification page

### App Password not working?
- Make sure you removed all spaces from the password
- Verify you copied all 16 characters
- Try generating a new app password
- Check that `GMAIL_USER` matches the email you used to generate the app password

### Still having issues?
- Make sure 2-Step Verification is fully set up and verified
- Try using a different verification method (text message vs authenticator)
- Check Render logs for specific error messages

