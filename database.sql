-- Database Schema for Camping Rental App
-- Generated for SQLite

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'petugas', 'peminjam')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  postal_code TEXT,
  state TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kategori (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_kategori TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_alat TEXT NOT NULL,
  kategori_id INTEGER,
  harga_per_hari INTEGER NOT NULL,
  stok INTEGER NOT NULL,
  gambar_url TEXT,
  deskripsi TEXT,
  kondisi TEXT DEFAULT 'Baik',
  FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

CREATE TABLE IF NOT EXISTS peminjaman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  alat_id INTEGER NOT NULL,
  tgl_pinjam DATE NOT NULL,
  tgl_kembali DATE NOT NULL,
  tgl_realisasi_kembali DATE,
  status TEXT CHECK(status IN ('pending', 'disetujui', 'ditolak', 'dikirim', 'diterima', 'kembali')) DEFAULT 'pending',
  jumlah_alat INTEGER DEFAULT 1,
  jumlah_hari INTEGER DEFAULT 1,
  total_bayar INTEGER DEFAULT 0,
  denda INTEGER DEFAULT 0,
  petugas_id INTEGER,
  shipping_address TEXT,
  shipping_method TEXT,
  payment_method TEXT,
  voucher_item_id INTEGER,
  voucher_shipping_id INTEGER,
  diskon_item INTEGER DEFAULT 0,
  diskon_shipping INTEGER DEFAULT 0,
  store_branch TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (alat_id) REFERENCES alat(id),
  FOREIGN KEY (petugas_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS log_aktivitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  aktivitas TEXT NOT NULL,
  keterangan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS keranjang (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  alat_id INTEGER NOT NULL,
  jumlah_hari INTEGER DEFAULT 1,
  jumlah_alat INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (alat_id) REFERENCES alat(id)
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  nama_voucher TEXT NOT NULL,
  deskripsi TEXT,
  tipe TEXT CHECK(tipe IN ('item', 'shipping')) NOT NULL,
  potongan_persen INTEGER DEFAULT 0,
  potongan_nominal INTEGER DEFAULT 0,
  min_pembelian INTEGER DEFAULT 0,
  max_potongan INTEGER,
  kuota INTEGER DEFAULT -1,
  tgl_mulai DATETIME NOT NULL,
  tgl_berakhir DATETIME NOT NULL,
  is_weekly BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  voucher_id INTEGER NOT NULL,
  is_used BOOLEAN DEFAULT 0,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

CREATE TRIGGER IF NOT EXISTS log_peminjaman_status_update
AFTER UPDATE OF status ON peminjaman
BEGIN
  INSERT INTO log_aktivitas (user_id, aktivitas, keterangan)
  VALUES (NEW.petugas_id, 'Update Status Peminjaman', 'Peminjaman ID ' || NEW.id || ' diubah statusnya menjadi ' || NEW.status);
END;

-- Initial Data Seed
INSERT INTO kategori (nama_kategori) VALUES ('Tenda'), ('Carrier'), ('Cooking Set'), ('Sleeping Bag'), ('Lampu');

INSERT INTO vouchers (code, nama_voucher, deskripsi, tipe, potongan_persen, potongan_nominal, min_pembelian, max_potongan, kuota, tgl_mulai, tgl_berakhir, is_weekly)
VALUES 
('WEEKLY10', 'Diskon Mingguan 10%', 'Diskon 10% untuk semua alat', 'item', 10, 0, 50000, 50000, -1, CURRENT_TIMESTAMP, datetime('now', '+7 days'), 1),
('FREEONGKIR', 'Gratis Ongkir Mingguan', 'Potongan ongkir hingga Rp 20.000', 'shipping', 0, 20000, 100000, 20000, -1, CURRENT_TIMESTAMP, datetime('now', '+7 days'), 1),
('CAMPINGNEW', 'Voucher Member Baru', 'Potongan Rp 50.000 untuk pengguna baru', 'item', 0, 50000, 200000, 50000, 100, CURRENT_TIMESTAMP, datetime('now', '+30 days'), 0);
