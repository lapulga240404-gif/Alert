const { getProducts, shouldAlert, setProductState, getProductState } = require('../../../lib/db-supabase');
const { checkProduct } = require('../../../lib/checkers');
const { sendDiscordAlert } = require('../../../lib/discord');

export default async function handler(req, res) {
  console.log('🔍 Cron: Starting stock check...');
  
  try {
    const products = await getProducts();
    const enabledProducts = products.filter(p => p.enabled);
    
    if (enabledProducts.length === 0) {
      console.log('⚠️ No enabled products');
      return res.status(200).json({ 
        success: true, 
        message: 'No products enabled',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📦 Checking ${enabledProducts.length} products...`);
    const results = [];

    for (const product of enabledProducts) {
      try {
        console.log(`Checking: ${product.name}...`);
        
        // Check all 3 locations
        const locationChecks = [];
        
        // Check which locations are configured for this product
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

        // If no locations configured, check with default location
        if (locations.length === 0) {
          const result = await checkProduct(product);
          
          if (!result) {
            console.log(`❌ ${product.name}: Check failed`);
            results.push({ 
              product: product.name, 
              status: 'error', 
              error: 'Check failed' 
            });
            continue;
          }

          const isInStock = result.inStock === true;
          console.log(`${isInStock ? '✅' : '❌'} ${product.name}: ${result.stockLabel} | ₹${result.price || 'N/A'}`);

          // Only alert if product is in stock AND was previously out of stock
          if (isInStock) {
            const previousState = await getProductState(product.id);
            const shouldSendAlert = previousState === null || previousState === false;
            
            if (shouldSendAlert) {
              console.log(`🚨 NEW RESTOCK: ${product.name}`);
              await sendDiscordAlert(product, result);
              results.push({ 
                product: product.name, 
                status: 'alerted', 
                inStock: true,
                price: result.price 
              });
            } else {
              results.push({ 
                product: product.name, 
                status: 'checked', 
                inStock: true,
                price: result.price 
              });
            }
          } else {
            results.push({ 
              product: product.name, 
              status: 'checked', 
              inStock: false,
              price: result.price 
            });
          }

          setProductState(product.id, isInStock);
          continue;
        }

        // Check each configured location
        let anyInStock = false;
        const locationResults = [];

        for (const location of locations) {
          const result = await checkProduct(product, location.index);
          
          if (result) {
            const isInStock = result.inStock === true;
            console.log(`${isInStock ? '✅' : '❌'} ${product.name} [${location.name}]: ${result.stockLabel} | ₹${result.price || 'N/A'}`);
            
            locationResults.push({
              location: location.name,
              inStock: isInStock,
              price: result.price,
              stockLabel: result.stockLabel
            });

            if (isInStock) {
              anyInStock = true;
              
              // Send alert for this specific location if needed
              // Only alert if product was previously out of stock or unknown
              const previousState = await getProductState(product.id);
              const shouldSendAlert = previousState === null || previousState === false;
              
              if (shouldSendAlert) {
                console.log(`🚨 NEW RESTOCK: ${product.name} at ${location.name}`);
                await sendDiscordAlert(product, result);
              }
            }
          } else {
            console.log(`❌ ${product.name} [${location.name}]: Check failed`);
            locationResults.push({
              location: location.name,
              status: 'error'
            });
          }
        }

        // Update product state based on any location being in stock
        setProductState(product.id, anyInStock);

        results.push({
          product: product.name,
          status: anyInStock ? 'in_stock' : 'out_of_stock',
          locations: locationResults
        });

      } catch (err) {
        console.error(`❌ Error checking ${product.name}:`, err.message);
        results.push({ 
          product: product.name, 
          status: 'error', 
          error: err.message 
        });
      }
    }

    console.log('✅ Stock check complete');

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (err) {
    console.error('❌ Cron error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
