import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function LocationsManager() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [locations, setLocations] = useState([
    { lat: '13.090095338307554', lon: '77.63371485346111', name: 'Thirumenahalli, Bangalore', enabled: true },
    { lat: '13.085314094403884', lon: '77.6416601822967', name: 'Office', enabled: true },
    { lat: '', lon: '', name: 'Custom Location', enabled: false }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }

  function selectProduct(product) {
    setSelectedProduct(product);
    setLocations([
      {
        lat: product.location_1_lat || '13.090095338307554',
        lon: product.location_1_lon || '77.63371485346111',
        name: product.location_1_name || 'Thirumenahalli, Bangalore',
        enabled: !!(product.location_1_lat && product.location_1_lon)
      },
      {
        lat: product.location_2_lat || '13.085314094403884',
        lon: product.location_2_lon || '77.6416601822967',
        name: product.location_2_name || 'Office',
        enabled: !!(product.location_2_lat && product.location_2_lon)
      },
      {
        lat: product.location_3_lat || '',
        lon: product.location_3_lon || '',
        name: product.location_3_name || 'Custom Location',
        enabled: !!(product.location_3_lat && product.location_3_lon)
      }
    ]);
  }

  async function updateFromDB() {
    if (!selectedProduct) return;
    
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        const updatedProduct = data.products.find(p => p.id === selectedProduct.id);
        if (updatedProduct) {
          selectProduct(updatedProduct);
          alert('✅ Locations refreshed from database!');
        }
      }
    } catch (err) {
      alert('❌ Failed to refresh from database');
      console.error('Update from DB error:', err);
    }
  }

  function updateLocation(index, field, value) {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  }

  function toggleLocation(index) {
    const newLocations = [...locations];
    newLocations[index].enabled = !newLocations[index].enabled;
    setLocations(newLocations);
  }

  async function saveLocations() {
    if (!selectedProduct) return;
    
    setSaving(true);
    try {
      // Only save enabled locations
      const locationsToSave = locations.map(loc => 
        loc.enabled && loc.lat && loc.lon ? loc : { lat: null, lon: null, name: null }
      );
      
      const res = await fetch(`/api/products/${selectedProduct.id}/locations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: locationsToSave })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Locations saved successfully!');
        fetchProducts();
      } else {
        alert('❌ Failed to save locations');
      }
    } catch (err) {
      alert('❌ Error saving locations');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Manage Locations</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <Link href="/" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>📍 Location Manager</h1>
          <p style={styles.subtitle}>Manage 3 locations per product for Blinkit tracking</p>
        </header>

        <div style={styles.layout}>
          {/* Products List */}
          <div style={styles.productsList}>
            <h3 style={styles.sectionTitle}>Select Product</h3>
            {products.length === 0 ? (
              <div style={styles.empty}>No products yet</div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    ...styles.productItem,
                    ...(selectedProduct?.id === product.id ? styles.productItemActive : {})
                  }}
                  onClick={() => selectProduct(product)}
                >
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productMeta}>
                    {[1, 2, 3].map(i => {
                      const hasLocation = product[`location_${i}_name`];
                      return hasLocation ? (
                        <span key={i} style={styles.locationBadge}>
                          📍 {product[`location_${i}_name`]}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Locations Editor */}
          <div style={styles.editor}>
            {!selectedProduct ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>📍</div>
                <p>Select a product to manage locations</p>
              </div>
            ) : (
              <>
                <h3 style={styles.editorTitle}>
                  Locations for: <span style={styles.editorProductName}>{selectedProduct.name}</span>
                </h3>

                {locations.map((location, index) => (
                  <div key={index} style={styles.locationCard}>
                    <div style={styles.locationHeader}>
                      <div style={styles.locationTitle}>
                        <input
                          type="checkbox"
                          checked={location.enabled}
                          onChange={() => toggleLocation(index)}
                          style={styles.checkbox}
                        />
                        <span style={styles.locationNumber}>Location {index + 1}</span>
                      </div>
                      {location.enabled && location.lat && location.lon && (
                        <span style={styles.locationActive}>✅ Active</span>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Location Name</label>
                      <input
                        type="text"
                        style={{...styles.input, opacity: location.enabled ? 1 : 0.5}}
                        placeholder={`Home, Office, Friend's place, etc.`}
                        value={location.name}
                        onChange={(e) => updateLocation(index, 'name', e.target.value)}
                        disabled={!location.enabled}
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Latitude</label>
                        <input
                          type="text"
                          style={{...styles.input, opacity: location.enabled ? 1 : 0.5}}
                          placeholder="13.090095"
                          value={location.lat}
                          onChange={(e) => updateLocation(index, 'lat', e.target.value)}
                          disabled={!location.enabled}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Longitude</label>
                        <input
                          type="text"
                          style={{...styles.input, opacity: location.enabled ? 1 : 0.5}}
                          placeholder="77.641660"
                          value={location.lon}
                          onChange={(e) => updateLocation(index, 'lon', e.target.value)}
                          disabled={!location.enabled}
                        />
                      </div>
                    </div>

                    {index < 2 ? (
                      <div style={styles.helpText}>
                        📍 Preset location - Edit name or uncheck to disable
                      </div>
                    ) : (
                      <div style={styles.helpText}>
                        💡 Custom location - Get coordinates from Google Maps
                      </div>
                    )}
                  </div>
                ))}

                <div style={styles.buttonRow}>
                  <button
                    style={styles.updateBtn}
                    onClick={updateFromDB}
                    disabled={saving}
                  >
                    🔄 Update from DB
                  </button>
                  <button
                    style={styles.saveBtn}
                    onClick={saveLocations}
                    disabled={saving}
                  >
                    {saving ? '⏳ Saving...' : '💾 Save All Locations'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
    position: 'relative',
  },
  backLink: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: '#57F287',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  title: {
    fontSize: '36px',
    margin: '0 0 10px 0',
    background: 'linear-gradient(135deg, #57F287 0%, #39FF14 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '14px',
    color: '#a1a1aa',
    margin: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  productsList: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '20px',
    height: 'fit-content',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#57F287',
  },
  empty: {
    textAlign: 'center',
    color: '#71717a',
    padding: '20px',
    fontSize: '14px',
  },
  productItem: {
    padding: '12px',
    marginBottom: '8px',
    background: '#27272a',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  productItemActive: {
    background: '#1e293b',
    borderColor: '#57F287',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  productMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  locationBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '4px',
    color: '#a1a1aa',
  },
  editor: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '30px',
  },
  placeholder: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#71717a',
  },
  placeholderIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  editorTitle: {
    margin: '0 0 24px 0',
    fontSize: '18px',
    color: '#e4e4e7',
  },
  editorProductName: {
    color: '#57F287',
  },
  locationCard: {
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
  },
  locationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  locationTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#57F287',
  },
  locationNumber: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#57F287',
  },
  locationActive: {
    fontSize: '12px',
    color: '#57F287',
  },
  formGroup: {
    marginBottom: '12px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px',
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  helpText: {
    fontSize: '11px',
    color: '#71717a',
    marginTop: '8px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  updateBtn: {
    flex: '0 0 auto',
    padding: '14px 20px',
    background: '#3f3f46',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveBtn: {
    flex: 1,
    padding: '14px',
    background: '#57F287',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};
