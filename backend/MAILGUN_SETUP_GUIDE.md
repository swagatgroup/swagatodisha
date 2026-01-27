# Mailgun HTTP API Setup Guide for Swagat Odisha

This guide will help you set up Mailgun's **HTTP REST API** (not SMTP) for sending emails through the contact form and other email notifications.

**Important:** This implementation uses Mailgun's HTTP API (`api.mailgun.net`), which makes HTTP POST requests. It does NOT use SMTP.

## Step 1: Create a Mailgun Account

1. Go to [https://www.mailgun.com](https://www.mailgun.com)
2. Click **"Sign Up"** or **"Start Free"**
3. Create an account with your email address
4. Verify your email address

## Step 2: Add and Verify Your Domain

### Option A: Use Your Own Domain (Recommended for Production)

1. Log in to your Mailgun dashboard
2. Navigate to **Sending** → **Domains**
3. Click **"Add New Domain"**
4. Enter your domain (e.g., `swagatodisha.com`)
5. Choose **"Send emails"** as the domain type
6. Click **"Add Domain"**

7. **Verify Domain Ownership:**
   - Mailgun will provide DNS records to add to your domain
   - You need to add these DNS records to your domain's DNS settings:
     - **TXT Record** for domain verification
     - **TXT Record** for SPF
     - **CNAME Record** for DKIM
     - **MX Record** (optional, for receiving emails)
   
   Example DNS records:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:mailgun.org ~all
   
   Type: TXT
   Name: mailo._domainkey
   Value: (provided by Mailgun)
   
   Type: CNAME
   Name: email
   Value: mailgun.org
   ```

8. Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)
9. Click **"Verify DNS Settings"** in Mailgun dashboard

### Option B: Use Mailgun Sandbox Domain (For Testing)

1. In Mailgun dashboard, go to **Sending** → **Domains**
2. You'll see a default sandbox domain like `sandbox1234567890.mailgun.org`
3. **Important:** Sandbox domains can only send to **authorized recipients**
4. To authorize recipients:
   - Go to **Sending** → **Authorized Recipients**
   - Click **"Add Recipient"**
   - Add email addresses you want to receive test emails

## Step 3: Get Your API Key (For HTTP API)

1. In Mailgun dashboard, go to **Sending** → **API Keys**
2. You'll see your **Private API Key** (starts with something like `key-...`)
3. Click **"Reveal"** to show the full API key
4. **Copy this key** - you'll need it for HTTP API authentication
5. **Note:** This is for HTTP API, NOT SMTP credentials. We use HTTP API, not SMTP.

## Step 4: Configure Environment Variables

### For Local Development (.env file)

Add these variables to your `backend/.env` file:

```bash
# Mailgun Configuration (Primary Email Service)
MAILGUN_API_KEY=key-your-api-key-here
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com

# Contact Email (where contact form emails are sent)
CONTACT_EMAIL=contact@swagatodisha.com

# Optional: SMTP Fallback (if Mailgun fails)
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
```

### For Production (Render/Vercel/etc.)

1. Go to your hosting platform's dashboard
2. Navigate to **Environment Variables** or **Config Vars**
3. Add the following variables:

```
MAILGUN_API_KEY=key-your-api-key-here
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
CONTACT_EMAIL=contact@swagatodisha.com
```

**Important Notes:**
- Replace `your-api-key-here` with your actual Mailgun API key
- Replace `your-domain.com` with your verified Mailgun domain
- The `MAILGUN_FROM_EMAIL` should be an email address from your verified domain
- If using sandbox domain, use `sandbox1234567890.mailgun.org` as the domain

## Step 5: Install Dependencies

Make sure you have the required package installed:

```bash
cd backend
npm install
```

This will install `mailgun.js` package (already added to package.json).

## Step 6: Test the Setup

### Option 1: Test via API Endpoint

```bash
# Test Mailgun configuration
curl http://localhost:5000/api/contact/test-mailgun
```

Or open in browser:
```
http://localhost:5000/api/contact/test-mailgun
```

### Option 2: Test via Command Line

```bash
cd backend
node test-mailgun.js
```

### Option 3: Test via Contact Form

1. Go to your frontend contact form
2. Submit a test message
3. Check server logs for Mailgun confirmation
4. Verify emails are received

## Step 7: Verify It's Working

### Check Server Logs

When you send a test email, you should see:

```
✅ Mailgun configured successfully
📧 Attempting to send emails via Mailgun...
✅ Contact form admin email sent via Mailgun
✅ Contact form user confirmation sent via Mailgun
📧 Mailgun Email Sending Summary: {
  adminEmailSent: true,
  userEmailSent: true,
  method: 'Mailgun'
}
```

### Check Mailgun Dashboard

1. Go to **Sending** → **Logs** in Mailgun dashboard
2. You should see your sent emails listed
3. Check delivery status (Delivered, Failed, etc.)

### Check Your Email Inbox

- Admin notification email should arrive at `CONTACT_EMAIL`
- User confirmation email should arrive at the user's email

## Troubleshooting

### Issue: "Mailgun not configured"

**Solution:**
- Check that `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are set in environment variables
- Restart your server after adding environment variables
- Verify the API key is correct (starts with `key-`)

### Issue: "Domain not verified"

**Solution:**
- Make sure DNS records are added correctly
- Wait for DNS propagation (can take up to 48 hours)
- Use Mailgun's DNS verification tool to check status
- For testing, use sandbox domain instead

### Issue: "Unauthorized recipient" (Sandbox domain)

**Solution:**
- If using sandbox domain, add recipient email to authorized recipients list
- Go to **Sending** → **Authorized Recipients** in Mailgun dashboard
- Add the email address you're trying to send to

### Issue: Emails not being delivered

**Solution:**
- Check Mailgun dashboard logs for delivery status
- Verify domain DNS records are correct
- Check spam folder
- Ensure `MAILGUN_FROM_EMAIL` is from verified domain
- Check Mailgun account limits (free tier has limits)

### Issue: "Invalid API key"

**Solution:**
- Verify API key is copied correctly (no extra spaces)
- Make sure you're using the **Private API Key**, not Public
- Regenerate API key in Mailgun dashboard if needed

## Mailgun Free Tier Limits

- **5,000 emails/month** for free
- **100 emails/day** sending limit
- Sandbox domain can only send to authorized recipients
- For production, verify your own domain

## Production Recommendations

1. **Verify your own domain** (not sandbox)
2. **Set up SPF, DKIM, and DMARC** records properly
3. **Monitor email logs** in Mailgun dashboard
4. **Set up webhooks** for bounce/complaint handling (optional)
5. **Use environment variables** for all sensitive data
6. **Keep SMTP as fallback** for reliability

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** periodically
4. **Monitor Mailgun logs** for suspicious activity
5. **Set up rate limiting** (already implemented in contact form)

## Support

- Mailgun Documentation: [https://documentation.mailgun.com](https://documentation.mailgun.com)
- Mailgun Support: [https://www.mailgun.com/support](https://www.mailgun.com/support)
- Mailgun Status: [https://status.mailgun.com](https://status.mailgun.com)

## Next Steps

After setup is complete:

1. ✅ Test email sending works
2. ✅ Verify emails are delivered
3. ✅ Check spam folder (if emails not in inbox)
4. ✅ Monitor Mailgun dashboard for delivery stats
5. ✅ Set up email templates if needed (already included)
6. ✅ Configure webhooks for bounce handling (optional)

---

**Note:** The system automatically falls back to SMTP if Mailgun fails, ensuring reliability even if Mailgun has issues.

