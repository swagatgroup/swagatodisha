# Production SMTP Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code is Ready
- [x] SMTP configuration supports port 2525
- [x] Automatic password space removal
- [x] Retry logic (3 attempts)
- [x] SendGrid fallback configured
- [x] Error logging enhanced

### 2. Environment Variables to Set in Render

Go to **Render Dashboard** → Your Service → **Environment** → Add these:

```bash
# Required for SMTP
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew
SMTP_PORT=2525
CONTACT_EMAIL=swagatgroupinfo@gmail.com

# Optional: SendGrid (recommended as primary)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=contact@swagatodisha.com

# Production Environment
NODE_ENV=production
```

**Critical Notes:**
- `EMAIL_PASS` must be **16 characters, NO SPACES**
- `SMTP_PORT=2525` uses Gmail alternative TLS port
- If 2525 fails, try `SMTP_PORT=465` or `SMTP_PORT=587`

### 3. Verify Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already)
3. Go to App Passwords
4. Create password for "Mail"
5. Copy the 16-character password (no spaces)

## 🚀 Deployment Steps

### Step 1: Set Environment Variables
1. Open Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable from the list above
6. **Save Changes**

### Step 2: Deploy/Restart
1. Click **Manual Deploy** → **Deploy latest commit**
2. OR wait for auto-deploy
3. Wait for deployment to complete

### Step 3: Verify Deployment
1. Check deployment logs for errors
2. Look for: `📧 Creating Gmail SMTP transporter`
3. Should show port 2525 in production

## 🧪 Testing Production SMTP

### Test 1: SMTP Connection Test
Visit: `https://swagat-odisha-backend.onrender.com/api/contact/test-smtp`

**Expected Success Response:**
```json
{
  "success": true,
  "message": "SMTP connection successful",
  "details": {
    "host": "smtp.gmail.com",
    "port": "2525",
    "user": "swagatgroupinfo@gmail.com"
  }
}
```

### Test 2: SendGrid Test (if configured)
Visit: `https://swagat-odisha-backend.onrender.com/api/contact/test-sendgrid`

### Test 3: Submit Contact Form
1. Go to: `https://swagatodisha.com/send-message`
2. Fill out the form
3. Submit
4. Check email inbox within 1-2 minutes

## 📊 Expected Server Logs

### Success Logs:
```
📧 Email Configuration Check: {
  hasSendGrid: true/false,
  hasFromEmail: true/false,
  hasSMTP: true,
  ...
}
📧 Creating Gmail SMTP transporter: { port: '2525 (Alternative TLS...)' }
💡 Using Gmail port 2525 - alternative TLS port
✅ SMTP connection verified
✅ Contact form admin email sent via SMTP fallback
✅ Contact form user confirmation sent via SMTP fallback
```

### If SendGrid is Used:
```
✅ Contact form admin email sent via SendGrid
✅ Contact form user confirmation sent via SendGrid
```

## 🔧 Troubleshooting

### Issue: Connection Timeout
**Solution:**
1. Try different port: Set `SMTP_PORT=465` or `SMTP_PORT=587`
2. Use SendGrid instead (set `SENDGRID_API_KEY`)

### Issue: Authentication Failed (535)
**Solution:**
1. Verify `EMAIL_PASS` is correct (16 chars, no spaces)
2. Check it's a Gmail App Password, not regular password
3. Ensure 2-Step Verification is enabled

### Issue: Port 2525 Not Working
**Solution:**
1. Try `SMTP_PORT=465` (SSL)
2. Try `SMTP_PORT=587` (TLS)
3. Use SendGrid as primary (recommended)

## 📝 Post-Deployment Verification

After deployment, verify:

- [ ] Environment variables set correctly
- [ ] Service restarted successfully
- [ ] Test endpoint returns success
- [ ] Contact form submission works
- [ ] Emails received in inbox
- [ ] Server logs show SMTP success

## 🎯 Success Criteria

Production SMTP is working when:
- ✅ Test endpoint returns `"success": true`
- ✅ Contact form shows success message
- ✅ Emails arrive in inbox
- ✅ Server logs show "✅ Contact form admin email sent"

## 📞 Support

If issues persist:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set
3. Test with SendGrid as alternative
4. Check Gmail App Password is valid

