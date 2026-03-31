-- Database Schema for Camping Rental App
-- Generated for MySQL Compatibility

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS camping_db;
USE camping_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  role ENUM('admin', 'petugas', 'peminjam') NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  postal_code VARCHAR(10),
  state VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kategori (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_kategori VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS alat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_alat VARCHAR(255) NOT NULL,
  kategori_id INT,
  harga_per_hari INT NOT NULL,
  stok INT NOT NULL,
  gambar_url TEXT,
  deskripsi TEXT,
  kondisi VARCHAR(50) DEFAULT 'Baik',
  FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

CREATE TABLE IF NOT EXISTS peminjaman (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  alat_id INT NOT NULL,
  tgl_pinjam DATE NOT NULL,
  tgl_kembali DATE NOT NULL,
  tgl_realisasi_kembali DATE,
  status ENUM('pending', 'disetujui', 'ditolak', 'dikirim', 'diterima', 'kembali') DEFAULT 'pending',
  jumlah_alat INT DEFAULT 1,
  jumlah_hari INT DEFAULT 1,
  total_bayar INT DEFAULT 0,
  denda INT DEFAULT 0,
  petugas_id INT,
  shipping_address TEXT,
  shipping_method VARCHAR(100),
  payment_method VARCHAR(100),
  voucher_item_id INT,
  voucher_shipping_id INT,
  diskon_item INT DEFAULT 0,
  diskon_shipping INT DEFAULT 0,
  store_branch VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (alat_id) REFERENCES alat(id),
  FOREIGN KEY (petugas_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS log_aktivitas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  aktivitas VARCHAR(255) NOT NULL,
  keterangan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS keranjang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  alat_id INT NOT NULL,
  jumlah_hari INT DEFAULT 1,
  jumlah_alat INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (alat_id) REFERENCES alat(id)
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  nama_voucher VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tipe ENUM('item', 'shipping') NOT NULL,
  potongan_persen INT DEFAULT 0,
  potongan_nominal INT DEFAULT 0,
  min_pembelian INT DEFAULT 0,
  max_potongan INT,
  kuota INT DEFAULT -1,
  tgl_mulai DATETIME NOT NULL,
  tgl_berakhir DATETIME NOT NULL,
  is_weekly TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  voucher_id INT NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

-- Trigger for MySQL
DELIMITER //
CREATE TRIGGER log_peminjaman_status_update
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO log_aktivitas (user_id, aktivitas, keterangan)
    VALUES (NEW.petugas_id, 'Update Status Peminjaman', CONCAT('Peminjaman ID ', NEW.id, ' diubah statusnya menjadi ', NEW.status));
  END IF;
END;
//
DELIMITER ;

-- Initial Data Seed
INSERT INTO kategori (nama_kategori) VALUES ('Tenda'), ('Carrier'), ('Cooking Set'), ('Sleeping Bag'), ('Lampu');

INSERT INTO vouchers (code, nama_voucher, deskripsi, tipe, potongan_persen, potongan_nominal, min_pembelian, max_potongan, kuota, tgl_mulai, tgl_berakhir, is_weekly)
VALUES 
('WEEKLY10', 'Diskon Mingguan 10%', 'Diskon 10% untuk semua alat', 'item', 10, 0, 50000, 50000, -1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1),
('FREEONGKIR', 'Gratis Ongkir Mingguan', 'Potongan ongkir hingga Rp 20.000', 'shipping', 0, 20000, 100000, 20000, -1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1),
('CAMPINGNEW', 'Voucher Member Baru', 'Potongan Rp 50.000 untuk pengguna baru', 'item', 0, 50000, 200000, 50000, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0);
