import api from './http';

export async function getHealth() {
  const res = await api.get('/health');
  return res.data;
}
