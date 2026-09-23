# 🚂 Deploy to Railway - Complete Guide

## Why Railway?

✅ **FREE Tier** - $5/month free credits (enough for this app)
✅ **Always Running** - No cold starts, persistent processes
✅ **node-cron Works** - Background jobs run 24/7
✅ **Auto SSL** - Free HTTPS domain
✅ **Easy Deployment** - Deploy from GitHub in minutes

## 📋 Prerequisites

1. ✅ Git installed (already verified)
2. ✅ GitHub account (free)
3. ✅ Railway account (free - we'll create it)

## 🚀 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# Navigate to project
cd "c:\Users\karan\Downloads\bot windows\nextjs-version"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Stock Tracker with node-cron"

# Create repository on GitHub and push
# Go to: https://github.com/new
# Repository name: stock-tracker
# Public or Private: Your choice
# Don't initialize with README

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/stock-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Railway to access your GitHub

### Step 3: Deploy Your Project

1. **On Railway Dashboard**, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **stock-tracker** repository
4. Railway will auto-detect it's a Next.js app
5. Click **"Deploy Now"**

### Step 4: Add Environment Variables

In Railway dashboard:

1. Click on your deployed project
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these one by one:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://ynxiutpskmxwrqvolnce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1552368794587103452/...
DISCORD_USER_ID=524611986580045825

# Blinkit
BLINKIT_AUTH_KEY=c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477
BLINKIT_TOKEN=v2::78b03261-8e6e-4106-a900-12890cd133a9

# Locations (Default fallback)
LATITUDE=13.090095338307554
LONGITUDE=77.63371485346111
```

5. Click **"Deploy"** or wait for auto-redeploy

### Step 5: Get Your App URL

1. In Railway dashboard, go to **"Settings"** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://stock-tracker-production.up.railway.app`
4. Copy this URL!

### Step 6: Start the Cron

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. You'll see: `🔴 Auto-Check: Stopped`
3. Click **"▶️ Start"** button
4. Status changes to: `🟢 Auto-Check: Every 1 minute`
5. **Done!** Cron is now running 24/7

### Step 7: Verify It's Working

**Check Logs:**
1. In Railway dashboard, click **"Deployments"** tab
2. Click on latest deployment
3. Click **"View Logs"**
4. You should see:
   ```
   🚀 Cron service started - Running every 1 minute
   🔍 [CRON] Starting stock check...
   ✅ Product [Location]: In Stock | ₹299
   ```

**Check Discord:**
- Wait 1-2 minutes
- You should receive Discord alerts for in-stock products!

## 🔧 Managing Your Deployment

### View Logs
- Railway Dashboard → Your Project → Deployments → View Logs

### Restart App
- Railway Dashboard → Your Project → Settings → Restart

### Update Code
```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Railway auto-deploys on push!
```

### Stop/Start Cron
- Just visit your app URL and use the **▶️ Start / ⏸️ Stop** button
- Works from anywhere, anytime!

## 💰 Railway Free Tier

**What you get:**
- $5 free credits per month
- ~500 hours of runtime (enough for 24/7)
- No credit card required initially
- Auto-sleep after 7 days of inactivity (but cron keeps it active!)

**Usage Tips:**
- Your app should use ~$3-4/month
- Monitor usage in Railway dashboard
- If you exceed free tier, add a credit card or app pauses

## 🐛 Troubleshooting

### Build Fails
**Solution:** Check Railway logs for errors. Common issues:
- Missing dependencies: Run `npm install` locally first
- Incorrect Node version: Railway uses latest by default

### Cron Not Running
**Solution:** 
1. Visit your app URL
2. Click **"▶️ Start"** button
3. Check logs to confirm: `🚀 Cron service started`

### Environment Variables Not Working
**Solution:**
1. Railway Dashboard → Variables tab
2. Verify all variables are added
3. Click **"Redeploy"** after adding variables

### Puppeteer Fails
**Solution:** Railway should auto-install chromium. If not:
1. Check logs for Puppeteer errors
2. May need to add buildpack for chromium

### App Crashes
**Solution:**
1. Check logs for error messages
2. Common issue: Missing environment variable
3. Verify Supabase URL and keys are correct

## 📱 Access Your Dashboard Anywhere

Once deployed, you can:
- ✅ Open `https://your-app.up.railway.app` from **any device**
- ✅ Manage products from **phone, tablet, or computer**
- ✅ Start/stop cron from **anywhere**
- ✅ Works even when **your laptop is off**!

## 🔐 Security Tips

1. **Keep .env.local local** - Don't commit secrets to GitHub
2. **Use Railway Variables** - For production secrets
3. **Private Repo** - Consider making GitHub repo private
4. **Rotate Keys** - If you accidentally expose Supabase keys

## 🎉 You're Done!

Your stock tracker is now:
- ✅ **Running 24/7** on Railway
- ✅ **Auto-checking every 1 minute**
- ✅ **Sending Discord alerts**
- ✅ **Accessible from anywhere**
- ✅ **Free hosting!**

## 📞 Support

**Railway Issues:**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

**App Issues:**
- Check logs in Railway dashboard
- Verify environment variables
- Test cron with "Check Now" button

---

**Happy Tracking! 🚀**

Deploy once, track forever!
