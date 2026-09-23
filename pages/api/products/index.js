const { getProducts, addProduct } = require('../../../lib/db-supabase');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  if (req.method === 'GET') {
    try {
      const products = await getProducts();
      return res.status(200).json({ success: true, products });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, url, enabled } = req.body;
      
      if (!name || !url) {
        return res.status(400).json({ success: false, error: 'Name and URL are required' });
      }
      
      const product = await addProduct({
        name,
        url,
        enabled: enabled !== false
      });
      
      return res.status(201).json({ success: true, product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
