import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Konfigurasi Database SQLite
 * File ini bertanggung jawab untuk:
 * 1. Membuat koneksi ke database camping.db
 * 2. Membuat tabel-tabel (Schema) jika belum ada
 * 3. Melakukan migrasi (menambah kolom baru jika ada update)
 * 4. Mengisi data awal (seeding) seperti kategori dan voucher
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inisialisasi Database
const db = new Database(path.join(__dirname, 'camping.db'));

// Inisialisasi Tabel-Tabel (Schema)
db.exec(`
  -- Tabel Users: Menyimpan data akun pengguna (Admin, Petugas, Peminjam)
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
    foto_profil TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nama_penerima TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    state TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    total_bayar INTEGER DEFAULT 0,
    denda INTEGER DEFAULT 0,
    petugas_id INTEGER,
    shipping_address TEXT,
    shipping_method TEXT,
    payment_method TEXT,
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
`);

// Migrations: Add columns if they don't exist
const tableInfoPeminjaman = db.prepare("PRAGMA table_info(peminjaman)").all() as any[];
const columnsPeminjaman = tableInfoPeminjaman.map(c => c.name);

if (!columnsPeminjaman.includes('jumlah_alat')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN jumlah_alat INTEGER DEFAULT 1");
}
if (!columnsPeminjaman.includes('jumlah_hari')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN jumlah_hari INTEGER DEFAULT 1");
}
if (!columnsPeminjaman.includes('total_bayar')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN total_bayar INTEGER DEFAULT 0");
}
if (!columnsPeminjaman.includes('shipping_address')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN shipping_address TEXT");
}
if (!columnsPeminjaman.includes('shipping_method')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN shipping_method TEXT");
}
if (!columnsPeminjaman.includes('payment_method')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN payment_method TEXT");
}
if (!columnsPeminjaman.includes('voucher_item_id')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN voucher_item_id INTEGER");
}
if (!columnsPeminjaman.includes('voucher_shipping_id')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN voucher_shipping_id INTEGER");
}
if (!columnsPeminjaman.includes('diskon_item')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN diskon_item INTEGER DEFAULT 0");
}
if (!columnsPeminjaman.includes('diskon_shipping')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN diskon_shipping INTEGER DEFAULT 0");
}
if (!columnsPeminjaman.includes('store_branch')) {
  db.exec("ALTER TABLE peminjaman ADD COLUMN store_branch TEXT");
}

const tableInfoKeranjang = db.prepare("PRAGMA table_info(keranjang)").all() as any[];
const columnsKeranjang = tableInfoKeranjang.map(c => c.name);

if (!columnsKeranjang.includes('jumlah_alat')) {
  db.exec("ALTER TABLE keranjang ADD COLUMN jumlah_alat INTEGER DEFAULT 1");
}

const tableInfoUsers = db.prepare("PRAGMA table_info(users)").all() as any[];
const columnsUsers = tableInfoUsers.map(c => c.name);

if (!columnsUsers.includes('first_name')) {
  db.exec("ALTER TABLE users ADD COLUMN first_name TEXT");
}
if (!columnsUsers.includes('last_name')) {
  db.exec("ALTER TABLE users ADD COLUMN last_name TEXT");
}
if (!columnsUsers.includes('phone')) {
  db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
}
if (!columnsUsers.includes('email')) {
  db.exec("ALTER TABLE users ADD COLUMN email TEXT");
}
if (!columnsUsers.includes('address')) {
  db.exec("ALTER TABLE users ADD COLUMN address TEXT");
}
if (!columnsUsers.includes('postal_code')) {
  db.exec("ALTER TABLE users ADD COLUMN postal_code TEXT");
}
if (!columnsUsers.includes('state')) {
  db.exec("ALTER TABLE users ADD COLUMN state TEXT");
}
if (!columnsUsers.includes('foto_profil')) {
  db.exec("ALTER TABLE users ADD COLUMN foto_profil TEXT");
}

const tableInfoAlat = db.prepare("PRAGMA table_info(alat)").all() as any[];
const columnsAlat = tableInfoAlat.map(c => c.name);

if (!columnsAlat.includes('kondisi')) {
  db.exec("ALTER TABLE alat ADD COLUMN kondisi TEXT DEFAULT 'Baik'");
}

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  // ...
}

const voucherCount = db.prepare('SELECT COUNT(*) as count FROM vouchers').get() as { count: number };
if (voucherCount.count === 0) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const insertVoucher = db.prepare(`
    INSERT INTO vouchers (code, nama_voucher, deskripsi, tipe, potongan_persen, potongan_nominal, min_pembelian, max_potongan, kuota, tgl_mulai, tgl_berakhir, is_weekly)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVoucher.run('WEEKLY10', 'Diskon Mingguan 10%', 'Diskon 10% untuk semua alat', 'item', 10, 0, 50000, 50000, -1, now.toISOString(), nextWeek.toISOString(), 1);
  insertVoucher.run('FREEONGKIR', 'Gratis Ongkir Mingguan', 'Potongan ongkir hingga Rp 20.000', 'shipping', 0, 20000, 100000, 20000, -1, now.toISOString(), nextWeek.toISOString(), 1);
  insertVoucher.run('CAMPINGNEW', 'Voucher Member Baru', 'Potongan Rp 50.000 untuk pengguna baru', 'item', 0, 50000, 200000, 50000, 100, now.toISOString(), nextMonth.toISOString(), 0);
  insertVoucher.run('FLASH20', 'Flash Sale 20%', 'Diskon 20% terbatas!', 'item', 20, 0, 0, 100000, 50, now.toISOString(), nextWeek.toISOString(), 1);
  insertVoucher.run('ONGKIR50', 'Diskon Ongkir 50%', 'Potongan ongkir 50%', 'shipping', 50, 0, 0, 10000, -1, now.toISOString(), nextWeek.toISOString(), 1);
  insertVoucher.run('WEEKLY5K', 'Diskon Rp 5.000', 'Potongan langsung Rp 5.000', 'item', 0, 5000, 0, 5000, -1, now.toISOString(), nextWeek.toISOString(), 1);
}

export default db;
