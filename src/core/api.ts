/**
 * Frontend API Service Layer
 * File ini berfungsi sebagai jembatan antara Frontend (React) dan Backend (Express).
 * Semua pemanggilan fetch dikumpulkan di sini agar lebih rapi dan mudah dikelola.
 */

/**
 * Fungsi pembantu untuk mengambil header otentikasi.
 * Mengambil token JWT dari localStorage jika tersedia.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // --- AUTHENTICATION ---
  
  /** Login user ke sistem */
  async login(credentials: any) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res;
  },

  /** Registrasi user baru */
  async register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  /** Inisialisasi data awal (Seed) */
  async seed() {
    const res = await fetch('/api/auth/seed', { method: 'POST' });
    return res;
  },
  
  /** Logout user dan hapus session */
  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res;
  },

  /** Mengambil data profil user yang sedang login */
  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    return res;
  },

  // --- EQUIPMENT (ALAT) ---

  /** Mengambil semua daftar alat camping */
  async getAlat() {
    const res = await fetch('/api/alat');
    return res.json();
  },

  /** Mengambil detail alat berdasarkan ID */
  async getAlatById(id: string | number) {
    const res = await fetch(`/api/alat/${id}`);
    return res.json();
  },

  /** Menambah alat baru (Admin/Petugas) */
  async createAlat(data: any) {
    const res = await fetch('/api/alat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  /** Update data alat (Admin/Petugas) */
  async updateAlat(id: number, data: any) {
    const res = await fetch(`/api/alat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  /** Hapus alat (Admin/Petugas) */
  async deleteAlat(id: number) {
    const res = await fetch(`/api/alat/${id}`, { method: 'DELETE' });
    return res;
  },

  // --- CATEGORIES ---

  /** Mengambil semua kategori alat */
  async getCategories() {
    const res = await fetch('/api/kategori');
    return res.json();
  },

  // --- LOANS (PEMINJAMAN) ---

  /** Mengambil semua data peminjaman */
  async getLoans() {
    const res = await fetch('/api/peminjaman');
    return res.json();
  },

  /** Membuat pesanan peminjaman baru */
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

  /** Update status peminjaman (Pending -> Disetujui, dll) */
  async updateLoanStatus(id: number, status: string) {
    const res = await fetch(`/api/peminjaman/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res;
  },

  /** Proses pengembalian alat dan hitung denda */
  async processReturn(id: number, data: any) {
    const res = await fetch(`/api/peminjaman/${id}/kembali`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  // --- CART (KERANJANG) ---

  /** Mengambil isi keranjang user */
  async getCart() {
    const res = await fetch('/api/keranjang');
    return res.json();
  },

  /** Menambah alat ke keranjang */
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

  /** Hapus item dari keranjang */
  async removeFromCart(id: number) {
    const res = await fetch(`/api/keranjang/${id}`, { method: 'DELETE' });
    return res;
  },

  /** Checkout keranjang menjadi peminjaman */
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

  // --- USERS ---

  /** Mengambil daftar user (Admin) */
  async getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  },

  /** Update data user (Admin) */
  async updateUser(id: number, data: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res;
  },

  /** Hapus user (Admin) */
  async deleteUser(id: number) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res;
  },

  // --- LOGS ---

  /** Mengambil log aktivitas sistem */
  async getLogs() {
    const res = await fetch('/api/logs');
    return res.json();
  },

  // --- STATS ---

  /** Mengambil statistik alat paling sering dipinjam */
  async getTopBorrowed() {
    const res = await fetch('/api/stats/top-borrowed');
    return res.json();
  },

  // --- VOUCHERS ---

  /** Mengambil daftar voucher mingguan */
  async getWeeklyVouchers() {
    const res = await fetch('/api/vouchers/weekly', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  /** Klaim voucher oleh user */
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

  /** Mengambil daftar voucher yang dimiliki user */
  async getUserVouchers() {
    const res = await fetch('/api/vouchers/user', {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
