const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token, admin } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export const api = {
  // user auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  verifyEmail: (body) => request('/auth/verify-email', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
  // admin auth
  adminLogin: (body) => request('/admin/auth/login', { method: 'POST', body }),
  // menu / builder
  getMenu: () => request('/pizza/menu'),
  getOptions: () => request('/pizza/options'),
  // orders (user)
  createOrder: (body, token) => request('/orders', { method: 'POST', body, token }),
  verifyPayment: (body, token) => request('/orders/verify', { method: 'POST', body, token }),
  myOrders: (token) => request('/orders/mine', { token }),
  // orders (admin)
  allOrders: (token) => request('/orders', { token }),
  updateOrderStatus: (id, status, token) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),
  // inventory (admin)
  getInventory: (token) => request('/inventory', { token }),
  updateStock: (id, body, token) => request(`/inventory/${id}`, { method: 'PATCH', body, token }),
};
