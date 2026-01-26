# Gmail SMTP in Production - Solutions

## Problem
Render and many cloud platforms block Gmail SMTP ports 587 and 465.

## Solutions to Make Gmail SMTP Work

### Option 1: Try Alternative Port 2525 (Recommended First Try)

Gmail supports port 2525 as an alternative TLS port that's sometimes not blocked.

**Set in Production:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=2525
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew  # Your app password (no spaces)
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

**Test:** Visit `/api/contact/test-smtp` after setting these variables.

### Option 2: Use Gmail API Instead of SMTP

Gmail API uses HTTPS (port 443) which is never blocked.

**Setup:**
1. Enable Gmail API in Google Cloud Console
2. Create OAuth2 credentials
3. Use `googleapis` package instead of nodemailer

This requires more setup but is more reliable.

### Option 3: Use SMTP Relay Service

Use a service that relays Gmail SMTP through their servers:

**Services:**
- Mailgun (can relay Gmail)
- SendGrid (can relay Gmail)
- AWS SES (can relay Gmail)

### Option 4: Upgrade Render Plan

Render's paid plans may allow SMTP connections. Check Render documentation.

### Option 5: Use Different Hosting

Hosting platforms that allow Gmail SMTP:
- Railway.app
- Fly.io
- DigitalOcean App Platform
- Heroku (paid plans)
- AWS EC2
- Google Cloud Run

## Quick Test

After setting `SMTP_PORT=2525` in production:

1. Restart your Render service
2. Visit: `https://swagat-odisha-backend.onrender.com/api/contact/test-smtp`
3. Check if connection succeeds

## Current Code Behavior

The code now:
- ✅ Tries port 2525 first in production (if not explicitly set)
- ✅ Falls back to 465, then 587
- ✅ Has retry logic (3 attempts)
- ✅ Provides detailed error messages

## If All Ports Fail

If Gmail SMTP still doesn't work after trying all ports, use:
1. **SendGrid** (already configured) - Most reliable
2. **Mailgun** - Free tier available
3. **Sendinblue** - Free tier available

These services work on all cloud platforms and are more reliable than Gmail SMTP for production.

