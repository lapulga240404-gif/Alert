# 🚀 DEPLOY NOW - Never Miss a Restock!

## ⚡ Quick Deploy (10 Minutes)

### Step 1: Deploy to Vercel

```bash
cd "c:\Users\karan\Downloads\bot windows\nextjs-version"
vercel --prod
```

**First time?**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Follow prompts (accept all defaults)

### Step 2: Add Environment Variables in Vercel

After deployment, go to Vercel dashboard:
👉 https://vercel.com/dashboard

1. Click your project
2. Go to **Settings** → **Environment Variables**
3. Add these one by one:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1552368794587103452/3_pnUh0aNawQaZT7zny4mjbPgAq7zwd8DePyCr_PoobnP7rANLUQ8I8qdz4DOi0hHy5h

DISCORD_USER_ID=524611986580045825

BLINKIT_AUTH_KEY=c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477

BLINKIT_TOKEN=v2::82cbc4c0-9d80-49ed-ac46-8e49046bebeb

LATITUDE=28.5589

LONGITUDE=77.2609

BOMB_COUNT=3

BOMB_INTERVAL_MS=2000

NEXT_PUBLIC_SUPABASE_URL=https://ynxiutpskmxwrqvolnce.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueGl1dHBza214d3Jxdm9sbmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODEzNjUsImV4cCI6MjEwNTc1NzM2NX0.u-b7tHG4nGo6QqvgIvxmMGaqLZk6TWN8Bmtcpisf_RY
```

4. Click **"Save"** after each one
5. Click **"Redeploy"** at the top

### Step 3: Set Up Cron Job (Free)

**Option A: cron-job.org (Recommended - 100% Free)**

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up (free)
3. Create new cron job:
   - **Title**: Stock Tracker
   - **URL**: `https://your-app.vercel.app/api/cron/check-stock`
   - **Schedule**: Every 5 minutes
   - **Notification**: Enable (get email if it fails)
4. Save and activate

**Option B: EasyCron**

1. Go to [easycron.com](https://www.easycron.com)
2. Free tier: 20 jobs
3. Same setup as above

**Option C: UptimeRobot**

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor
3. Set to check every 5 minutes

### Step 4: Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Add a product**
3. **Click "Check Now"** - Should send Discord alert
4. **Wait 5 minutes** - Cron job should run automatically

### Step 5: Verify Cron is Working

Check cron logs:
- cron-job.org dashboard shows execution history
- Should see "Success 200" status

Check Vercel logs:
- Vercel dashboard → Functions → View logs
- Should see "Stock check complete"

---

## ✅ What You'll Get:

### 🎯 24/7 Monitoring
- ✅ Checks every 5 minutes (8,640 times/month)
- ✅ Works when your PC is OFF
- ✅ Works when you're sleeping
- ✅ Works when you're at work

### 🔔 Instant Alerts
- ✅ Discord notification in 2-3 seconds
- ✅ 3x message bomb (impossible to miss)
- ✅ @mentions you for push notification
- ✅ Works on phone + desktop

### 💾 Permanent Storage
- ✅ Products saved in Supabase database
- ✅ Never lose your tracking list
- ✅ Add/remove products from anywhere
- ✅ Web dashboard accessible 24/7

### 💰 100% Free Forever
- ✅ Vercel free tier: 100 GB-Hours/month
- ✅ Supabase free tier: 500MB database
- ✅ cron-job.org: Free forever
- ✅ Discord webhooks: Free

---

## 📊 Usage Monitoring

### Vercel Usage
Check: https://vercel.com/dashboard/usage
- Each cron run = ~0.1 GB-Hours
- 8,640 runs/month = ~864 GB-Hours
- Free tier = 100 GB-Hours (should be fine)

### Supabase Usage
Check: https://app.supabase.com/project/ynxiutpskmxwrqvolnce/settings/usage
- Each check = tiny query
- Free tier = 2GB bandwidth/month (more than enough)

---

## 🎮 How to Use After Deploy

### Add Products:
1. Visit: `https://your-app.vercel.app`
2. Click "➕ Add Product"
3. Paste URL
4. Toggle 🟢 to enable tracking

### Check Manually:
- Click "🔍 Check Now" - Instant check + Discord alert

### Pause Tracking:
- Toggle 🔴 to pause (won't send alerts)

### Delete Product:
- Click "🗑️ Delete"

---

## 🔥 Pro Tips

### 1. Start with Hot Items
- Add items that restock frequently
- Test the system first

### 2. Use "Check Now" First
- Before enabling auto-tracking
- Make sure the product URL works

### 3. Check Interval
- 5 minutes = Standard
- 10 minutes = More conservative (less function calls)
- 1 minute = Aggressive (use for super hot items)

### 4. Monitor First Week
- Check cron-job.org logs
- Verify alerts are working
- Adjust interval if needed

### 5. Mobile Access
- Bookmark dashboard on phone
- Manage products anywhere
- Get Discord push notifications

---

## 🚨 Never Miss a Restock Again!

Once deployed:
- ✅ System runs 24/7
- ✅ Instant Discord alerts
- ✅ Multiple checks per hour
- ✅ Persistent tracking list
- ✅ Access from anywhere

**Your products won't go out of hand - you'll be the FIRST to know when they're back in stock!** 🏆

---

## 🆘 Troubleshooting

### Cron not running?
- Check cron-job.org execution logs
- Verify URL is correct
- Test URL manually in browser

### No Discord alerts?
- Test with "🔔 Test Discord" button
- Verify webhook URL is correct
- Check Discord server permissions

### Products not saving?
- Check Supabase table editor
- Verify env variables in Vercel
- Check browser console for errors

---

## 📞 Next Steps

1. **Deploy now**: `vercel --prod`
2. **Add env vars**: Vercel dashboard
3. **Set up cron**: cron-job.org
4. **Add products**: Your dashboard
5. **Relax**: System watches for you! 😎

**Deploy in the next 10 minutes and never miss a restock again!** 🚀
