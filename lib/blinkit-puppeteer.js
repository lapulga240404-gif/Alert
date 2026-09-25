// Blinkit Puppeteer checker
async function checkBlinkitWithBrowser(productUrl) {
  let browser = null;
  try {
    // Use full puppeteer package (includes chromium)
    const puppeteer = await import('puppeteer');
    
    console.log(`[Puppeteer] Launching browser...`);
    
    // Launch browser
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
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
