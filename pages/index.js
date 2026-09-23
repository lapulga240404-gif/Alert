import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', url: '', enabled: true });
  const [checkingId, setCheckingId] = useState(null);
  const [cronStatus, setCronStatus] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCronStatus();
    // Refresh cron status every 30 seconds
    const interval = setInterval(fetchCronStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCronStatus() {
    try {
      const res = await fetch('/api/cron/status');
      const data = await res.json();
      if (data.success) {
        setCronStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch cron status:', err);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addProduct() {
    if (!newProduct.name || !newProduct.url) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      const data = await res.json();
      if (data.success) {
        setProducts([...products, data.product]);
        setNewProduct({ name: '', url: '', enabled: true });
        setShowAddForm(false);
      }
    } catch (err) {
      alert('Failed to add product');
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  }

  async function toggleEnabled(product) {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !product.enabled })
      });
      
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? data.product : p));
      }
    } catch (err) {
      alert('Failed to update product');
    }
  }

  async function checkNow(productId) {
    setCheckingId(productId);
    try {
      const res = await fetch('/api/check-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sendAlert: true }) // Always send alert
      });
      
      const data = await res.json();
      if (data.success) {
        // Handle multi-location response
        if (data.locations) {
          const locationMessages = data.locations.map(loc => {
            const stockEmoji = loc.inStock ? '✅' : '❌';
            return `${stockEmoji} ${loc.location}: ${loc.stockLabel} | ₹${loc.price || 'N/A'}`;
          }).join('\n');
          
          const alertSent = data.anyInStock ? '\n\n🔔 Discord alert sent!' : '';
          alert(`${locationMessages}${alertSent}`);
        } else {
          // Handle single location response (fallback)
          const stockEmoji = data.result.inStock ? '✅' : '❌';
          const message = `${stockEmoji} ${data.result.stockLabel} | ₹${data.result.price || 'N/A'}`;
          
          if (data.result.inStock) {
            alert(`${message}\n\n🔔 Discord alert sent!`);
          } else {
            alert(message);
          }
        }
      } else {
        alert('Check failed');
      }
    } catch (err) {
      alert('Check failed');
    } finally {
      setCheckingId(null);
    }
  }

  async function testWebhook() {
    try {
      const res = await fetch('/api/test-webhook', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('✅ Test alert sent to Discord!');
      } else {
        alert('❌ Failed to send test alert');
      }
    } catch (err) {
      alert('❌ Failed to send test alert');
    }
  }

  async function toggleCron() {
    if (!cronStatus) return;
    
    try {
      const endpoint = cronStatus.isActive ? '/api/cron/stop' : '/api/cron/start';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setCronStatus(data.status);
        alert(cronStatus.isActive ? '⏸️ Cron stopped' : '▶️ Cron started');
      } else {
        alert('❌ Failed to toggle cron');
      }
    } catch (err) {
      alert('❌ Failed to toggle cron');
    }
  }

  return (
    <>
      <Head>
        <title>Stock Tracker Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>⚡ Sentinel Stock Tracker</h1>
          <p style={styles.subtitle}>24/7 Monitoring Dashboard</p>
          {cronStatus && (
            <div style={styles.cronStatus}>
              <span style={{...styles.cronIndicator, background: cronStatus.isActive ? '#57F287' : '#ef4444'}}></span>
              <span style={styles.cronText}>
                {cronStatus.isActive ? `🟢 Auto-Check: ${cronStatus.description}` : '🔴 Auto-Check: Stopped'}
              </span>
              {cronStatus.isRunning && <span style={styles.cronRunning}>⏳ Checking now...</span>}
              <button 
                style={{...styles.cronToggle, background: cronStatus.isActive ? '#ef4444' : '#57F287'}}
                onClick={toggleCron}
              >
                {cronStatus.isActive ? '⏸️ Stop' : '▶️ Start'}
              </button>
            </div>
          )}
        </header>

        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => setShowAddForm(!showAddForm)}>
            ➕ Add Product
          </button>
          <Link href="/locations">
            <button style={styles.btnSecondary}>
              📍 Manage Locations
            </button>
          </Link>
          <button style={styles.btnSecondary} onClick={testWebhook}>
            🔔 Test Discord
          </button>
          <button style={styles.btnSecondary} onClick={fetchProducts}>
            🔄 Refresh
          </button>
        </div>

        {showAddForm && (
          <div style={styles.addForm}>
            <h3 style={styles.formTitle}>Add New Product</h3>
            <input
              style={styles.input}
              placeholder="Product Name (e.g., iPhone 15 Pro)"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input
              style={styles.input}
              placeholder="Product URL (Blinkit, Flipkart, or FirstCry)"
              value={newProduct.url}
              onChange={(e) => setNewProduct({...newProduct, url: e.target.value})}
            />
            <div style={styles.formActions}>
              <button style={styles.btnPrimary} onClick={addProduct}>
                ✅ Add
              </button>
              <button style={styles.btnCancel} onClick={() => setShowAddForm(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{products.length}</div>
            <div style={styles.statLabel}>Total Products</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{products.filter(p => p.enabled).length}</div>
            <div style={styles.statLabel}>Active Tracking</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>1 min</div>
            <div style={styles.statLabel}>Check Interval</div>
          </div>
        </div>

        <div style={styles.productsList}>
          {loading ? (
            <div style={styles.loading}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📦</div>
              <p>No products yet. Add your first product to start tracking!</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.productHeader}>
                  <div>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" style={styles.productUrl}>
                      🔗 Open Product
                    </a>
                  </div>
                  <div style={styles.productActions}>
                    <label style={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={product.enabled}
                        onChange={() => toggleEnabled(product)}
                      />
                      <span style={styles.toggleLabel}>
                        {product.enabled ? '🟢 Active' : '🔴 Paused'}
                      </span>
                    </label>
                  </div>
                </div>
                <div style={styles.productFooter}>
                  <button 
                    style={styles.btnCheck}
                    onClick={() => checkNow(product.id)}
                    disabled={checkingId === product.id}
                  >
                    {checkingId === product.id ? '⏳ Checking...' : '🔍 Check Now'}
                  </button>
                  <button 
                    style={styles.btnDelete}
                    onClick={() => deleteProduct(product.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer style={styles.footer}>
          <p>Powered by Next.js • Deployed on Vercel • Discord Alerts Enabled</p>
        </footer>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '42px',
    margin: '0 0 10px 0',
    background: 'linear-gradient(135deg, #57F287 0%, #39FF14 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '16px',
    color: '#a1a1aa',
    margin: 0,
  },
  cronStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '8px 16px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    fontSize: '13px',
    maxWidth: 'fit-content',
    margin: '12px auto 0',
  },
  cronIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  cronText: {
    color: '#e4e4e7',
    fontWeight: '600',
  },
  cronRunning: {
    color: '#fbbf24',
    fontSize: '12px',
    marginLeft: '4px',
  },
  cronToggle: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#000',
    marginLeft: '12px',
    transition: 'all 0.2s',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '12px 24px',
    background: '#57F287',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  btnSecondary: {
    padding: '12px 24px',
    background: '#27272a',
    color: '#fff',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  btnCancel: {
    padding: '12px 24px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  addForm: {
    maxWidth: '600px',
    margin: '0 auto 30px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
  },
  formTitle: {
    marginTop: 0,
    marginBottom: '16px',
    color: '#57F287',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto 30px',
  },
  statCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#57F287',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#a1a1aa',
  },
  productsList: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#a1a1aa',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#a1a1aa',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  productCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'border-color 0.3s',
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  productName: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    color: '#fff',
  },
  productUrl: {
    color: '#57F287',
    textDecoration: 'none',
    fontSize: '14px',
  },
  productActions: {
    display: 'flex',
    gap: '12px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  toggleLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  productFooter: {
    display: 'flex',
    gap: '12px',
  },
  btnCheck: {
    flex: 1,
    padding: '10px',
    background: '#27272a',
    color: '#fff',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDelete: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    marginTop: '60px',
    padding: '20px',
    color: '#71717a',
    fontSize: '12px',
  },
};
