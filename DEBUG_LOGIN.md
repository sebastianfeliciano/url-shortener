# Debug Login 401 Errors

## Step 1: Check Render Logs

1. Go to **Render Dashboard** → Your Service → **Logs**
2. Try logging in
3. Look for these log messages:

### Expected Logs:

**If user found:**
```
✅ User found: [username]
🔍 Login attempt: { username: ..., passwordIsHashed: true/false, ... }
🔍 Password comparison result: true/false
```

**If password mismatch:**
```
❌ Login failed: Password mismatch for user: [username]
❌ Stored password type: hashed/plain text
❌ Stored password starts with: [first 20 chars]
```

## Step 2: Check Password Status

After Render redeploys, you can check your user's password status:

```
GET https://url-shortener-udw9.onrender.com/api/debug/user/YOUR_USERNAME
```

This will show:
- If password is hashed
- Password length
- Password prefix (first 25 chars)

## Step 3: Common Issues

### Issue: Password is Plain Text
**Solution**: Reset password again after code is deployed

### Issue: Username Case Mismatch
**Solution**: Code now handles case-insensitive usernames

### Issue: Password Has Whitespace
**Solution**: Code now trims password input

### Issue: Wrong Username
**Solution**: Check the exact username in MongoDB Atlas

## Step 4: Manual Fix in MongoDB Atlas

If needed, you can manually check/fix in MongoDB Atlas:

1. Go to **MongoDB Atlas** → **Collections** → **profiles**
2. Find your user document
3. Check the `password` field:
   - **Should be**: `$2b$10$...` (60 characters, starts with $2b$)
   - **If it's**: `qwerty` or any plain text → That's the problem

## Step 5: Reset Password (Recommended)

After the latest code is deployed:

1. Go to your app
2. Click **"Forgot Password"**
3. Enter your email
4. Check email for reset link
5. Set a new password
6. Try logging in

The new password will be properly hashed.

## What the Code Does Now

✅ Case-insensitive username lookup  
✅ Trims password input (removes whitespace)  
✅ Handles plain text passwords (legacy)  
✅ Auto-rehashes plain text passwords after login  
✅ Detailed logging for debugging  

## Still Not Working?

1. Check Render logs for the exact error
2. Verify username is correct
3. Try resetting password again
4. Check MongoDB Atlas to see password format

