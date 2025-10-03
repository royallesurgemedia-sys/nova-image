# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (free tier works)
2. Your GitHub repository connected to Lovable
3. Hugging Face API token configured in Lovable Cloud

## Step 1: Connect GitHub to Lovable
1. In Lovable, click **GitHub** → **Connect to GitHub**
2. Authorize Lovable on GitHub
3. Click **Create Repository** in Lovable
4. Your code will automatically sync to GitHub

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the following settings:

### Framework Preset
- Select: **Vite**

### Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Environment Variables
Add these three environment variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://suoanmbwqtpkgzzouvje.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1b2FubWJ3cXRwa2d6em91dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzIxMTMsImV4cCI6MjA3NDg0ODExM30.IP1fnWL8EcmG_3iApIBE3VT7I1TOFIa63cj20MjQNug` |
| `VITE_SUPABASE_PROJECT_ID` | `suoanmbwqtpkgzzouvje` |

4. Click **Deploy**

## Step 3: Your App is Live! 🎉
- Vercel will build and deploy your app
- You'll get a URL like: `your-app.vercel.app`
- Every push to your GitHub repo will auto-deploy

## Important Notes

### Edge Functions
Your Supabase edge functions (`generate-image`, `run-scheduled-posts`) run on **Lovable Cloud's Supabase**, not on Vercel. This means:
- ✅ They continue to work automatically
- ✅ No need to deploy them separately
- ✅ Secrets (Hugging Face token) stay secure in Lovable Cloud

### Scheduling System
The scheduled posts won't run automatically on Vercel. To enable automation:

**Option 1: Vercel Cron Jobs (Recommended)**
1. Create `vercel.json` in your project root:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "*/5 * * * *"
  }]
}
```
2. Create an API route to call your edge function

**Option 2: External Cron Service**
Use a service like [cron-job.org](https://cron-job.org) to ping:
```
https://suoanmbwqtpkgzzouvje.supabase.co/functions/v1/run-scheduled-posts
```

**Option 3: Supabase pg_cron (Easiest)**
Run this SQL in your Lovable Cloud backend:
```sql
SELECT cron.schedule(
  'run-scheduled-posts',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://suoanmbwqtpkgzzouvje.supabase.co/functions/v1/run-scheduled-posts',
    headers:='{"Content-Type": "application/json"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

## Custom Domain
1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Troubleshooting

### Build fails
- Check that all dependencies are in `package.json`
- Ensure Node version is compatible (18+)

### Environment variables not working
- Make sure they start with `VITE_`
- Redeploy after adding new variables

### Images not generating
- Verify Hugging Face token is added in Lovable Cloud
- Check edge function logs in Lovable Cloud backend

## Free Forever Setup ✅
- Hugging Face: 1,000 free images/day
- Vercel: Free tier for personal projects
- Lovable Cloud: Free tier with edge functions

With 50 images/month, you'll stay well within all free limits!
