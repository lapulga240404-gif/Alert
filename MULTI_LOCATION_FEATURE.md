# 📍 Multi-Location Feature

## Overview
The stock tracker now supports **3 locations per product** for Blinkit tracking. This allows you to check stock availability across multiple delivery addresses.

## Features

### ✅ What's Included
- **3 Locations Per Product**: Each product can have up to 3 configured locations
- **Location Manager Page**: Dedicated UI to manage locations at `/locations`
- **Preset Locations**: 2 hardcoded Bangalore locations pre-filled
- **Custom Location**: 3rd location slot for your own coordinates
- **Enable/Disable**: Checkbox control for each location
- **Multi-Location Checking**: Cron job checks all enabled locations
- **Discord Alerts**: Separate alerts for each location when stock is found

### 🗺️ Pre-Configured Locations

#### Location 1: Thirumenahalli, Bangalore
- **Coordinates**: 13.090095338307554, 77.63371485346111
- **Status**: Enabled by default

#### Location 2: Office
- **Coordinates**: 13.085314094403884, 77.6416601822967
- **Status**: Enabled by default

#### Location 3: Custom Location
- **Coordinates**: Empty (you can add your own)
- **Status**: Disabled by default

## How to Use

### 1. Access Location Manager
- Go to your dashboard at `http://localhost:3001`
- Click **"📍 Manage Locations"** button at the top
- You'll be redirected to `/locations`

### 2. Select a Product
- On the left side, you'll see a list of all your products
- Click on any product to edit its locations

### 3. Configure Locations
For each location, you can:
- ☑️ **Enable/Disable** using the checkbox
- ✏️ **Edit Name** (e.g., "Home", "Office", "Friend's Place")
- 🗺️ **Edit Coordinates** (latitude and longitude)

**Location 1 & 2** are preset with Bangalore coordinates but can be edited.
**Location 3** is empty for you to add your own custom location.

### 4. Get Coordinates from Google Maps
1. Open Google Maps
2. Right-click on your desired location
3. Click the coordinates to copy them
4. Paste latitude and longitude in the location fields

### 5. Save Changes
- Click **"💾 Save All Locations"** button
- Locations will be saved to the database
- Next stock check will use these new locations

## How Stock Checking Works

### Automatic Cron Checks
The cron job (`/api/cron/check-stock`) will:
1. ✅ Check **all enabled locations** for each product
2. 📊 Report stock status separately for each location
3. 🚨 Send Discord alerts if **any location** has stock
4. 💾 Save the combined stock state (in stock if ANY location has it)

### Manual "Check Now"
When you click "Check Now" on a product:
1. Checks all configured locations
2. Shows stock status for each location in an alert
3. Sends Discord alert if stock is found in any location

## Example Alert Format

### Multi-Location Alert
```
✅ Thirumenahalli, Bangalore: In Stock | ₹299
❌ Office: Out of Stock | ₹N/A
✅ Custom Location: In Stock | ₹299

🔔 Discord alert sent!
```

### Single Location Alert (Legacy)
```
✅ In Stock | ₹299

🔔 Discord alert sent!
```

## Database Schema

### Products Table - Location Columns
```sql
-- Location 1
location_1_lat TEXT
location_1_lon TEXT
location_1_name TEXT

-- Location 2
location_2_lat TEXT
location_2_lon TEXT
location_2_name TEXT

-- Location 3
location_3_lat TEXT
location_3_lon TEXT
location_3_name TEXT
```

## API Endpoints

### PUT `/api/products/{id}/locations`
Updates all 3 locations for a product.

**Request Body:**
```json
{
  "locations": [
    {
      "lat": "13.090095338307554",
      "lon": "77.63371485346111",
      "name": "Thirumenahalli, Bangalore"
    },
    {
      "lat": "13.085314094403884",
      "lon": "77.6416601822967",
      "name": "Office"
    },
    {
      "lat": null,
      "lon": null,
      "name": null
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

## Technical Implementation

### Checker Function
```javascript
// checkers.js
checkProduct(product, locationIndex = 1)
```

The `locationIndex` parameter (1, 2, or 3) determines which location coordinates to use:
- Pulls `location_1_lat/lon` for index 1
- Pulls `location_2_lat/lon` for index 2
- Pulls `location_3_lat/lon` for index 3
- Falls back to env defaults if location not configured

### Stock State Management
- Product is considered "in stock" if **ANY** location has stock
- Each location check is independent
- Discord alerts include location name in the message

## Benefits

1. **Coverage**: Check multiple areas simultaneously
2. **Flexibility**: Enable/disable locations per product
3. **Efficiency**: Single cron job checks all locations
4. **Transparency**: See stock status for each location separately
5. **Reliability**: If one location fails, others still work

## Limitations

- Currently only supports **Blinkit** multi-location tracking
- Flipkart and FirstCry use single location (no lat/lon needed)
- Maximum 3 locations per product
- Puppeteer browser checks may be slower for multiple locations

## Future Enhancements

- [ ] Add more location slots (4, 5, 6...)
- [ ] Bulk location management (copy locations to all products)
- [ ] Location groups/presets
- [ ] Map view to visualize locations
- [ ] Location-specific alert preferences
- [ ] Per-location enable/disable from dashboard

---

**Happy Tracking! 🚀**
