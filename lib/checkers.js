const fetch = require('node-fetch');

// Detect which site a URL belongs to
function detectSite(url) {
  if (!url) return null;
  if (url.includes('blinkit.com')) return 'blinkit';
  if (url.includes('flipkart.com')) return 'flipkart';
  if (url.includes('firstcry.com')) return 'firstcry';
  return null;
}

// Puppeteer Blinkit checker (lazy loaded)
let checkBlinkitWithBrowser = null;
async function getBlinkitBrowserChecker() {
  if (!checkBlinkitWithBrowser) {
    try {
      const module = await import('./blinkit-puppeteer.js');
      checkBlinkitWithBrowser = module.checkBlinkitWithBrowser;
    } catch (err) {
      console.log('Puppeteer not available:', err.message);
    }
  }
  return checkBlinkitWithBrowser;
}

// Extract product ID from URL
function extractProductId(url) {
  if (!url) return null;
  const match = url.match(/(?:prid|pnd|prn)[\/=]([0-9]{4,})/i) || 
                url.match(/\/(\d{5,})/);
  return match ? match[1] : null;
}

// Deep scan JSON for stock info
function deepScan(obj, extracted) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) deepScan(item, extracted);
    return;
  }
  if (obj.state && typeof obj.state === 'string' && !extracted.state) 
    extracted.state = obj.state;
  if (obj.inventory !== undefined && obj.inventory !== null && extracted.inventory === null) 
    extracted.inventory = Number(obj.inventory);
  if ((obj.selling_price || obj.price) && extracted.price === null) 
    extracted.price = obj.selling_price || obj.price;
  if ((obj.facility_id || obj.store_id) && !extracted.storeId) 
    extracted.storeId = obj.facility_id || obj.store_id;
  for (const key in obj) {
    if (typeof obj[key] === 'object') deepScan(obj[key], extracted);
  }
}

// Scan HTML page for stock signals
function scanPageSignals(html, inStockMarkers, outOfStockMarkers) {
  const lower = html.toLowerCase();
  const hasIn = inStockMarkers.some(m => lower.includes(m.toLowerCase()));
  const hasOut = outOfStockMarkers.some(m => lower.includes(m.toLowerCase()));

  let inStock = null;
  if (hasIn && !hasOut) inStock = true;
  else if (hasOut && !hasIn) inStock = false;

  const priceMatch = html.match(/₹\s?([\d,]+(?:\.\d+)?)/);
  const price = priceMatch ? priceMatch[1].replace(/,/g, '') : null;

  return { inStock, price };
}

