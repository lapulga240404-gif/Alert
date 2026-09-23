# 🔄 Self-Hosted Cron with node-cron

## Overview

This app now uses **node-cron** - a free, self-hosted scheduler that runs directly in your Next.js app. No external services needed!

## ✅ Benefits

- **100% Free** - No paid services required
- **Self-Hosted** - Runs in your Node.js process
- **No External Dependencies** - No Vercel Cron, no cron-job.org
- **Real-Time** - Checks every 1 minute
- **Automatic Start** - Starts when your app starts
- **Live Status** - Dashboard shows if cron is active/running

## 🚀 How It Works

### 1. **Auto-Start on App Launch**
When you run `npm run dev` or deploy your app, the cron service automatically starts:
- File: `pages/api/cron/start.js`
- Schedule: Every 1 minute (`*/1 * * * *`)
- Logs: Console shows when checks run

### 2. **Background Checks**
Every minute, the cron service:
- ✅ Fetches all enabled products from database
- ✅ Checks all configured locations for each product
- ✅ Sends Discord alerts for new restocks
- ✅ Updates product states
- ✅ Logs results to console

### 3. **Dashboard Status**
Your dashboard shows live cron status:
- 🟢 **Active** - Cron is running, next check scheduled
- 🔴 **Stopped** - Cron is not running
- ⏳ **Checking now...** - Currently checking products

## 📁 Files Overview

### Core Cron Service
```
lib/cron-service.js
├── startCronService()   - Start the scheduler
├── stopCronService()    - Stop the scheduler
├── getCronStatus()      - Get current status
└── runStockCheck()      - Run stock check manually
```

### API Endpoints
```
pages/api/cron/
├── start.js        - Auto-starts cron on first request
├── status.js       - Get cron status (used by dashboard)
└── check-stock.js  - Manual trigger endpoint (legacy)
```

## 🎯 Usage

### Starting the App

```bash
cd "c:\Users\karan\Downloads\bot windows\nextjs-version"
npm run dev
```

The cron service starts automatically when the app starts!

### Console Output

You'll see logs like this:

```
🚀 Cron service started - Running every 1 minute
⏰ Next check will run at: 1/24/2025, 10:15:00 AM
🔍 [CRON] Starting stock check... 1/24/2025, 10:14:00 AM
📦 Checking 3 products...
Checking: iPhone 15 Pro...
✅ iPhone 15 Pro [Thirumenahalli, Bangalore]: In Stock | ₹79999
✅ iPhone 15 Pro [Office]: In Stock | ₹79999
✅ Stock check complete
```

### Dashboard Indicator

At the top of your dashboard, you'll see:
```
🟢 Auto-Check: Every 1 minute
```

If a check is running:
```
🟢 Auto-Check: Every 1 minute ⏳ Checking now...
```

## ⚙️ Configuration

### Change Check Frequency

Edit `lib/cron-service.js`:

```javascript
// Change this line:
cronTask = cron.schedule('*/1 * * * *', runStockCheck);

// Options:
'*/1 * * * *'  - Every 1 minute (current)
'*/5 * * * *'  - Every 5 minutes
'*/10 * * * *' - Every 10 minutes
'*/30 * * * *' - Every 30 minutes
'0 * * * *'    - Every hour
'0 0 * * *'    - Every day at midnight
```

### Cron Syntax Reference
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of Week (0-7, 0=Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of Month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `*/1 * * * *` - Every minute
- `*/15 * * * *` - Every 15 minutes
- `0 */2 * * *` - Every 2 hours
- `30 9 * * *` - Every day at 9:30 AM
- `0 0 * * 0` - Every Sunday at midnight

## 🛠️ Troubleshooting

### Cron Not Starting?

1. **Check Console Logs**: Look for "Cron service started" message
2. **Visit Start Endpoint**: Navigate to `http://localhost:3001/api/cron/start`
3. **Restart App**: Stop and restart `npm run dev`

### No Stock Checks Running?

1. **Check Products**: Make sure you have products added
2. **Enable Products**: Toggle products to "Active" (🟢)
3. **Check Console**: Look for error messages
4. **Manual Trigger**: Visit `http://localhost:3001/api/cron/check-stock`

### Dashboard Shows "Stopped"?

1. **Refresh Page**: The status updates every 30 seconds
2. **Check Server**: Make sure your dev server is running
3. **Visit Status API**: `http://localhost:3001/api/cron/status`

## 🚀 Deployment

### Local Development
```bash
npm run dev
```
Cron starts automatically, checks run every 1 minute.

### Production (Vercel/Railway/etc.)
The cron service will start automatically when deployed:
- **Vercel**: Deploy normally, cron runs in serverless functions
- **Railway**: Deploy as Node.js app, cron runs continuously
- **Docker**: Build and run, cron runs in container
- **VPS**: Run with PM2 or systemd, cron runs as background service

### Important for Serverless (Vercel)
⚠️ Serverless functions sleep when idle. For Vercel:
- Use Vercel Cron (paid) for guaranteed execution
- OR use external ping service to keep functions warm
- OR deploy to a traditional server (Railway, Heroku, VPS)

### Recommended: Deploy to Railway (Free)

Railway offers free tier with persistent processes:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Stock tracker with self-hosted cron"
git push
```

2. **Deploy to Railway**
- Go to [railway.app](https://railway.app)
- Click "Deploy from GitHub"
- Select your repo
- Add environment variables from `.env.local`
- Deploy!

3. **Railway Benefits**
- ✅ Free tier available
- ✅ Persistent processes (cron keeps running)
- ✅ Auto-restart on crash
- ✅ Simple deployments

## 📊 Monitoring

### Check Status
Visit: `http://localhost:3001/api/cron/status`

Response:
```json
{
  "success": true,
  "status": {
    "isActive": true,
    "isRunning": false,
    "schedule": "*/1 * * * *",
    "description": "Every 1 minute"
  },
  "timestamp": "2025-01-24T10:14:30.000Z"
}
```

### Manual Trigger
Visit: `http://localhost:3001/api/cron/check-stock`

This runs a stock check immediately without waiting for the scheduled time.

## 🎉 Advantages Over External Services

| Feature | node-cron | Vercel Cron | cron-job.org |
|---------|-----------|-------------|--------------|
| **Cost** | Free | $20/month | Free (limited) |
| **Setup** | Automatic | Manual config | External account |
| **Frequency** | Any interval | Min 1 minute | Min 1 minute |
| **Reliability** | ✅ (if server up) | ✅ Very reliable | ✅ Reliable |
| **Control** | Full control | Limited | Limited |
| **Logs** | Console access | Vercel logs | Web dashboard |
| **Deployment** | Any platform | Vercel only | Any platform |

## 💡 Tips

1. **Keep Server Running**: For 24/7 monitoring, deploy to Railway or VPS
2. **Monitor Logs**: Check console regularly for errors
3. **Test First**: Use "Check Now" button before enabling cron
4. **Adjust Frequency**: Don't check too often to avoid rate limits
5. **Use PM2**: For production servers, use PM2 to keep app alive

## 🆘 Support

If you face issues:
1. Check console logs for errors
2. Verify products are enabled
3. Test with manual "Check Now" button
4. Visit `/api/cron/status` to check service status
5. Restart your dev server

---

**You now have a fully self-hosted, free cron scheduler! 🎉**

No external services needed - everything runs in your app!
