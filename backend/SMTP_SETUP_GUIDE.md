# SMTP Setup Guide - Local & Production

## ✅ Local Testing Results

Local SMTP is **working correctly** with:
- Port: 587 (TLS)
- Gmail App Password: ✅ Working
- Email sending: ✅ Successful

## ⚠️ Production Issue

**SMTP ports are blocked on Render free tier:**
- Port 587 (TLS) - ❌ Blocked
- Port 465 (SSL) - ❌ Blocked

**Solution:** Use SendGrid for production (already configured)

## Configuration

### Local Environment (.env)
```bash
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew  # No spaces!
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

### Production Environment (Render/Vercel Dashboard)

**Option 1: SendGrid (Recommended - Works on all platforms)**
```bash
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=contact@swagatodisha.com  # Must be verified in SendGrid
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

**Option 2: SMTP (May not work on free tiers)**
```bash
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew  # No spaces!
SMTP_PORT=465  # Use 465 for production (SSL)
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

## Testing

### Test Local SMTP
```bash
cd backend
node test-smtp-comprehensive.js
```

### Test Production SendGrid
Visit: `https://swagat-odisha-backend.onrender.com/api/contact/test-sendgrid`

### Test Production SMTP
Visit: `https://swagat-odisha-backend.onrender.com/api/contact/test-smtp`

## Current Status

- ✅ **Local SMTP**: Working (Port 587)
- ❌ **Production SMTP**: Blocked by Render (Ports 587 & 465)
- ✅ **SendGrid**: Configured and ready (use this for production)

## Recommendation

**For Production:** Use SendGrid only. SMTP is kept as a fallback but won't work on Render free tier.

The code automatically:
1. Tries SendGrid first
2. Falls back to SMTP if SendGrid fails
3. Uses port 465 in production (if SMTP is available)

## Troubleshooting

### Local SMTP Issues
- ✅ Check EMAIL_PASS has no spaces
- ✅ Verify it's a Gmail App Password (16 chars)
- ✅ Ensure 2-Step Verification is enabled

### Production SMTP Issues
- ⚠️ Cloud platforms often block SMTP
- ✅ Use SendGrid instead
- ✅ Verify FROM_EMAIL in SendGrid dashboard

