const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : `${window.location.origin}/api`;

function getToken() {
  return localStorage.getItem('spilnokup_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res = await fetch(`${API}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    try {
      await refreshToken();
      headers['Authorization'] = `Bearer ${getToken()}`;
      res = await fetch(`${API}${path}`, { ...options, headers });
    } catch { /* refresh failed */ }
  }

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

export async function verifyOtp(phone, otp, name, city) {
  const data = await request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp, name, city }) });
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

export async function fetchSellerDeals() {
  return request('/deals/seller/my');
}

// Orders
export async function createOrder(dealId, quantity) {
  return request('/orders', { method: 'POST', body: JSON.stringify({ dealId, quantity }) });
}

export async function fetchMyOrders() {
  return request('/orders/my');
}

export async function fetchSellerOrders() {
  return request('/orders/seller');
}

// QR
export async function generateQR(orderId) {
  return request(`/qr/generate/${orderId}`, { method: 'POST' });
}

export async function verifyQR(token) {
  return request('/qr/verify', { method: 'POST', body: JSON.stringify({ token }) });
}

// Chat
export async function fetchConversations() {
  return request('/chat/conversations');
}

export async function createConversation(sellerId, dealId) {
  return request('/chat/conversations', { method: 'POST', body: JSON.stringify({ sellerId, dealId }) });
}

export async function fetchMessages(conversationId) {
  return request(`/chat/${conversationId}/messages`);
}

export async function sendMessageApi(conversationId, text) {
  return request(`/chat/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
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

export function isLoggedIn() {
  return !!getToken();
}

export { API };
