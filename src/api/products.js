import api from './http';

export async function listProducts(params = {}) {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function searchProducts(params) {
  const res = await api.get('/products/search', { params });
  return res.data;
}

export async function getProductByUpc(upc) {
  const res = await api.get(`/products/upc/${upc}`);
  return res.data;
}

export async function getCategories() {
  const res = await api.get('/products/categories');
  return res.data;
}

export async function getStats() {
  const res = await api.get('/products/stats');
  return res.data;
}
