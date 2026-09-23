const { updateProduct, deleteProduct } = require('../../../lib/db-supabase');

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      const product = await updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      
      return res.status(200).json({ success: true, product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const success = await deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
