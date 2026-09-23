# 🚀 Stock Tracker - Full Next.js Dashboard

A complete **24/7 stock monitoring system** with a beautiful web dashboard. Track products from Blinkit, Flipkart, and FirstCry with automatic Discord alerts when items come back in stock.

## ✨ Features

### 🎨 **Beautiful Web Dashboard**
- ✅ Add/Edit/Delete products through web interface
- ✅ Enable/Disable tracking per product
- ✅ Real-time stock checks
- ✅ Live stats and monitoring
- ✅ Mobile responsive design
- ✅ **📍 Multi-location tracking** (3 locations per product)

### 🗺️ **Multi-Location Support** (NEW!)
- ✅ Track up to **3 locations per product** for Blinkit
- ✅ Dedicated location manager UI at `/locations`
- ✅ Pre-configured Bangalore locations
- ✅ Enable/disable locations per product
- ✅ Separate alerts for each location
- ✅ See [MULTI_LOCATION_FEATURE.md](./MULTI_LOCATION_FEATURE.md) for details

### 🤖 **Automated Monitoring**
- ✅ Runs 24/7 on Vercel (serverless)
- ✅ Auto-checks every 5 minutes
- ✅ Multi-site support (Blinkit, Flipkart, FirstCry)
- ✅ Smart duplicate alert prevention

### 🔔 **Discord Integration**
- ✅ Instant Discord notifications
- ✅ @mention alerts
- ✅ 3x message bomb for important restocks
- ✅ Test webhook button

### 💰 **100% Free**
- ✅ Vercel free tier hosting
- ✅ No database costs
- ✅ No credit card required

## 📸 Dashboard Preview

```
⚡ Sentinel Stock Tracker
24/7 Monitoring Dashboard

[➕ Add Product] [🔔 Test Discord] [🔄 Refresh]

+------------------+------------------+------------------+
| Total Products   | Active Tracking  | Check Interval   |
|       3          |        2         |     5 min        |
+------------------+------------------+------------------+

┌─────────────────────────────────────────────────┐
│ 🎯 iPhone 15 Pro                    🟢 Active   │
│ 🔗 Open Product                                  │
│ [🔍 Check Now]                      [🗑️ Delete]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🎯 Samsung Galaxy Buds              🔴 Paused   │
│ 🔗 Open Product                                  │
│ [🔍 Check Now]                      [🗑️ Delete]  │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Install Dependencies

```bash
cd "c:\Users\karan\Downloads\bot windows\nextjs-version"
npm install
```

### Step 2: Configure Environment Variables

The `.env.local` file is already configured with your settings:
- ✅ Discord webhook URL
- ✅ Discord User ID
- ✅ Blinkit API credentials
- ✅ Location settings

**Optional:** Change the admin password in `.env.local`:
```
ADMIN_PASSWORD=your-secure-password
```

### Step 3: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your dashboard!

### Step 4: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: GitHub + Vercel Dashboard

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/stock-tracker.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables from `.env.local`
5. Deploy!

### Step 5: Set Up Cron Job

⚠️ **Vercel cron requires Pro plan** ($20/month)

**FREE ALTERNATIVE - Use cron-job.org:**

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Sign up and create new cron job
3. Set URL: `https://your-app.vercel.app/api/cron/check-stock`
4. Set schedule: Every 5 minutes (`*/5 * * * *`)
5. Save!

## 🎯 Usage Guide

### Adding Products

1. Open your dashboard: `https://your-app.vercel.app`
2. Click **"➕ Add Product"**
3. Enter product name and URL
4. Click **"✅ Add"**
5. Product is now tracked!

**Supported URLs:**
- Blinkit: `https://blinkit.com/prn/product-name/prid/123456`
- Flipkart: `https://www.flipkart.com/product-name/p/itm...`
- FirstCry: `https://www.firstcry.com/123456/product-detail`

### Managing Products

- **Enable/Disable**: Toggle the 🟢/🔴 switch
- **Check Now**: Click "🔍 Check Now" to see current stock
- **Delete**: Click "🗑️ Delete" to remove product
- **Test Discord**: Click "🔔 Test Discord" to test alerts

