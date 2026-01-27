# Mailgun HTTP API Quick Setup Checklist

Follow these steps to quickly set up Mailgun's **HTTP REST API** (not SMTP) for your Swagat Odisha application.

**Note:** This uses Mailgun's HTTP API (`api.mailgun.net`), not SMTP.

## ✅ Quick Setup Steps

### 1. Create Mailgun Account
- [ ] Go to [mailgun.com](https://www.mailgun.com) and sign up
- [ ] Verify your email address

### 2. Get Your HTTP API Credentials
- [ ] Go to **Sending** → **API Keys** in Mailgun dashboard
- [ ] Copy your **Private API Key** (starts with `key-`) - This is for HTTP API
- [ ] Note your domain (either sandbox or your custom domain)
- [ ] **Important:** We use HTTP API, NOT SMTP. You don't need SMTP credentials.

### 3. For Testing (Use Sandbox Domain)
- [ ] Use the default sandbox domain (e.g., `sandbox1234567890.mailgun.org`)
- [ ] Go to **Sending** → **Authorized Recipients**
- [ ] Add your email address as authorized recipient
- [ ] This allows you to receive test emails

### 4. For Production (Use Your Own Domain)
- [ ] Go to **Sending** → **Domains** → **Add New Domain**
- [ ] Enter your domain (e.g., `swagatodisha.com`)
- [ ] Add DNS records provided by Mailgun to your domain
- [ ] Wait for DNS verification (1-48 hours)
- [ ] Verify domain in Mailgun dashboard

### 5. Configure Environment Variables

**Local (.env file):**
```bash
MAILGUN_API_KEY=key-your-actual-api-key-here
MAILGUN_DOMAIN=sandbox1234567890.mailgun.org  # or your-domain.com
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890.mailgun.org  # or noreply@your-domain.com
CONTACT_EMAIL=your-email@example.com
```

**Production (Hosting Platform):**
- [ ] Add `MAILGUN_API_KEY` to environment variables
- [ ] Add `MAILGUN_DOMAIN` to environment variables
- [ ] Add `MAILGUN_FROM_EMAIL` to environment variables
- [ ] Add `CONTACT_EMAIL` to environment variables

### 6. Install Dependencies
```bash
cd backend
npm install
```

### 7. Test the Setup
```bash
# Option 1: Run test script
node test-mailgun.js

# Option 2: Test via API
curl http://localhost:5000/api/contact/test-mailgun
```

### 8. Verify
- [ ] Check server logs for "✅ Mailgun configured successfully"
- [ ] Check your email inbox for test email
- [ ] Check Mailgun dashboard → **Sending** → **Logs** for sent emails

## 🎯 Example Configuration

### For Testing (Sandbox)
```env
MAILGUN_API_KEY=key-abc123def456...
MAILGUN_DOMAIN=sandbox1234567890.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890.mailgun.org
CONTACT_EMAIL=your-email@gmail.com
```

### For Production (Your Domain)
```env
MAILGUN_API_KEY=key-abc123def456...
MAILGUN_DOMAIN=swagatodisha.com
MAILGUN_FROM_EMAIL=noreply@swagatodisha.com
CONTACT_EMAIL=contact@swagatodisha.com
```

## ⚠️ Important Notes

1. **Sandbox Domain Limitations:**
   - Can only send to authorized recipients
   - Add recipients in Mailgun dashboard before testing

2. **API Key Security:**
   - Never commit API keys to Git
   - Use environment variables only
   - Rotate keys periodically

3. **DNS Verification:**
   - Required for custom domains
   - Can take 1-48 hours to propagate
   - Use Mailgun's verification tool to check status

4. **Free Tier Limits:**
   - 5,000 emails/month
   - 100 emails/day
   - Perfect for small to medium applications

## 🚀 Next Steps

Once setup is complete:
1. Test contact form submission
2. Monitor Mailgun dashboard for delivery stats
3. Set up email templates (already included)
4. Configure webhooks for bounce handling (optional)

## 📚 Full Documentation

See `MAILGUN_SETUP_GUIDE.md` for detailed setup instructions and troubleshooting.

## 🆘 Need Help?

- Check Mailgun dashboard logs
- Review server console logs
- See troubleshooting section in `MAILGUN_SETUP_GUIDE.md`
- Mailgun Support: [support.mailgun.com](https://support.mailgun.com)

