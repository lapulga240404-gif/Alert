# 🚀 Quick Deploy to Railway - 5 Minutes

## Step 1: Push to GitHub (2 minutes)

```bash
# Open terminal in project folder
cd "c:\Users\karan\Downloads\bot windows\nextjs-version"

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Stock tracker with node-cron"

# Go to GitHub: https://github.com/new
# Create new repository called "stock-tracker"
# Don't initialize with anything

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/stock-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway (2 minutes)

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign in with **GitHub**
4. Click **"Deploy from GitHub repo"**
5. Select **"stock-tracker"**
6. Wait for build to complete (~2 min)

## Step 3: Add Environment Variables (1 minute)

Click your project → **Variables** tab → Add these:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DISCORD_WEBHOOK_URL
DISCORD_USER_ID
BLINKIT_AUTH_KEY
BLINKIT_TOKEN
LATITUDE
LONGITUDE
```

Copy values from your `.env.local` file.

## Step 4: Get Your URL

1. Click **"Settings"** tab
2. Click **"Generate Domain"**
3. Copy your URL: `https://your-app.up.railway.app`

## Step 5: Start Cron!

1. Visit your Railway URL
2. Click **"▶️ Start"** button
3. **Done!** ✅

Your stock tracker is now running 24/7!

---

**Next:** Check Discord for alerts in 1-2 minutes! 🎉
