# Fix Password Issues

## Problem: 401 Invalid Credentials

If you're getting 401 errors after resetting your password, the password might be stored incorrectly in MongoDB Atlas.

## Solution 1: Reset Password Again (Recommended)

After the latest code is deployed:

1. Go to your app
2. Click "Forgot Password"
3. Enter your email
4. Use the reset link from your email
5. Set a new password
6. Try logging in

The new password will be properly hashed.

## Solution 2: Check Render Logs

Check Render Dashboard → Your Service → Logs to see:

- `🔍 Login attempt:` - Shows if password is hashed
- `❌ Login failed:` - Shows why login failed
- `⚠️ Password stored as plain text` - Indicates the issue

## Solution 3: Manually Fix in MongoDB Atlas

If you need to manually fix a password:

1. Go to MongoDB Atlas → Collections → `profiles`
2. Find your user document
3. The password field should start with `$2b$10$` (bcrypt hash)
4. If it's plain text (like "qwerty"), you can:
   - Delete the user and create a new account
   - Or use the password reset feature after code is deployed

## Solution 4: Create New Account

If nothing works:

1. Create a new account with a different username/email
2. The new account will have properly hashed passwords
3. Delete the old account if needed

## Debug Information

The code now logs:
- Whether password is hashed or plain text
- Password comparison results
- Auto-rehashing of plain text passwords

Check Render logs for these messages to diagnose the issue.

