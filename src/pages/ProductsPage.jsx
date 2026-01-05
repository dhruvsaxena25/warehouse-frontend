import React, { useState } from 'react';
import { searchProducts } from '../api/products';

const ProductsPage = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const data = await searchProducts({ q: query, limit: 50 });
      setProducts(data.products || []);
      setSearched(true);
    } catch (err) {
      alert('Search failed');
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Product Catalog</h1>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search by product name or UPC..."
            style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      {searched && (
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            {products.length} results
          </h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>UPC</th>
                <th>Category</th>
                <th>Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td><code>{p.upc}</code></td>
                  <td>{p.main_category || '-'}</td>
                  <td>{p.subcategory || '-'}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
