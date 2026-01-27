# Resend Email Service Setup (Super Easy!)

## Why Resend?

- ✅ **3,000 emails/month FREE** (perfect for 50/month!)
- ✅ **No subscription needed**
- ✅ **Super easy setup** - just API key
- ✅ **No domain verification** needed for testing
- ✅ **No credit card** required
- ✅ **HTTP API** (works everywhere)

## Quick Setup (2 Minutes)

### Step 1: Get Free API Key

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Go to **API Keys** in dashboard
5. Click **"Create API Key"**
6. Copy the API key (starts with `re_`)

### Step 2: Add to .env

Add to your `backend/.env` file:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_EMAIL=contact@swagatodisha.com
```

**That's it!** No domain verification, no complicated setup.

### Step 3: Install Package

```bash
cd backend
npm install
```

### Step 4: Test

```bash
node test-resend.js
```

Or test via API:
```
http://localhost:5000/api/contact/test-resend
```

## ✅ Done!

Your email service is ready! No subscription, no domain verification, just works.

## Free Tier Limits

- **3,000 emails/month** (way more than your 50/month!)
- **100 emails/day**
- Perfect for your use case

## For Production (Optional)

If you want to use your own domain later:
1. Add domain in Resend dashboard
2. Add DNS records
3. Update `RESEND_FROM_EMAIL` to your domain

But for now, `onboarding@resend.dev` works perfectly!

## Comparison

| Feature | Resend | Mailgun |
|---------|--------|---------|
| Free Tier | 3,000/month | 5,000/month |
| Setup Time | 2 minutes | 10+ minutes |
| Domain Verification | Not needed | Required |
| Authorized Recipients | Not needed | Required (sandbox) |
| Credit Card | Not needed | Not needed |

**Resend wins for simplicity!** 🎉

