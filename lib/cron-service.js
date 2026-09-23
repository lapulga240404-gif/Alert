const cron = require('node-cron');
const { getProducts, shouldAlert, setProductState, getProductState } = require('./db-supabase');
const { checkProduct } = require('./checkers');
const { sendDiscordAlert } = require('./discord');

let isRunning = false;
let cronTask = null;

// Stock check function (same logic as cron API)
async function runStockCheck() {
  if (isRunning) {
    console.log('⏩ Previous check still running, skipping...');
    return;
  }

  isRunning = true;
  console.log('🔍 [CRON] Starting stock check...', new Date().toLocaleString());
  
  try {
    const products = await getProducts();
    const enabledProducts = products.filter(p => p.enabled);
    
    if (enabledProducts.length === 0) {
      console.log('⚠️ No enabled products');
      return;
    }

    console.log(`📦 Checking ${enabledProducts.length} products...`);

    for (const product of enabledProducts) {
      try {
        console.log(`Checking: ${product.name}...`);
        
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
            console.log(`❌ ${product.name}: Check failed`);
            continue;
          }

          const isInStock = result.inStock === true;
          console.log(`${isInStock ? '✅' : '❌'} ${product.name}: ${result.stockLabel} | ₹${result.price || 'N/A'} | inStock=${result.inStock}`);

          // ONLY send alert if explicitly in stock
          if (isInStock === true && result.inStock === true) {
            console.log(`🚨 IN STOCK CONFIRMED: ${product.name}`);
            await sendDiscordAlert(product, result);
          } else if (result.inStock === false || result.inStock === null) {
            console.log(`⏭️  SKIPPED ALERT (OOS): ${product.name}`);
          }

          setProductState(product.id, isInStock);
          continue;
        }

        // Check each configured location
        let anyInStock = false;

        for (const location of locations) {
          const result = await checkProduct(product, location.index);
          
          if (result) {
            const isInStock = result.inStock === true;
            console.log(`${isInStock ? '✅' : '❌'} ${product.name} [${location.name}]: ${result.stockLabel} | ₹${result.price || 'N/A'} | inStock=${result.inStock}`);
            
            // ONLY send alert if explicitly in stock
            if (isInStock === true && result.inStock === true) {
              anyInStock = true;
              console.log(`🚨 IN STOCK CONFIRMED: ${product.name} at ${location.name}`);
              await sendDiscordAlert(product, result);
            } else if (result.inStock === false || result.inStock === null) {
              console.log(`⏭️  SKIPPED ALERT (OOS): ${product.name} at ${location.name}`);
            }
          } else {
            console.log(`❌ ${product.name} [${location.name}]: Check failed`);
          }
        }

        // Update product state based on any location being in stock
        setProductState(product.id, anyInStock);

      } catch (err) {
        console.error(`❌ Error checking ${product.name}:`, err.message);
      }
    }

    console.log('✅ Stock check complete');

  } catch (err) {
    console.error('❌ Cron error:', err);
  } finally {
    isRunning = false;
  }
}

// Start cron service
function startCronService() {
  if (cronTask) {
    console.log('⚠️ Cron service already running');
    return;
  }

  // Run every 1 minute: '*/1 * * * *'
  // Cron syntax: second minute hour day month weekday
  cronTask = cron.schedule('*/1 * * * *', runStockCheck);
  
  console.log('🚀 Cron service started - Running every 1 minute');
  console.log('⏰ Next check will run at:', new Date(Date.now() + 60000).toLocaleString());
  
  // Run immediately on start
  runStockCheck();
}

// Stop cron service
function stopCronService() {
  if (cronTask) {
    cronTask.stop();
    cronTask.destroy();
    cronTask = null;
    console.log('🛑 Cron service stopped');
  } else {
    console.log('⚠️ Cron service not running');
  }
}

// Get status
function getCronStatus() {
  return {
    isActive: cronTask !== null,
    isRunning: isRunning,
    schedule: '*/1 * * * *',
    description: 'Every 1 minute'
  };
}

module.exports = {
  startCronService,
  stopCronService,
  getCronStatus,
  runStockCheck
};
