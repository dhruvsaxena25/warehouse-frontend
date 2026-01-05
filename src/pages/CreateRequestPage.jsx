import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateName, createPickRequest } from '../api/pickRequests';
import { searchProducts } from '../api/products';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const data = await searchProducts({ q: searchQuery, limit: 20 });
    setSearchResults(data.products || []);
  };

  const addItem = (product) => {
    const existing = items.find((i) => i.upc === product.upc);
    if (existing) {
      setItems(items.map((i) => (i.upc === product.upc ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setItems([...items, { upc: product.upc, name: product.name, quantity: 1 }]);
    }
  };

  const removeItem = (upc) => {
    setItems(items.filter((i) => i.upc !== upc));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Add at least one item');
      return;
    }

    try {
      const validation = await validateName(name);
      if (!validation.available) {
        alert('Name already exists');
        return;
      }

      await createPickRequest({
        name: validation.normalized_name,
        priority,
        items: items.map((i) => ({ upc: i.upc, quantity: i.quantity })),
      });

      alert('Request created');
      navigate('/pick-requests');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create');
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Create Pick Request</h1>

      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Request Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#475569' }}>Request Name</label>
            <input
              type="text"
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. monday-restock"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#475569' }}>Priority</label>
            <select
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Add Items</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search products..."
            style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '24px' }}>
            {searchResults.map((p) => (
              <div
                key={p.upc}
                style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{p.upc}</div>
                </div>
                <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => addItem(p)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Cart ({items.length})</h2>
        {items.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No items added</p>
        ) : (
          <table style={{ marginBottom: '24px' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>UPC</th>
                <th>Quantity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.upc}>
                  <td>{item.name}</td>
                  <td><code>{item.upc}</code></td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      style={{ width: '80px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      value={item.quantity}
                      onChange={(e) =>
                        setItems(items.map((i) => (i.upc === item.upc ? { ...i, quantity: parseInt(e.target.value) || 1 } : i)))
                      }
                    />
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => removeItem(item.upc)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button className="btn btn-primary" onClick={handleSubmit} disabled={items.length === 0}>
          Create Request
        </button>
      </div>
    </div>
  );
};

export default CreateRequestPage;
