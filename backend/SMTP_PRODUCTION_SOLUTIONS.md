# SMTP Production Solutions

## Problem
Render free tier blocks SMTP ports 587 and 465, causing connection timeouts.

## Solutions to Make SMTP Work in Production

### Option 1: Use Mailgun SMTP (Recommended)
Mailgun provides SMTP on port 587 that works with cloud platforms.

**Setup:**
1. Sign up at https://www.mailgun.com/ (free tier available)
2. Verify your domain or use sandbox domain
3. Get SMTP credentials from Mailgun dashboard

**Environment Variables:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-smtp-password
```

### Option 2: Use Sendinblue (Brevo) SMTP
Sendinblue provides SMTP that works on cloud platforms.

**Setup:**
1. Sign up at https://www.brevo.com/ (free tier: 300 emails/day)
2. Get SMTP credentials from Settings → SMTP & API

**Environment Variables:**
```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-brevo-smtp-key
```

### Option 3: Use AWS SES SMTP
Amazon SES provides reliable SMTP service.

**Setup:**
1. Sign up for AWS
2. Verify email/domain in SES
3. Create SMTP credentials

**Environment Variables:**
```bash
SMTP_HOST=email-smtp.region.amazonaws.com  # Replace 'region' with your region
SMTP_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

### Option 4: Use Gmail OAuth2 (More Complex)
Gmail OAuth2 might work better than app passwords on cloud platforms.

### Option 5: Use a Different Hosting Platform
- Railway.app - Allows SMTP
- Fly.io - Allows SMTP
- DigitalOcean App Platform - Allows SMTP
- Heroku - Allows SMTP (paid plans)

### Option 6: Use SMTP Relay Service
Services like:
- Mailjet
- Postmark
- SparkPost

All provide SMTP that works on cloud platforms.

## Quick Implementation

The code already supports custom SMTP hosts and ports. Just set:
- `SMTP_HOST` - Your SMTP provider's host
- `SMTP_PORT` - Usually 587 or 465
- `EMAIL_USER` - Your SMTP username
- `EMAIL_PASS` - Your SMTP password

The code will automatically use these settings.

