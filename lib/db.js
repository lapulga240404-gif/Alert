// Simple JSON file-based database for Vercel
// Uses Vercel KV would be better for production, but this works for now
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use OS temp directory (works on Windows, Linux, Mac)
const DB_FILE = path.join(os.tmpdir(), 'products.json');

// Initialize DB
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: [],
      states: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read DB
function readDB() {
  try {
    initDB();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { products: [], states: {} };
  }
}

// Write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('DB write error:', err);
    return false;
  }
}

// Get all products
function getProducts() {
  const db = readDB();
  return db.products || [];
}

// Add product
function addProduct(product) {
  const db = readDB();
  const newProduct = {
    id: Date.now().toString(),
    ...product,
    createdAt: new Date().toISOString()
  };
  db.products.push(newProduct);
  writeDB(db);
  return newProduct;
}

// Update product
function updateProduct(id, updates) {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updates };
    writeDB(db);
    return db.products[index];
  }
  return null;
}

// Delete product
function deleteProduct(id) {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    db.products.splice(index, 1);
    writeDB(db);
    return true;
  }
  return false;
}

// Get product state
function getProductState(id) {
  const db = readDB();
  return db.states[id] || null;
}

// Set product state
function setProductState(id, inStock) {
  const db = readDB();
  db.states[id] = inStock;
  writeDB(db);
}

// Check if should alert
function shouldAlert(id, currentlyInStock) {
  const previousState = getProductState(id);
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