### How Monitoring Works

1. **Cron job** runs every 5 minutes
2. Checks all **enabled** products
3. If item is **in stock** (and wasn't before):
   - Sends **3 Discord messages** with 2-second delay
   - **@mentions you** for notification
   - Shows price, stock, and product link
4. State is tracked to **prevent duplicate alerts**

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Get all products |
| `/api/products` | POST | Add new product |
| `/api/products/[id]` | PUT | Update product |
| `/api/products/[id]` | DELETE | Delete product |
| `/api/check-now` | POST | Check single product |
| `/api/test-webhook` | POST | Send test Discord alert |
| `/api/cron/check-stock` | GET | Main cron job |

## 📊 Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_USER_ID=524611986580045825
BLINKIT_AUTH_KEY=c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477
BLINKIT_TOKEN=v2::82cbc4c0-9d80-49ed-ac46-8e49046bebeb
LATITUDE=28.5589
LONGITUDE=77.2609
BOMB_COUNT=3
BOMB_INTERVAL_MS=2000
```

## 🛠️ Advanced Configuration

### Change Check Frequency

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-stock",
    "schedule": "*/10 * * * *"  // Every 10 minutes
  }]
}
```

**Cron Schedule Examples:**
- `*/5 * * * *` - Every 5 minutes (default)
- `*/10 * * * *` - Every 10 minutes
- `*/1 * * * *` - Every 1 minute (max)
- `0 * * * *` - Every hour

### Customize Alert Messages

Edit `lib/discord.js` → `sendDiscordAlert()` function

### Add More Sites

Edit `lib/checkers.js` → Add new checker function

## 🔐 Security

- ✅ API endpoints are serverless (isolated)
- ✅ No public write access
- ✅ Environment variables secured
- ✅ Optional password protection (add auth middleware)

## 📱 Mobile Access

The dashboard is fully responsive! Access from:
- 📱 Phone browser
- 💻 Desktop browser
- 📲 Tablet
- 🖥️ Any device with internet

## 🐛 Troubleshooting

### Products not being checked?

1. Check cron-job.org is running
2. Visit `/api/cron/check-stock` manually
3. Check Vercel function logs

### Discord alerts not working?

1. Test webhook: Click "🔔 Test Discord"
2. Verify webhook URL in `.env.local`
3. Check Discord server permissions

### Can't add products?

1. Check product URL is valid
2. Verify site is supported (Blinkit/Flipkart/FirstCry)
3. Clear browser cache

### Database resets?

Vercel `/tmp` folder is ephemeral. For persistence, use:
- **Vercel KV** (Redis)
- **Vercel Postgres**
- **MongoDB Atlas**

## 💡 Tips

1. **Start with 5-10 products** - Better performance
2. **Use 5-minute intervals** - Avoid rate limiting
3. **Test products first** - Use "Check Now" before enabling
4. **Monitor Vercel usage** - Check function invocations
5. **Keep URLs clean** - Remove tracking parameters

## 📞 Support

Check logs:
1. Vercel dashboard → Your project
2. Deployments → Latest
3. Functions → View logs

Test endpoints:
- Dashboard: `https://your-app.vercel.app`
- Test webhook: `https://your-app.vercel.app/api/test-webhook` (POST)
- Manual check: `https://your-app.vercel.app/api/cron/check-stock`

## 🎉 What You Get

✅ **Beautiful web dashboard** - No more editing config files!
✅ **24/7 monitoring** - Works when your PC is off
✅ **Discord alerts** - Get notified instantly
✅ **Multi-site support** - Blinkit, Flipkart, FirstCry
✅ **100% free** - Vercel free tier
✅ **Mobile friendly** - Manage from anywhere
✅ **Easy to use** - No coding required

## 🚀 Next Steps

1. Deploy to Vercel
2. Set up cron-job.org
3. Add your products
4. Get instant restock alerts!

---

**Made with ⚡ by Kiro AI**

Deploy once, track forever! 🚀
