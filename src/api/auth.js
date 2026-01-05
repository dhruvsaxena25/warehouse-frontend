import api from './http';

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function changePassword(current_password, new_password) {
  const res = await api.put('/auth/change-password', {
    current_password,
    new_password,
  });
  return res.data;
}
