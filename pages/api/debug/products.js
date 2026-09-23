const { getProducts } = require('../../../lib/db-supabase');

export default async function handler(req, res) {
  try {
    const products = await getProducts();
    return res.status(200).json({ 
      success: true, 
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        url: p.url,
        enabled: p.enabled,
        location_1: p.location_1_name ? `${p.location_1_name} (${p.location_1_lat}, ${p.location_1_lon})` : null,
        location_2: p.location_2_name ? `${p.location_2_name} (${p.location_2_lat}, ${p.location_2_lon})` : null,
        location_3: p.location_3_name ? `${p.location_3_name} (${p.location_3_lat}, ${p.location_3_lon})` : null,
        created_at: p.created_at
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
