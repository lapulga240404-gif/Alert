# 📍 Multi-Location Setup Guide

## ✅ Step 1: Update Supabase Database

Go to Supabase SQL Editor:
👉 https://app.supabase.com/project/ynxiutpskmxwrqvolnce/sql/new

Run this SQL:

```sql
-- Add location columns to products table
ALTER TABLE products 
ADD COLUMN location_1_lat DECIMAL(10, 7),
ADD COLUMN location_1_lon DECIMAL(10, 7),
ADD COLUMN location_1_name TEXT,
ADD COLUMN location_2_lat DECIMAL(10, 7),
ADD COLUMN location_2_lon DECIMAL(10, 7),
ADD COLUMN location_2_name TEXT,
ADD COLUMN location_3_lat DECIMAL(10, 7),
ADD COLUMN location_3_lon DECIMAL(10, 7),
ADD COLUMN location_3_name TEXT;
```

Click **"Run"** ✅

## 🎯 How It Works:

Each product can now have **3 separate locations**:

- **Location 1**: Home
- **Location 2**: Office  
- **Location 3**: Friend's place

System will check all 3 locations and alert if **ANY location** has stock!

## 📊 Example Use Case:

**Product:** iPhone 15 Pro

- **Location 1**: Connaught Place, Delhi (28.6517, 77.2219)
- **Location 2**: Noida Sector 18 (28.5706, 77.3272)
- **Location 3**: Gurgaon Cyber City (28.4950, 77.0826)

When stock alert triggers:
```
🚨 iPhone 15 Pro IS LIVE
Blinkit · Noida Sector 18
In Stock | ₹89,999
```

## 🔧 Adding Locations:

### Via API:
```javascript
PUT /api/products/{id}/locations

{
  "locations": [
    { "lat": 28.6517178, "lon": 77.2219388, "name": "Home (CP)" },
    { "lat": 28.5706, "lon": 77.3272, "name": "Office (Noida)" },
    { "lat": 28.4950, "lon": 77.0826, "name": "Friend (Gurgaon)" }
  ]
}
```

## 📍 Get Coordinates from Google Maps:

1. Open Google Maps
2. Drop a pin or search location
3. Right-click → Copy coordinates
4. Or use the share link I'll extract for you!

## 🚀 Current Locations:

**Default (Delhi CP):**
- Lat: 28.6517178
- Lon: 77.2219388

Want me to add a UI to manage locations? Or are you good with the API for now?
