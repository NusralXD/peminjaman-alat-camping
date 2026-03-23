/**
 * Frontend API Service Layer
 * This file centralizes all API calls to the backend.
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res;
  },

  async register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  async seed() {
    const res = await fetch('/api/auth/seed', { method: 'POST' });
    return res;
  },
  
  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res;
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    return res;
  },

  // Equipment (Alat)
  async getAlat() {
    const res = await fetch('/api/alat');
    return res.json();
  },

  async getAlatById(id: string | number) {
    const res = await fetch(`/api/alat/${id}`);
    return res.json();
  },

  async createAlat(data: any) {
    const res = await fetch('/api/alat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  async updateAlat(id: number, data: any) {
    const res = await fetch(`/api/alat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  async deleteAlat(id: number) {
    const res = await fetch(`/api/alat/${id}`, { method: 'DELETE' });
    return res;
  },

  // Categories
  async getCategories() {
    const res = await fetch('/api/kategori');
    return res.json();
  },

  // Loans (Peminjaman)
  async getLoans() {
    const res = await fetch('/api/peminjaman');
    return res.json();
  },

  async createLoan(data: any) {
    const res = await fetch('/api/peminjaman', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return res;
  },

  async updateLoanStatus(id: number, status: string) {
    const res = await fetch(`/api/peminjaman/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res;
  },

  async processReturn(id: number, data: any) {
    const res = await fetch(`/api/peminjaman/${id}/kembali`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  // Cart (Keranjang)
  async getCart() {
    const res = await fetch('/api/keranjang');
    return res.json();
  },

  async addToCart(data: any) {
    const res = await fetch('/api/keranjang', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return res;
  },

  async removeFromCart(id: number) {
    const res = await fetch(`/api/keranjang/${id}`, { method: 'DELETE' });
    return res;
  },

  async checkout(data: any) {
    const res = await fetch('/api/keranjang/checkout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return res;
  },

  // Users
  async getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  },

  async updateUser(id: number, data: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  async deleteUser(id: number) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res;
  },

  // Logs
  async getLogs() {
    const res = await fetch('/api/logs');
    return res.json();
  },

  // Stats
  async getTopBorrowed() {
    const res = await fetch('/api/stats/top-borrowed');
    return res.json();
  },

  // Vouchers
  async getWeeklyVouchers() {
    const res = await fetch('/api/vouchers/weekly', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async claimVoucher(voucherId: number) {
    const res = await fetch('/api/vouchers/claim', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ voucher_id: voucherId })
    });
    return res;
  },

  async getUserVouchers() {
    const res = await fetch('/api/vouchers/user', {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
