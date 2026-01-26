# FROM_EMAIL Configuration Guide

## What is FROM_EMAIL?

`FROM_EMAIL` is the email address that appears as the **sender** when emails are sent via **SendGrid**.

## When is FROM_EMAIL Used?

`FROM_EMAIL` is **only required if you're using SendGrid**. It's not needed for SMTP-only setups.

### Email Flow:

1. **SendGrid (Primary)** - Uses `FROM_EMAIL` as sender
   - Requires: `SENDGRID_API_KEY` + `FROM_EMAIL`
   - `FROM_EMAIL` must be verified in SendGrid dashboard

2. **SMTP Fallback** - Uses `EMAIL_USER` as sender
   - Requires: `EMAIL_USER` + `EMAIL_PASS`
   - `FROM_EMAIL` not needed

## How Email Sending Works

The code tries in this order:

1. **SendGrid First** (if `SENDGRID_API_KEY` and `FROM_EMAIL` are set)
   - Sender: `FROM_EMAIL`
   - Recipient: `CONTACT_EMAIL` or `FROM_EMAIL`

2. **SMTP Fallback** (if SendGrid fails or not configured)
   - Sender: `EMAIL_USER`
   - Recipient: `CONTACT_EMAIL` or `EMAIL_USER`

## Setup Instructions

### Option 1: SMTP Only (No FROM_EMAIL needed)

**Set these in production:**
```bash
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew
SMTP_PORT=2525
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

**Don't set:**
- `FROM_EMAIL` (not needed)
- `SENDGRID_API_KEY` (not needed)

### Option 2: SendGrid (Requires FROM_EMAIL)

**Set these in production:**
```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=contact@swagatodisha.com  # REQUIRED - Must be verified in SendGrid
CONTACT_EMAIL=swagatgroupinfo@gmail.com

# SMTP as fallback (optional)
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew
SMTP_PORT=2525
```

## Verifying FROM_EMAIL in SendGrid

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Sender Authentication**
3. Click **Verify a Single Sender**
4. Enter your email (e.g., `contact@swagatodisha.com`)
5. Complete verification:
   - Check your email inbox
   - Click verification link
   - Email is now verified

**Important:** The email you set as `FROM_EMAIL` **must be verified** in SendGrid, otherwise emails will fail.

## Current Recommendation

Since you want to use **Gmail SMTP**:

**You DON'T need FROM_EMAIL** - Just set:
```bash
EMAIL_USER=swagatgroupinfo@gmail.com
EMAIL_PASS=mhlhposwhkedgbew
SMTP_PORT=2525
CONTACT_EMAIL=swagatgroupinfo@gmail.com
```

`FROM_EMAIL` is only needed if you want to use SendGrid as the primary email service.

## Summary

| Configuration | FROM_EMAIL Required? | What to Set |
|--------------|----------------------|-------------|
| SMTP Only | ❌ No | `EMAIL_USER`, `EMAIL_PASS`, `SMTP_PORT` |
| SendGrid Only | ✅ Yes | `SENDGRID_API_KEY`, `FROM_EMAIL` |
| SendGrid + SMTP Fallback | ✅ Yes | Both sets above |

## For Your Setup (Gmail SMTP)

**You only need:**
- ✅ `EMAIL_USER`
- ✅ `EMAIL_PASS`
- ✅ `SMTP_PORT=2525`
- ✅ `CONTACT_EMAIL`

**You don't need:**
- ❌ `FROM_EMAIL` (only for SendGrid)
- ❌ `SENDGRID_API_KEY` (only for SendGrid)

