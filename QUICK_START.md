# ⚡ Quick Start Guide

## 🎯 What You Need To Do:

### 1️⃣ Set Up Supabase Database (5 minutes)

**Why?** Without this, products won't be saved permanently!

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project
3. Go to SQL Editor → Run this SQL:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_states (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  in_stock BOOLEAN,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_enabled ON products(enabled);
CREATE INDEX idx_product_states_product_id ON product_states(product_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_states" ON product_states FOR ALL USING (true);
```

4. Go to Settings → API
5. Copy:
   - Project URL
   - anon/public key

6. Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2️⃣ Test Locally

```bash
npm run dev
```

Open `http://localhost:3000` → Add a product → Should save to Supabase!

### 3️⃣ Deploy to Vercel

```bash
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- All other vars from `.env.local`

### 4️⃣ Set Up Cron Job

Use [cron-job.org](https://cron-job.org) (free):
- URL: `https://your-app.vercel.app/api/cron/check-stock`
- Schedule: Every 5 minutes

## ✅ Done!

Your stock tracker is now:
- ✅ Running 24/7
- ✅ Saving products permanently
- ✅ Sending Discord alerts
- ✅ 100% free!

## 📚 Full Guides:

- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Full README**: See `README.md`
