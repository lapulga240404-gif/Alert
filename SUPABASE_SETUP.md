# 🗄️ Supabase Database Setup

Follow these steps to set up your Supabase database for permanent product storage.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (free forever)

## Step 2: Create New Project

1. Click **"New Project"**
2. Choose organization (or create new one)
3. Project settings:
   - **Name**: `stock-tracker` (or any name)
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to you
   - **Pricing Plan**: **Free** (500MB database, 50MB file storage)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Create products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_states table (tracks stock status)
CREATE TABLE product_states (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  in_stock BOOLEAN,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create index for faster queries
CREATE INDEX idx_products_enabled ON products(enabled);
CREATE INDEX idx_product_states_product_id ON product_states(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_states ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for this use case)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_states" ON product_states FOR ALL USING (true);
```

4. Click **"Run"** or press `Ctrl+Enter`
5. Should see: **"Success. No rows returned"**

## Step 4: Get API Credentials

1. Go to **"Settings"** (left sidebar)
2. Click **"API"**
3. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## Step 5: Update Environment Variables

1. Open `.env.local` in your project
2. Replace these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 6: Update Code to Use Supabase

Replace the import in these files:

### File: `pages/api/products/index.js`
```javascript
// OLD:
const { getProducts, addProduct } = require('../../../lib/db');

// NEW:
const { getProducts, addProduct } = require('../../../lib/db-supabase');
```

### File: `pages/api/products/[id].js`
```javascript
// OLD:
const { updateProduct, deleteProduct } = require('../../../lib/db');

// NEW:
const { updateProduct, deleteProduct } = require('../../../lib/db-supabase');
```

### File: `pages/api/check-now.js`
```javascript
// OLD:
const { getProducts } = require('../../lib/db');

// NEW:
const { getProducts } = require('../../lib/db-supabase');
```

### File: `pages/api/cron/check-stock.js`
```javascript
// OLD:
const { getProducts, shouldAlert, setProductState } = require('../../../lib/db');

// NEW:
const { getProducts, shouldAlert, setProductState } = require('../../../lib/db-supabase');
```

## Step 7: Test It!

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`
3. Add a product
4. Check Supabase dashboard → **"Table Editor"** → **"products"**
5. Your product should be there! 🎉

## Step 8: Deploy to Vercel

When deploying to Vercel, add environment variables:

1. Vercel Dashboard → Your Project → **"Settings"** → **"Environment Variables"**
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy

## ✅ Benefits of Supabase

- ✅ **Permanent storage** - Products never disappear
- ✅ **Real database** - PostgreSQL with full SQL support
- ✅ **Free tier** - 500MB database, 2GB bandwidth/month
- ✅ **Fast queries** - Indexed and optimized
- ✅ **Automatic backups** - Daily backups included
- ✅ **Dashboard** - View/edit data directly
- ✅ **API** - Built-in REST and GraphQL APIs
- ✅ **Realtime** - Optional realtime subscriptions

## 🔐 Security Notes

**Current setup uses public access policies** - Fine for this use case, but if you want to restrict access:

1. Remove public policies
2. Add API key authentication
3. Use service role key on backend
4. Use RLS policies for fine-grained access

## 📊 Monitor Usage

Check your usage at:
- Supabase Dashboard → **"Settings"** → **"Usage"**

Free tier limits:
- 500MB database
- 2GB bandwidth/month
- 50,000 monthly active users

## 🆘 Troubleshooting

**Error: "Supabase not configured"**
- Check `.env.local` has correct values
- Restart dev server

**Error: "relation does not exist"**
- Run the SQL queries again in SQL Editor
- Check table names are lowercase

**Products not showing?**
- Check Table Editor in Supabase dashboard
- Verify RLS policies are enabled

---

**Done!** Your products are now stored permanently! 🚀
