# Production SMTP Setup Guide

## 🎯 Goal
Configure Gmail SMTP to work in production on Render/Vercel.

## ⚠️ Important Note
Render free tier **blocks SMTP ports 587 and 465**. We'll use **port 2525** (Gmail alternative TLS port) which may work.

## 📋 Step-by-Step Setup

### Step 1: Set Production Environment Variables

Go to your **Render Dashboard** → Your Service → **Environment** tab and add:

```bash
# Gmail SMTP Configuration
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew
SMTP_PORT=2525
CONTACT_EMAIL=swagatgroupinfo@gmail.com

# Optional: If you want to use SendGrid as primary (recommended)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=contact@swagatodisha.com
```

**Important:**
- `EMAIL_PASS` must be a Gmail App Password (16 chars, **no spaces**)
- `SMTP_PORT=2525` uses Gmail's alternative TLS port
- If port 2525 doesn't work, try `SMTP_PORT=465` or `SMTP_PORT=587`

### Step 2: Verify Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification → App Passwords
3. Verify you have an app password for "Mail"
4. Copy the 16-character password (no spaces)

### Step 3: Restart Your Service

After setting environment variables:
1. Click **Manual Deploy** or wait for auto-deploy
2. Service will restart with new configuration

### Step 4: Test Production SMTP

**Option A: Test Endpoint**
```
https://swagat-odisha-backend.onrender.com/api/contact/test-smtp
```

**Option B: Submit Contact Form**
1. Go to: `https://swagatodisha.com/send-message`
2. Fill out and submit the form
3. Check your email inbox

**Option C: Check Server Logs**
Look for these messages in Render logs:
```
📧 Creating Gmail SMTP transporter: { port: '2525 (Alternative TLS...)' }
✅ SMTP connection verified
✅ Contact form admin email sent via SMTP fallback
```

## 🔧 Port Configuration Options

If port 2525 doesn't work, try these in order:

### Option 1: Port 2525 (Default in Production)
```bash
SMTP_PORT=2525
```
- Gmail alternative TLS port
- May work on cloud platforms

### Option 2: Port 465 (SSL)
```bash
SMTP_PORT=465
```
- SSL connection
- Sometimes works on cloud platforms

### Option 3: Port 587 (TLS)
```bash
SMTP_PORT=587
```
- Standard TLS port
- Usually blocked on Render free tier

## 🚨 If SMTP Still Fails

If all Gmail SMTP ports are blocked, use **SendGrid** (already configured):

1. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Create API key with "Mail Send" permissions
   - Verify sender email

2. **Set in Production:**
   ```bash
   SENDGRID_API_KEY=SG.your-api-key
   FROM_EMAIL=contact@swagatodisha.com  # Must be verified in SendGrid
   ```

3. **Remove SMTP variables** (optional):
   - SendGrid will be used automatically
   - SMTP will only be used as fallback

## ✅ Verification Checklist

After setup, verify:

- [ ] Environment variables set in Render
- [ ] Service restarted
- [ ] Test endpoint returns success
- [ ] Contact form submission works
- [ ] Emails received in inbox
- [ ] Server logs show SMTP success

## 📊 Expected Behavior

**If SMTP works:**
```
✅ SMTP connection verified
✅ Contact form admin email sent via SMTP fallback
✅ Contact form user confirmation sent via SMTP fallback
```

**If SMTP fails but SendGrid works:**
```
❌ SMTP connection failed (timeout)
✅ Contact form admin email sent via SendGrid
✅ Contact form user confirmation sent via SendGrid
```

**If both fail:**
```
❌ SMTP connection failed
❌ SendGrid failed
⚠️ No emails sent (check configuration)
```

## 🔍 Troubleshooting

### Connection Timeout
- **Cause:** Port blocked by cloud platform
- **Solution:** Use SendGrid or try different port

### Authentication Failed (535)
- **Cause:** Wrong EMAIL_PASS
- **Solution:** Verify Gmail App Password (16 chars, no spaces)

### Invalid Login
- **Cause:** Using regular password instead of App Password
- **Solution:** Create Gmail App Password

## 📝 Current Configuration

The code automatically:
1. ✅ Tries SendGrid first (if configured)
2. ✅ Falls back to SMTP if SendGrid fails
3. ✅ Uses port 2525 in production (Gmail alternative)
4. ✅ Removes spaces from EMAIL_PASS automatically
5. ✅ Retries up to 3 times on connection errors
6. ✅ Provides detailed error logging

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Test endpoint returns `"success": true`
- ✅ Contact form shows success message
- ✅ Emails arrive in inbox within 1-2 minutes
- ✅ Server logs show "✅ Contact form admin email sent"

