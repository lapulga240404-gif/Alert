const { updateProduct } = require('../../../../lib/db-supabase');

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const { locations } = req.body;
      
      // locations should be an array of up to 3 location objects
      const updates = {};
      
      if (locations[0]) {
        updates.location_1_lat = locations[0].lat;
        updates.location_1_lon = locations[0].lon;
        updates.location_1_name = locations[0].name;
      }
      
      if (locations[1]) {
        updates.location_2_lat = locations[1].lat;
        updates.location_2_lon = locations[1].lon;
        updates.location_2_name = locations[1].name;
      }
      
      if (locations[2]) {
        updates.location_3_lat = locations[2].lat;
        updates.location_3_lon = locations[2].lon;
        updates.location_3_name = locations[2].name;
      }
      
      const product = await updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      
      return res.status(200).json({ success: true, product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
