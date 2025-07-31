# Email Notifications Setup Guide

## Overview
This guide shows how to set up booking confirmation emails using Supabase Edge Functions + Resend.

## Step 1: Sign up for Resend (Free)

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address
4. Go to API Keys section and create a new API key
5. Copy the API key (starts with `re_`)

## Step 2: Add API Key to Supabase

### Option A: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Go to Settings → Edge Functions
3. Add environment variable:
   - Name: `RESEND_API_KEY`
   - Value: `your_resend_api_key_here`

### Option B: Via CLI
```bash
# Set the environment variable
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

## Step 3: Deploy the Edge Function

```bash
# Deploy the edge function
supabase functions deploy send-booking-confirmation
```

## Step 4: Verify Domain (Optional but Recommended)

1. In Resend dashboard, go to Domains
2. Add your domain: `paddleplayplanner.com` 
3. Add the required DNS records to your domain provider
4. Once verified, you can send emails from `bookings@paddleplayplanner.com`

**Without domain verification:** Emails will be sent from `onboarding@resend.dev` but marked as "via resend.dev"

## Step 5: Test the Implementation

1. Book a slot in your app
2. Check your email for the confirmation
3. Check Supabase Functions logs for any errors:
   ```bash
   supabase functions logs send-booking-confirmation
   ```

## Current Email Template Features

✅ **Professional HTML email design**
✅ **Booking details (venue, date, time)**  
✅ **Booking ID for reference**
✅ **Direct link to "My Bookings" page**
✅ **Instructions for users**
✅ **Responsive design**

## Customization Options

### Update Email Template
Edit `supabase/functions/send-booking-confirmation/index.ts` to customize:
- Email subject line
- HTML template design
- Email content
- From address (after domain verification)

### Add More Email Types
You can create additional edge functions for:
- Booking cancellation emails
- Booking reminders (day before)
- Booking check-in confirmations
- Venue change notifications

## Cost Breakdown

**Resend Free Tier:**
- 3,000 emails/month
- Up to 100 emails/day
- All email types included

**Paid Plans (if needed):**
- $20/month for 50,000 emails
- Very affordable for most use cases

## Troubleshooting

### Common Issues:
1. **Edge function not found:** Run `supabase functions deploy`
2. **API key errors:** Check environment variable in Supabase dashboard
3. **Email not delivered:** Check spam folder, verify Resend dashboard logs
4. **Function timeout:** Check Supabase function logs for errors

### Debugging Commands:
```bash
# View function logs
supabase functions logs send-booking-confirmation

# Test function locally
supabase functions serve send-booking-confirmation

# Check environment variables
supabase secrets list
```

## Security Notes

✅ **API key is secure** - Stored as Supabase secret
✅ **Edge function is protected** - Only callable via Supabase auth
✅ **No sensitive data exposed** - Email content is generated server-side
✅ **Proper error handling** - Booking succeeds even if email fails

## Next Steps

After basic setup works:
1. Verify your domain for professional emails
2. Add email analytics (Resend provides open/click tracking)
3. Create additional email templates for other events
4. Set up email scheduling for reminders