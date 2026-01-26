# Testing Production SMTP

## Method 1: Browser Test (Easiest)

1. Open your browser
2. Go to: `https://swagat-odisha-backend.onrender.com/api/contact/test-smtp`
3. You should see a JSON response showing SMTP status

## Method 2: Submit Contact Form

1. Go to your production frontend: `https://swagatodisha.com/send-message`
2. Fill out the contact form
3. Submit it
4. Check your production server logs for:
   - `✅ SMTP connection verified`
   - `✅ Contact form admin email sent via SMTP fallback`

## Method 3: Check Server Logs

After submitting a contact form, check your Render/Vercel logs for:

**Success indicators:**
```
📧 SMTP transporter created successfully
📧 Using Gmail SMTP
✅ SMTP connection verified
✅ Contact form admin email sent via SMTP fallback
```

**Error indicators:**
```
❌ SMTP attempt X failed
❌ AUTHENTICATION FAILED - Check your EMAIL_PASS
```

## Method 4: Using Node.js Script

Run this in your terminal:
```bash
cd backend
node test-smtp-production.js
```

## Common Issues

### If you see "400 Bad Request"
- The endpoint might need authentication
- Try submitting a contact form instead

### If you see "Connection timeout"
- Server might be sleeping (Render free tier)
- Wait a moment and try again
- Or submit a contact form to wake it up

### If you see "535 Authentication failed"
- Check EMAIL_PASS in production environment variables
- Make sure it has no spaces
- Verify it's a Gmail App Password

