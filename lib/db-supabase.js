const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Get all products
async function getProducts() {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Add product
async function addProduct(product) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const newProduct = {
    name: product.name,
    url: product.url,
    enabled: product.enabled !== false,
    // Set default hardcoded locations if not provided
    location_1_lat: product.location_1_lat || '13.090095338307554',
    location_1_lon: product.location_1_lon || '77.63371485346111',
    location_1_name: product.location_1_name || 'Thirumenahalli, Bangalore',
    location_2_lat: product.location_2_lat || '13.085314094403884',
    location_2_lon: product.location_2_lon || '77.6416601822967',
    location_2_name: product.location_2_name || 'Office',
    location_3_lat: product.location_3_lat || null,
    location_3_lon: product.location_3_lon || null,
    location_3_name: product.location_3_name || null,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update product
async function updateProduct(id, updates) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Delete product
async function deleteProduct(id) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Get product state
async function getProductState(id) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('product_states')
    .select('in_stock')
    .eq('product_id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data ? data.in_stock : null;
}

// Set product state
async function setProductState(id, inStock) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('product_states')
    .upsert({
      product_id: id,
      in_stock: inStock,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'product_id'
    });
  
  if (error) throw error;
}

// Check if should alert
async function shouldAlert(id, currentlyInStock) {
  const previousState = await getProductState(id);
  return currentlyInStock && (previousState === null || previousState === false);
}

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductState,
  setProductState,
  shouldAlert
};
