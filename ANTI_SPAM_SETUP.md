# Anti-Spam Protection Setup Guide

This document explains the comprehensive anti-spam protection system implemented for the contact form.

## 🛡️ Protection Layers

The system uses **5 layers of anti-spam protection**:

1. **Google reCAPTCHA v3** - Invisible bot detection
2. **Honeypot Field** - Hidden field that bots fill but humans don't
3. **Strict Rate Limiting** - Only 3 submissions per hour per IP
4. **Spam Pattern Detection** - Detects random character strings (like in your spam)
5. **Email Domain Validation** - Blocks temporary/suspicious email domains

## 📋 Setup Instructions

### Step 1: Get Google reCAPTCHA v3 Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Click **"Create"**
3. Fill in:
   - **Label**: `Swagat Odisha Contact Form`
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains (e.g., `swagatodisha.com`, `localhost` for testing)
4. Accept the reCAPTCHA Terms of Service
5. Click **"Submit"**
6. Copy the **Site Key** and **Secret Key**

### Step 2: Configure Backend

Add to your `backend/.env` file:

```env
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

### Step 3: Configure Frontend

Add to your `frontend/.env` file:

```env
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### Step 4: Restart Services

```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
cd frontend
npm start
```

## 🔧 How It Works

### 1. reCAPTCHA v3 (Invisible)
- Runs automatically when the form is submitted
- Scores user behavior (0.0 = bot, 1.0 = human)
- Blocks submissions with score < 0.5
- **No user interaction required** - completely invisible

### 2. Honeypot Field
- Hidden field named `website_url` that bots typically fill
- Real users never see or fill this field
- Any submission with this field filled is automatically blocked
- IP is immediately added to blocklist

### 3. Rate Limiting
- **Stricter than general API limits**: Only **3 submissions per hour** per IP
- Prevents rapid-fire spam attacks
- Tracks submissions and blocks excessive attempts

### 4. Spam Pattern Detection
Detects patterns like:
- Random character strings: `zaUOWLoiGGVufQZQWudhG`
- Repeated patterns: `abcabcabc`
- High entropy text (too random to be human)

### 5. Email Domain Validation
Blocks known temporary email domains:
- `tempmail.com`
- `10minutemail.com`
- `guerrillamail.com`
- And detects random-looking domain names

## 🚨 Automatic IP Blocking

The system automatically blocks IPs that:
- Fill the honeypot field
- Fail reCAPTCHA verification 3+ times in an hour
- Submit spam patterns
- Exceed 5 submissions in an hour

Blocked IPs receive a `403 Forbidden` response.

## 📊 Monitoring

Check server logs for spam detection:
- `🪤 Honeypot triggered` - Bot filled honeypot field
- `🤖 reCAPTCHA failed` - Bot detected by reCAPTCHA
- `🔍 Spam pattern detected` - Random text detected
- `📧 Suspicious email domain` - Temporary email detected
- `🚫 Blocked IP attempted` - Blocked IP tried to submit

## ⚙️ Customization

### Adjust Rate Limits

Edit `backend/middleware/antiSpam.js`:

```javascript
const contactFormRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Change this number
    // ...
});
```

### Adjust reCAPTCHA Score Threshold

Edit `backend/middleware/antiSpam.js`:

```javascript
// Score threshold: 0.5 and above is human, below is bot
if (success && score >= 0.5) { // Change 0.5 to adjust sensitivity
```

### Add More Suspicious Email Domains

Edit `backend/middleware/antiSpam.js`:

```javascript
const suspiciousDomains = [
    'tempmail.com',
    // Add more here
];
```

## 🧪 Testing

### Test reCAPTCHA
1. Submit form normally - should work
2. Disable JavaScript - should fail (gracefully)
3. Use automated tool - should be blocked

### Test Honeypot
1. Inspect form HTML
2. Find the hidden `website_url` field
3. Fill it manually
4. Submit - should be blocked immediately

### Test Rate Limiting
1. Submit form 3 times quickly
2. 4th submission should be blocked
3. Wait 1 hour - should work again

## 📝 Notes

- **reCAPTCHA is optional**: If keys are not configured, the system will skip reCAPTCHA verification (but still use other protections)
- **Honeypot is always active**: No configuration needed
- **Rate limiting is strict**: Legitimate users can contact via email if needed
- **IP blocking is temporary**: Blocked IPs are stored in memory (restart clears the list)

## 🆘 Troubleshooting

### reCAPTCHA not working
- Check that `RECAPTCHA_SECRET_KEY` is set in backend `.env`
- Check that `REACT_APP_RECAPTCHA_SITE_KEY` is set in frontend `.env`
- Verify domain is added in reCAPTCHA admin console
- Check browser console for errors

### Legitimate users blocked
- Check server logs for reason
- Adjust reCAPTCHA score threshold if too strict
- Temporarily remove IP from blocklist (restart server)
- Consider adding IP whitelist for known good IPs

### Still receiving spam
- Check logs to see which layer caught it (or didn't)
- Review spam patterns and add more detection rules
- Consider implementing Cloudflare at DNS level for additional protection
- Enable email notifications for blocked attempts (future feature)

## 🔒 Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Monitor logs** regularly for patterns
4. **Update reCAPTCHA keys** if compromised
5. **Consider Redis** for IP blocking in production (instead of in-memory)

---

**Last Updated**: Implementation complete with 5-layer protection
**Status**: ✅ Active and blocking spam