// Check Blinkit product - Enhanced with Puppeteer fallback
async function checkBlinkit(product, locationIndex = 1) {
  const prid = extractProductId(product.url);
  if (!prid) return null;

  // Get location based on index (1, 2, or 3)
  let lat, lon, locationName;
  if (locationIndex === 1 && product.location_1_lat) {
    lat = product.location_1_lat;
    lon = product.location_1_lon;
    locationName = product.location_1_name || 'Location 1';
  } else if (locationIndex === 2 && product.location_2_lat) {
    lat = product.location_2_lat;
    lon = product.location_2_lon;
    locationName = product.location_2_name || 'Location 2';
  } else if (locationIndex === 3 && product.location_3_lat) {
    lat = product.location_3_lat;
    lon = product.location_3_lon;
    locationName = product.location_3_name || 'Location 3';
  } else {
    // Fallback to env defaults
    lat = process.env.LATITUDE || '28.6517178';
    lon = process.env.LONGITUDE || '77.2219388';
    locationName = 'Default';
  }

  try {
    // Enhanced headers to mimic real browser
    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'app_client': 'consumer_web',
      'app_version': '52434897',
      'auth_key': process.env.BLINKIT_AUTH_KEY,
      'access_token': process.env.BLINKIT_TOKEN,
      'content-type': 'application/json',
      'device_id': Math.random().toString(36).substring(2, 15),
      'lat': String(lat),
      'lon': String(lon),
      'origin': 'https://blinkit.com',
      'referer': product.url,
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'session_uuid': Math.random().toString(36).substring(2, 15),
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'web_app_version': '1008004003',
      'rn_bundle_version': '1008004003',
      'platform': 'web'
    };

    // Try API first
    const response = await fetch(`https://blinkit.com/v1/layout/product/${prid}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({})
    });

    // If API works, use it
    if (response.ok) {
      const body = await response.json();
      const extracted = { state: null, inventory: null, price: null, storeId: null };
      deepScan(body, extracted);

      const inventory = Number(extracted.inventory || 0);
      const state = (extracted.state || '').toLowerCase();
      const isDead = state === 'out_of_stock' || state === 'coming_soon';
      const inStock = state === 'available' || inventory > 0 || (!isDead && state !== '');

      return {
        inStock,
        price: extracted.price,
        stockLabel: extracted.inventory != null ? String(extracted.inventory) : (inStock ? 'In Stock' : 'Out of Stock'),
        siteLabel: `Blinkit · ${locationName}`
      };
    }

    // If API blocked, try Puppeteer
    console.log(`Blinkit API blocked (${response.status}), trying browser...`);
    
    const browserChecker = await getBlinkitBrowserChecker();
    if (browserChecker) {
      console.log('Using Puppeteer to bypass Blinkit protection...');
      const result = await browserChecker(product.url);
      if (result) {
        result.siteLabel = `Blinkit · ${locationName}`;
      }
      return result;
    } else {
      console.log('Puppeteer not available');
      return null;
    }

  } catch (err) {
    console.error(`Blinkit check error:`, err.message);
    
    // Last resort: try browser if available
    const browserChecker = await getBlinkitBrowserChecker();
    if (browserChecker) {
      try {
        console.log('Fallback to Puppeteer due to error...');
        const result = await browserChecker(product.url);
        if (result) {
          result.siteLabel = `Blinkit · ${locationName}`;
        }
        return result;
      } catch (puppeteerErr) {
        console.error('Puppeteer also failed:', puppeteerErr.message);
      }
    }
    
    return null;
  }
}

// Check Flipkart product
async function checkFlipkart(product) {
  try {
    const response = await fetch(product.url, { method: 'GET' });
    if (!response.ok) {
      console.error(`Flipkart fetch failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const { inStock, price } = scanPageSignals(
      html,
      ['add to cart', 'buy now'],
      ['notify me', 'sold out', 'currently unavailable', 'coming soon']
    );
    
    return {
      inStock,
      price,
      stockLabel: inStock === null ? 'Unclear' : (inStock ? 'In Stock' : 'Out of Stock'),
      siteLabel: 'Flipkart'
    };
  } catch (err) {
    console.error(`Flipkart check error:`, err.message);
    return null;
  }
}

// Check FirstCry product
async function checkFirstcry(product) {
  try {
    const match = product.url.match(/\/(\d+)(?:\/product-detail|$)/i) ||
                  product.url.match(/[?&]productid=(\d+)/i) ||
                  product.url.match(/\/(\d{6,})/);
    const productId = match ? match[1] : null;

    if (!productId) {
      console.error(`Could not parse FirstCry product ID`);
      return { inStock: false, price: null, stockLabel: "Invalid URL", siteLabel: "FirstCry" };
    }

    const apiUrl = "https://www.firstcry.com/tatapi/oam/checkdeliveryinfo";
    const body = {
      ProductIDs: productId,
      Pincode: "110065",
      ComboId: 0,
      CheckTAT: true,
      CheckDropShipment: false,
      CheckCOD: true,
      subCatID: 94,
      MRP: 0,
      AddressType: "Home",
      Discount: 0,
      minQty: 1,
      CatID: 5
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    let finalStock = false;
    let price = null;

    if (data?.Result) {
      const r = data.Result;
      if (r.ActualPrice > 0) price = r.ActualPrice;
      
      if (typeof r.IsServicable !== "undefined") {
        finalStock = Number(r.IsServicable) > 0;
      } else if (r.groupserviceability && productId in r.groupserviceability) {
        finalStock = Number(r.groupserviceability[productId]) > 0;
      }
    }

    return {
      inStock: finalStock,
      price: price,
      stockLabel: finalStock ? "In Stock" : "Out of Stock",
      siteLabel: "FirstCry"
    };
  } catch (err) {
    console.error(`FirstCry check error:`, err.message);
    return { inStock: false, price: null, stockLabel: "Check failed", siteLabel: "FirstCry" };
  }
}

// Main check function
async function checkProduct(product, locationIndex = 1) {
  const site = detectSite(product.url);
  
  if (site === 'blinkit') return await checkBlinkit(product, locationIndex);
  if (site === 'flipkart') return await checkFlipkart(product);
  if (site === 'firstcry') return await checkFirstcry(product);
  
  return null;
}

module.exports = {
  checkProduct,
  detectSite
};
