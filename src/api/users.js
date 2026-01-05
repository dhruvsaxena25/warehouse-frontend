import api from './http';

export async function listUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function createUser(data) {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deactivateUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function activateUser(id) {
  const res = await api.post(`/users/${id}/activate`);
  return res.data;
}
