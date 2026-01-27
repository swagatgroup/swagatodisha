# Mailgun Simple Setup (No Domain Verification)

This is the simplest way to set up Mailgun - using the sandbox domain with authorized recipients. No DNS setup needed!

## Step 1: Get Your Sandbox Domain

1. Sign up at [mailgun.com](https://www.mailgun.com) (free account)
2. After signup, you'll automatically get a sandbox domain like:
   - `sandbox1234567890.mailgun.org`
3. Copy this domain name

## Step 2: Get Your API Key

1. In Mailgun dashboard, go to **Sending** → **API Keys**
2. Copy your **Private API Key** (starts with `key-`)

## Step 3: Add Authorized Recipients

Since you're using sandbox domain, you can only send to authorized recipients:

1. Go to **Sending** → **Authorized Recipients**
2. Click **"Add Recipient"**
3. Add each email address you want to receive emails:
   - `contact@swagatodisha.com` (for admin notifications)
   - Your personal email (for testing)
   - Any other emails you need
4. Check each email inbox and click the verification link

## Step 4: Configure Environment Variables

Add to your `backend/.env` file:

```bash
# Mailgun HTTP API (Simple Setup - Sandbox Domain)
MAILGUN_API_KEY=key-your-api-key-here
MAILGUN_DOMAIN=sandbox1234567890.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890.mailgun.org
CONTACT_EMAIL=contact@swagatodisha.com
```

**Important:** 
- Replace `sandbox1234567890.mailgun.org` with your actual sandbox domain
- Make sure `CONTACT_EMAIL` is added to authorized recipients in Mailgun dashboard

## Step 5: Test

```bash
cd backend
node test-mailgun.js
```

That's it! No DNS setup, no domain verification needed.

## Limitations of Sandbox Domain

- ✅ Free forever
- ✅ No domain verification needed
- ✅ Works immediately
- ❌ Can only send to authorized recipients (must add them first)
- ❌ Limited to 100 emails/day (free tier)

## For Production (Later)

When you're ready for production:
1. Add your own domain in Mailgun
2. Add DNS records (takes 1-48 hours)
3. Update `MAILGUN_DOMAIN` in `.env`
4. No more recipient restrictions!

But for now, sandbox domain is perfect for testing and small deployments.

