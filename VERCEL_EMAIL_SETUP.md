# Vercel Email Setup Guide

## Overview

For Vercel deployments, the contact form uses a Node.js serverless function (`/api/contact.js`) with Nodemailer instead of PHP/PHPMailer.

## Setup Options

### Option 1: Using Gmail SMTP (Quick Setup)

1. Go to your Google Account settings
2. Enable "2-Step Verification"
3. Generate an "App Password" for mail
4. Set these environment variables in Vercel:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Option 2: Using SendGrid (Recommended for Production)

1. Sign up for SendGrid (free tier available)
2. Create an API key
3. Set these environment variables in Vercel:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### Option 3: Using Resend (Modern Alternative)

Resend is a modern email API. To use it, you'd need to modify `api/contact.js` to use Resend's SDK instead of Nodemailer.

1. Install Resend: `npm install resend`
2. Get API key from https://resend.com
3. Set environment variable: `RESEND_API_KEY=your-key`

### Option 4: Using ProtonMail Bridge (For ProtonMail)

If you want to send from `peptidemap@proton.me`, you'll need to:
1. Set up ProtonMail Bridge on a server
2. Configure SMTP to use the bridge
3. Or use ProtonMail's API if available

## Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the SMTP variables listed above
4. Redeploy your application

## Testing

After setting up environment variables:
1. Deploy to Vercel
2. Test the contact form
3. Check Vercel function logs if emails aren't sending

## Fallback Behavior

The frontend code automatically falls back to `php/api/contact.php` if the Vercel API endpoint fails. This ensures compatibility with both Vercel and traditional PHP hosting (like InfinityFree).

## Troubleshooting

- **Emails not sending**: Check Vercel function logs in the dashboard
- **SMTP errors**: Verify your SMTP credentials and port settings
- **CORS errors**: The function already includes CORS headers
- **Rate limiting**: Some SMTP providers have rate limits on free tiers

