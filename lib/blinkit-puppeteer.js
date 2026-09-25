// Blinkit Puppeteer checker
async function checkBlinkitWithBrowser(productUrl) {
  let browser = null;
  try {
    const puppeteer = await import('puppeteer-core');
    
    // Try to find chromium executable
    let executablePath;
    
    // Railway/production environment
    if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
      executablePath = '/nix/store/*/bin/chromium' || '/usr/bin/chromium-browser' || '/usr/bin/chromium';
    } else {
      // Local development with chromium package
      try {
        const chromium = await import('chromium');
        executablePath = chromium.default.path || chromium.default;
      } catch (err) {
        console.log('[Puppeteer] Chromium package not found, trying system chromium');
        executablePath = '/usr/bin/chromium-browser';
      }
    }
    
    console.log(`[Puppeteer] Using executablePath: ${executablePath}`);
    
    // Launch browser with Railway-compatible settings
    browser = await puppeteer.default.launch({
      executablePath: executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`[Puppeteer] Loading: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait 2 seconds for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await page.evaluate(() => {
      // Look for Add button
      const addBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => {
        const text = (el.innerText || el.textContent || '').toLowerCase().trim();
        return text === 'add' || 
               text === 'add to cart' || 
               text === 'add to basket';
      });

      // Check for out of stock signals
      const mainContent = document.querySelector('main') || document.body;
      const pageText = mainContent.innerText.toLowerCase();
      
      const outOfStockPhrases = [
        'out of stock',
        'currently unavailable',
        'temporarily out of stock',
        'notify me when available',
        'coming soon'
      ];
      
      const outOfStock = outOfStockPhrases.some(phrase => pageText.includes(phrase));

      // Get price
      let price = null;
      const priceMatch = document.body.innerText.match(/₹\s?([\d,]+(?:\.\d+)?)/);
      if (priceMatch) price = priceMatch[1].replace(/,/g, '');

      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText?.trim(),
        className: b.className
      })).filter(b => b.text);
      
      const notifyMeBtn = buttons.some(b => b.text.toLowerCase().includes('notify'));
      
      return { 
        inStock: !!addBtn && !outOfStock && !notifyMeBtn, 
        price,
        hasAddButton: !!addBtn,
        hasOutOfStockSignal: outOfStock,
        hasNotifyButton: notifyMeBtn,
        allButtons: buttons.slice(0, 10).map(b => b.text)
      };
    });

    console.log(`[Puppeteer] Result:`, result);
    await browser.close();

    return {
      inStock: result.inStock,
      price: result.price,
      stockLabel: result.inStock ? 'In Stock' : 'Out of Stock',
      siteLabel: 'Blinkit (Browser)'
    };

  } catch (err) {
    console.error('[Puppeteer] Error:', err.message);
    console.error('[Puppeteer] Stack:', err.stack);
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        // Ignore close errors
      }
    }
    return null;
  }
}

module.exports = {
  checkBlinkitWithBrowser
};
