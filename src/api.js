const API = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('spilnokup_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Помилка сервера' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export async function sendOtp(phone) {
  return request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function verifyOtp(phone, otp) {
  const data = await request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) });
  if (data.accessToken) {
    localStorage.setItem('spilnokup_token', data.accessToken);
    localStorage.setItem('spilnokup_refresh', data.refreshToken);
    localStorage.setItem('spilnokup_user', JSON.stringify(data.user));
  }
  return data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem('spilnokup_refresh');
  if (!refresh) throw new Error('No refresh token');
  const data = await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: refresh }) });
  if (data.accessToken) localStorage.setItem('spilnokup_token', data.accessToken);
  return data;
}

// Deals
export async function fetchDeals({ category, city, sort, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (city && city !== 'all') params.set('city', city);
  if (sort) params.set('sort', sort);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  return request(`/deals?${params}`);
}

export async function fetchDeal(id) {
  return request(`/deals/${id}`);
}

export async function createDeal(deal) {
  return request('/deals', { method: 'POST', body: JSON.stringify(deal) });
}

// Wallet
export async function fetchWallet() {
  return request('/wallet');
}

export async function withdrawFunds(amount) {
  return request('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) });
}

export function logout() {
  localStorage.removeItem('spilnokup_token');
  localStorage.removeItem('spilnokup_refresh');
  localStorage.removeItem('spilnokup_user');
}
