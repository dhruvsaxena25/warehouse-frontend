import api from './http';

export async function validateName(name) {
  const res = await api.get(`/pick-requests/validate-name/${name}`);
  return res.data;
}

export async function createPickRequest(data) {
  const res = await api.post('/pick-requests', data);
  return res.data;
}

export async function listPickRequests(params = {}) {
  const res = await api.get('/pick-requests', { params });
  return res.data;
}

export async function getPickRequest(name) {
  const res = await api.get(`/pick-requests/${name}`);
  return res.data;
}

export async function deletePickRequest(name) {
  const res = await api.delete(`/pick-requests/${name}`);
  return res.data;
}

export async function startPicking(name) {
  const res = await api.post(`/pick-requests/${name}/start`);
  return res.data;
}

export async function updateItemQuantity(name, upc, picked_quantity) {
  const res = await api.put(`/pick-requests/${name}/items/${upc}`, {
    picked_quantity,
  });
  return res.data;
}

export async function submitPickRequest(name, skip_shortage_validation = false) {
  const res = await api.post(`/pick-requests/${name}/submit`, null, {
    params: { skip_shortage_validation },
  });
  return res.data;
}

export async function releaseLock(name) {
  const res = await api.post(`/pick-requests/${name}/release`);
  return res.data;
}
