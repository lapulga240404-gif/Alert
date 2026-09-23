const { getProducts } = require('../../lib/db-supabase');
const { checkProduct } = require('../../lib/checkers');
const { sendDiscordAlert } = require('../../lib/discord');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { productId, sendAlert } = req.body;
  
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Check which locations are configured
    const locations = [];
    if (product.location_1_lat && product.location_1_lon) {
      locations.push({ index: 1, name: product.location_1_name || 'Location 1' });
    }
    if (product.location_2_lat && product.location_2_lon) {
      locations.push({ index: 2, name: product.location_2_name || 'Location 2' });
    }
    if (product.location_3_lat && product.location_3_lon) {
      locations.push({ index: 3, name: product.location_3_name || 'Location 3' });
    }

    // If no locations configured, check with default
    if (locations.length === 0) {
      const result = await checkProduct(product);
      
      if (!result) {
        const site = product.url.includes('blinkit.com') ? 'Blinkit' : 'Unknown';
        if (site === 'Blinkit') {
          return res.status(200).json({ 
            success: true, 
            result: {
              inStock: null,
              price: null,
              stockLabel: '⚠️ Blinkit blocking requests. Try opening the URL manually.',
              siteLabel: 'Blinkit (Blocked)'
            }
          });
        }
        return res.status(500).json({ success: false, error: 'Check failed' });
      }

      // Send Discord alert if requested and item is in stock
      if (sendAlert && result.inStock) {
        await sendDiscordAlert(product, result);
      }
      
      return res.status(200).json({
        success: true,
        result: {
          inStock: result.inStock,
          price: result.price,
          stockLabel: result.stockLabel,
          siteLabel: result.siteLabel
        }
      });
    }

    // Check all configured locations
    const locationResults = [];
    let anyInStock = false;

    for (const location of locations) {
      const result = await checkProduct(product, location.index);
      
      if (result) {
        locationResults.push({
          location: location.name,
          inStock: result.inStock,
          price: result.price,
          stockLabel: result.stockLabel,
          siteLabel: result.siteLabel
        });

        if (result.inStock) {
          anyInStock = true;
          
          // Send alert for first in-stock location if requested
          if (sendAlert) {
            await sendDiscordAlert(product, result);
          }
        }
      } else {
        locationResults.push({
          location: location.name,
          inStock: null,
          stockLabel: 'Check failed',
          siteLabel: 'Error'
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      anyInStock: anyInStock,
      locations: locationResults
    });
  } catch (err) {
    console.error('Check error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
