import express from 'express';
import db from './db.ts';
import { authenticateToken, authorizeRole, logActivity } from './auth.ts';
import { getLogs as getFileLogs } from './logger.ts';

const router = express.Router();

/**
 * --- ALAT (EQUIPMENT) ---
 * Bagian ini menangani data alat camping (tenda, tas, dll)
 */

// Mengambil semua data alat beserta nama kategorinya
router.get('/alat', (req, res) => {
  const alat = db.prepare(`
    SELECT alat.*, kategori.nama_kategori 
    FROM alat 
    LEFT JOIN kategori ON alat.kategori_id = kategori.id
  `).all();
  res.json(alat);
});

// Mengambil detail alat berdasarkan ID
router.get('/alat/:id', (req, res) => {
  const alat = db.prepare(`
    SELECT alat.*, kategori.nama_kategori 
    FROM alat 
    LEFT JOIN kategori ON alat.kategori_id = kategori.id
    WHERE alat.id = ?
  `).get(req.params.id);
  if (!alat) return res.status(404).json({ message: 'Alat tidak ditemukan' });
  res.json(alat);
});

// Menambah alat baru (Hanya Admin)
router.post('/alat', authenticateToken, authorizeRole(['admin']), (req: any, res) => {
  const { nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi, kondisi } = req.body;
  const stmt = db.prepare('INSERT INTO alat (nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi, kondisi) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi, kondisi || 'Baik');
  logActivity(req.user.id, 'Tambah Alat', `Menambah alat: ${nama_alat}`);
  res.json({ id: result.lastInsertRowid });
});

// Mengupdate data alat (Hanya Admin)
router.put('/alat/:id', authenticateToken, authorizeRole(['admin']), (req: any, res) => {
  const { nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi, kondisi } = req.body;
  const stmt = db.prepare('UPDATE alat SET nama_alat=?, kategori_id=?, harga_per_hari=?, stok=?, gambar_url=?, deskripsi=?, kondisi=? WHERE id=?');
  stmt.run(nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi, kondisi || 'Baik', req.params.id);
  logActivity(req.user.id, 'Update Alat', `Update alat ID: ${req.params.id}`);
  res.json({ message: 'Updated' });
});

// Menghapus alat (Hanya Admin)
router.delete('/alat/:id', authenticateToken, authorizeRole(['admin']), (req: any, res) => {
  // Hapus data terkait terlebih dahulu
  db.prepare('DELETE FROM keranjang WHERE alat_id=?').run(req.params.id);
  db.prepare('DELETE FROM peminjaman WHERE alat_id=?').run(req.params.id);
  
  db.prepare('DELETE FROM alat WHERE id=?').run(req.params.id);
  logActivity(req.user.id, 'Hapus Alat', `Hapus alat ID: ${req.params.id}`);
  res.json({ message: 'Deleted' });
});

/**
 * --- KATEGORI ---
 */

// Mengambil daftar kategori alat
router.get('/kategori', (req, res) => {
  const categories = db.prepare('SELECT * FROM kategori').all();
  res.json(categories);
});

/**
 * --- PEMINJAMAN (LOANS) ---
 * Bagian ini menangani transaksi sewa alat
 */

// Mengambil data peminjaman (Peminjam hanya melihat miliknya, Admin/Petugas melihat semua)
router.get('/peminjaman', authenticateToken, (req: any, res) => {
  let query = `
    SELECT p.*, u.nama_lengkap as peminjam, a.nama_alat, a.harga_per_hari, a.gambar_url, a.deskripsi
    FROM peminjaman p
    JOIN users u ON p.user_id = u.id
    JOIN alat a ON p.alat_id = a.id
  `;
  
  const params: any[] = [];
  if (req.user.role === 'peminjam') {
    query += ' WHERE p.user_id = ?';
    params.push(req.user.id);
  }

  const data = db.prepare(query).all(...params);
  res.json(data);
});

// Mengajukan peminjaman baru (Hanya Peminjam)
router.post('/peminjaman', authenticateToken, authorizeRole(['peminjam']), (req: any, res) => {
  const { alat_id, tgl_pinjam, tgl_kembali, jumlah_alat } = req.body;
  
  const alat: any = db.prepare('SELECT harga_per_hari, stok FROM alat WHERE id = ?').get(alat_id);
  if (!alat) return res.status(404).json({ message: 'Alat tidak ditemukan' });
  if (alat.stok < (jumlah_alat || 1)) return res.status(400).json({ message: 'Stok tidak mencukupi' });

  const start = new Date(tgl_pinjam);
  const end = new Date(tgl_kembali);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const total_bayar = diffDays * alat.harga_per_hari * (jumlah_alat || 1);

  const stmt = db.prepare('INSERT INTO peminjaman (user_id, alat_id, tgl_pinjam, tgl_kembali, jumlah_alat, total_bayar, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(req.user.id, alat_id, tgl_pinjam, tgl_kembali, jumlah_alat || 1, total_bayar, 'pending');
  
  logActivity(req.user.id, 'Ajukan Peminjaman', `Mengajukan pinjam alat ID: ${alat_id} sebanyak ${jumlah_alat || 1}`);
  res.json({ id: result.lastInsertRowid });
});

// Mengupdate status peminjaman (Disetujui, Dikirim, dll - Hanya Petugas/Admin)
router.patch('/peminjaman/:id/status', authenticateToken, authorizeRole(['petugas', 'admin']), (req: any, res) => {
  const { status } = req.body;
  
  const current: any = db.prepare('SELECT status, alat_id, jumlah_alat FROM peminjaman WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ message: 'Data tidak ditemukan' });

  const stmt = db.prepare('UPDATE peminjaman SET status = ?, petugas_id = ? WHERE id = ?');
  stmt.run(status, req.user.id, req.params.id);

  // Logika stok: Berkurang saat dikirim, bertambah saat kembali
  if (status === 'dikirim' && current.status !== 'dikirim') {
    db.prepare('UPDATE alat SET stok = stok - ? WHERE id = ?').run(current.jumlah_alat, current.alat_id);
  } else if (status === 'kembali' && (current.status === 'dikirim' || current.status === 'diterima')) {
    db.prepare('UPDATE alat SET stok = stok + ? WHERE id = ?').run(current.jumlah_alat, current.alat_id);
  }

  logActivity(req.user.id, 'Update Status Pinjam', `Update status pinjam ID: ${req.params.id} ke ${status}`);
  res.json({ message: 'Status updated' });
});

router.patch('/peminjaman/:id/receive', authenticateToken, (req: any, res) => {
  const p: any = db.prepare('SELECT status, user_id FROM peminjaman WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ message: 'Data tidak ditemukan' });
  if (p.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (p.status !== 'dikirim') return res.status(400).json({ message: 'Alat belum dikirim' });

  db.prepare('UPDATE peminjaman SET status = ? WHERE id = ?').run('diterima', req.params.id);
  logActivity(req.user.id, 'Terima Alat', `Menerima alat ID: ${req.params.id}`);
  res.json({ message: 'Status updated to diterima' });
});

router.post('/peminjaman/:id/kembali', authenticateToken, (req: any, res) => {
  const { tgl_realisasi_kembali } = req.body;
  const p: any = db.prepare(`
    SELECT p.*, a.harga_per_hari 
    FROM peminjaman p 
    JOIN alat a ON p.alat_id = a.id 
    WHERE p.id = ?
  `).get(req.params.id);

  if (!p) return res.status(404).json({ message: 'Data tidak ditemukan' });
  if (p.status === 'kembali') return res.status(400).json({ message: 'Alat sudah dikembalikan' });

  const start = new Date(p.tgl_pinjam);
  const end = new Date(p.tgl_kembali);
  const real = new Date(tgl_realisasi_kembali);
  
  // Calculate total bayar base
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  let total = diffDays * p.harga_per_hari * p.jumlah_alat;

  // Calculate denda
  let denda = 0;
  if (real > end) {
    const lateTime = Math.abs(real.getTime() - end.getTime());
    const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
    denda = lateDays * (p.harga_per_hari * 0.5) * p.jumlah_alat; // Denda 50% harga sewa per hari per alat
    total += denda;
  }

  db.prepare('UPDATE peminjaman SET tgl_realisasi_kembali = ?, status = ?, total_bayar = ?, denda = ? WHERE id = ?')
    .run(tgl_realisasi_kembali, 'kembali', total, denda, req.params.id);

  // Restore stock ONLY if it was reduced (status was 'dikirim' or 'diterima')
  if (p.status === 'dikirim' || p.status === 'diterima') {
    db.prepare('UPDATE alat SET stok = stok + ? WHERE id = ?').run(p.jumlah_alat, p.alat_id);
  }

  logActivity(req.user.id, 'Pengembalian Alat', `Mengembalikan alat ID: ${p.alat_id} (Denda: ${denda})`);
  res.json({ total, denda });
});

// --- KERANJANG ---
router.get('/keranjang', authenticateToken, (req: any, res) => {
  const cart = db.prepare(`
    SELECT k.*, a.nama_alat, a.harga_per_hari, a.gambar_url
    FROM keranjang k
    JOIN alat a ON k.alat_id = a.id
    WHERE k.user_id = ?
  `).all(req.user.id);
  res.json(cart);
});

router.post('/keranjang', authenticateToken, (req: any, res) => {
  const { alat_id, jumlah_hari, jumlah_alat } = req.body;
  const stmt = db.prepare('INSERT INTO keranjang (user_id, alat_id, jumlah_hari, jumlah_alat) VALUES (?, ?, ?, ?)');
  const result = stmt.run(req.user.id, alat_id, jumlah_hari || 1, jumlah_alat || 1);
  res.json({ id: result.lastInsertRowid });
});

router.delete('/keranjang/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM keranjang WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

router.post('/keranjang/checkout', authenticateToken, (req: any, res) => {
  const { 
    shipping_info, 
    selectedIds, 
    directItem, 
    shipping_method, 
    payment_method, 
    voucher_item_id, 
    voucher_shipping_id,
    store_branch 
  } = req.body;
  
  const tgl_pinjam = new Date().toISOString().split('T')[0];
  const shipping_address = shipping_info ? `${shipping_info.address}, ${shipping_info.state} ${shipping_info.postalCode}` : null;
  
  const insertLoan = db.prepare('INSERT INTO peminjaman (user_id, alat_id, tgl_pinjam, tgl_kembali, jumlah_alat, jumlah_hari, total_bayar, status, shipping_address, shipping_method, payment_method, voucher_item_id, voucher_shipping_id, diskon_item, diskon_shipping, store_branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const deleteCart = db.prepare('DELETE FROM keranjang WHERE id = ? AND user_id = ?');
  const markVoucherUsed = db.prepare('UPDATE user_vouchers SET is_used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');

  const transaction = db.transaction(() => {
    let total_diskon_item = 0;
    let total_diskon_shipping = 0;

    // Fetch voucher details if provided
    let voucherItem: any = null;
    let voucherShipping: any = null;

    if (voucher_item_id) {
      voucherItem = db.prepare(`
        SELECT v.*, uv.id as uv_id 
        FROM user_vouchers uv 
        JOIN vouchers v ON uv.voucher_id = v.id 
        WHERE uv.id = ? AND uv.user_id = ? AND uv.is_used = 0
      `).get(voucher_item_id, req.user.id);
    }

    if (voucher_shipping_id) {
      voucherShipping = db.prepare(`
        SELECT v.*, uv.id as uv_id 
        FROM user_vouchers uv 
        JOIN vouchers v ON uv.voucher_id = v.id 
        WHERE uv.id = ? AND uv.user_id = ? AND uv.is_used = 0
      `).get(voucher_shipping_id, req.user.id);
    }

    const shippingCosts: Record<string, number> = {
      jne: 25000,
      jnt: 22000,
      sicepat: 20000,
      gosend: 45000,
      grab: 42000
    };
    const shipping_cost = shippingCosts[shipping_method] || 0;

    if (directItem) {
      // Direct checkout for a single item
      const tgl_kembali = new Date(Date.now() + directItem.jumlah_hari * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const alat: any = db.prepare('SELECT harga_per_hari FROM alat WHERE id = ?').get(directItem.alat_id);
      if (!alat) throw new Error('Alat tidak ditemukan');
      
      const subtotal = directItem.jumlah_hari * alat.harga_per_hari * directItem.jumlah_alat;
      let diskon_item = 0;
      if (voucherItem && subtotal >= voucherItem.min_pembelian) {
        if (voucherItem.potongan_persen > 0) {
          diskon_item = Math.floor(subtotal * (voucherItem.potongan_persen / 100));
          if (voucherItem.max_potongan) diskon_item = Math.min(diskon_item, voucherItem.max_potongan);
        } else {
          diskon_item = voucherItem.potongan_nominal;
        }
      }

      // Shipping discount
      let diskon_shipping = 0;
      if (voucherShipping && shipping_cost >= voucherShipping.min_pembelian) {
        if (voucherShipping.potongan_persen > 0) {
          diskon_shipping = Math.floor(shipping_cost * (voucherShipping.potongan_persen / 100));
          if (voucherShipping.max_potongan) diskon_shipping = Math.min(diskon_shipping, voucherShipping.max_potongan);
        } else {
          diskon_shipping = voucherShipping.potongan_nominal;
        }
        diskon_shipping = Math.min(diskon_shipping, shipping_cost);
      }

      const vat = subtotal * 0.1;
      const final_total = Math.max(0, subtotal + vat + shipping_cost - diskon_item - diskon_shipping);
      insertLoan.run(req.user.id, directItem.alat_id, tgl_pinjam, tgl_kembali, directItem.jumlah_alat, directItem.jumlah_hari, final_total, 'pending', shipping_address, shipping_method, payment_method, voucherItem?.id, voucherShipping?.id, diskon_item, diskon_shipping, store_branch);
    } else {
      // Cart checkout
      let query = 'SELECT k.*, a.harga_per_hari FROM keranjang k JOIN alat a ON k.alat_id = a.id WHERE k.user_id = ?';
      const params: any[] = [req.user.id];
      
      if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
        query += ` AND k.id IN (${selectedIds.map(() => '?').join(',')})`;
        params.push(...selectedIds);
      }

      const cartItems: any[] = db.prepare(query).all(...params);
      if (cartItems.length === 0) throw new Error('Keranjang kosong atau item tidak terpilih');

      // Calculate subtotal for voucher validation
      const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.jumlah_hari * item.harga_per_hari * item.jumlah_alat), 0);
      
      let diskon_item_total = 0;
      if (voucherItem && cartSubtotal >= voucherItem.min_pembelian) {
        if (voucherItem.potongan_persen > 0) {
          diskon_item_total = Math.floor(cartSubtotal * (voucherItem.potongan_persen / 100));
          if (voucherItem.max_potongan) diskon_item_total = Math.min(diskon_item_total, voucherItem.max_potongan);
        } else {
          diskon_item_total = voucherItem.potongan_nominal;
        }
      }

      let diskon_shipping_total = 0;
      if (voucherShipping && shipping_cost >= voucherShipping.min_pembelian) {
        if (voucherShipping.potongan_persen > 0) {
          diskon_shipping_total = Math.floor(shipping_cost * (voucherShipping.potongan_persen / 100));
          if (voucherShipping.max_potongan) diskon_shipping_total = Math.min(diskon_shipping_total, voucherShipping.max_potongan);
        } else {
          diskon_shipping_total = voucherShipping.potongan_nominal;
        }
        diskon_shipping_total = Math.min(diskon_shipping_total, shipping_cost);
      }

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const tgl_kembali = new Date(Date.now() + item.jumlah_hari * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const item_subtotal = item.jumlah_hari * item.harga_per_hari * item.jumlah_alat;
        
        // Apply proportional discount
        let item_diskon = 0;
        if (diskon_item_total > 0) {
          item_diskon = Math.floor((item_subtotal / cartSubtotal) * diskon_item_total);
        }

        // Apply proportional shipping and shipping discount
        const item_shipping = Math.floor((item_subtotal / cartSubtotal) * shipping_cost);
        const item_diskon_shipping = Math.floor((item_subtotal / cartSubtotal) * diskon_shipping_total);

        const vat = item_subtotal * 0.1;
        const item_total = Math.max(0, item_subtotal + vat + item_shipping - item_diskon - item_diskon_shipping);
        
        insertLoan.run(req.user.id, item.alat_id, tgl_pinjam, tgl_kembali, item.jumlah_alat, item.jumlah_hari, item_total, 'pending', shipping_address, shipping_method, payment_method, voucherItem?.id, voucherShipping?.id, item_diskon, item_diskon_shipping, store_branch);
        deleteCart.run(item.id, req.user.id);
      }
    }

    // Mark vouchers as used
    if (voucherItem) markVoucherUsed.run(voucher_item_id, req.user.id);
    if (voucherShipping) markVoucherUsed.run(voucher_shipping_id, req.user.id);
  });

  try {
    transaction();
    res.json({ message: 'Checkout successful' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// --- LOGS ---
router.get('/logs', authenticateToken, authorizeRole(['admin']), (req, res) => {
  // Mengambil log dari file activity.log, bukan dari database
  const logs = getFileLogs();
  res.json(logs);
});

// --- USERS ---
router.get('/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const users = db.prepare('SELECT id, username, nama_lengkap, role, first_name, last_name, phone, email, address, postal_code, state, created_at FROM users').all();
  res.json(users);
});

router.put('/users/:id', authenticateToken, authorizeRole(['admin']), (req: any, res) => {
  const { username, password, nama_lengkap, role, email, phone, address, state, postal_code } = req.body;
  
  let query = 'UPDATE users SET username=?, nama_lengkap=?, role=?, email=?, phone=?, address=?, state=?, postal_code=?';
  const params = [username, nama_lengkap, role, email, phone, address, state, postal_code];
  
  if (password) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += ', password=?';
    params.push(hashedPassword);
  }
  
  query += ' WHERE id=?';
  params.push(req.params.id);
  
  db.prepare(query).run(...params);
  logActivity(req.user.id, 'Update User', `Update user ID: ${req.params.id}`);
  res.json({ message: 'Updated' });
});

router.delete('/users/:id', authenticateToken, authorizeRole(['admin']), (req: any, res) => {
  // Cegah hapus diri sendiri
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
  }

  // Hapus data terkait terlebih dahulu
  db.prepare('DELETE FROM keranjang WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM peminjaman WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM user_vouchers WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM log_aktivitas WHERE user_id=?').run(req.params.id);

  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  logActivity(req.user.id, 'Hapus User', `Hapus user ID: ${req.params.id}`);
  res.json({ message: 'Deleted' });
});

// --- STATS ---
router.get('/stats/top-borrowed', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const data = db.prepare(`
    SELECT a.nama_alat, COUNT(p.id) as total_pinjam
    FROM peminjaman p
    JOIN alat a ON p.alat_id = a.id
    GROUP BY a.id
    ORDER BY total_pinjam DESC
    LIMIT 5
  `).all();
  res.json(data);
});

// Menghapus data peminjaman (Batal Pesan - Hanya jika status pending)
router.delete('/peminjaman/:id', authenticateToken, (req: any, res) => {
  const loan = db.prepare('SELECT * FROM peminjaman WHERE id=?').get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Not found' });
  
  // Hanya bisa batal jika status pending
  if (loan.status !== 'pending') {
    return res.status(400).json({ error: 'Hanya pesanan pending yang bisa dibatalkan' });
  }

  // Hanya pemilik atau admin yang bisa batal
  if (loan.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.prepare('DELETE FROM peminjaman WHERE id=?').run(req.params.id);
  logActivity(req.user.id, 'Batal Pesanan', `Membatalkan pesanan ID: ${req.params.id}`);
  res.json({ message: 'Cancelled' });
});

// --- USER PROFILE & SETTINGS ---
router.put('/users/profile', authenticateToken, (req: any, res) => {
  const { nama_lengkap, phone, address, postal_code, state, foto_profil } = req.body;
  try {
    db.prepare('UPDATE users SET nama_lengkap=?, phone=?, address=?, postal_code=?, state=?, foto_profil=? WHERE id=?')
      .run(nama_lengkap, phone, address, postal_code, state, foto_profil || null, req.user.id);
    logActivity(req.user.id, 'Update Profil', 'Memperbarui informasi profil');
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui profil' });
  }
});

// --- USER ADDRESSES ---
router.get('/users/addresses', authenticateToken, (req: any, res) => {
  const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
  res.json(addresses);
});

router.post('/users/addresses', authenticateToken, (req: any, res) => {
  const { nama_penerima, phone, address, postal_code, state, is_default } = req.body;
  
  if (is_default) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }

  const stmt = db.prepare(`
    INSERT INTO user_addresses (user_id, nama_penerima, phone, address, postal_code, state, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(req.user.id, nama_penerima, phone, address, postal_code, state, is_default ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});

router.put('/users/addresses/:id/default', authenticateToken, (req: any, res) => {
  db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Default address updated' });
});

router.delete('/users/addresses/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Address deleted' });
});

router.put('/users/password', authenticateToken, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const bcrypt = require('bcryptjs');
  
  const user: any = db.prepare('SELECT password FROM users WHERE id=?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: 'Password saat ini salah' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password=? WHERE id=?').run(hashedPassword, req.user.id);
  logActivity(req.user.id, 'Update Password', 'Memperbarui password akun');
  res.json({ message: 'Password updated' });
});

// --- VOUCHERS ---
router.get('/vouchers/weekly', (req: any, res) => {
  const now = new Date().toISOString();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  let userId = -1;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      userId = decoded.id;
    } catch (e) {}
  }

  const vouchers = db.prepare(`
    SELECT v.*, 
    (SELECT COUNT(*) FROM user_vouchers uv WHERE uv.voucher_id = v.id AND uv.user_id = ?) as is_claimed
    FROM vouchers v 
    WHERE v.is_weekly = 1 
    AND v.tgl_mulai <= ? 
    AND v.tgl_berakhir >= ?
    AND (v.kuota = -1 OR v.kuota > 0)
  `).all(userId, now, now);
  res.json(vouchers);
});

router.get('/vouchers/my', authenticateToken, (req: any, res) => {
  const now = new Date().toISOString();
  const vouchers = db.prepare(`
    SELECT v.*, uv.id as user_voucher_id, uv.is_used
    FROM user_vouchers uv
    JOIN vouchers v ON uv.voucher_id = v.id
    WHERE uv.user_id = ? 
    AND uv.is_used = 0
    AND v.tgl_mulai <= ? 
    AND v.tgl_berakhir >= ?
  `).all(req.user.id, now, now);
  res.json(vouchers);
});

router.post('/vouchers/claim', authenticateToken, (req: any, res) => {
  const { voucher_id } = req.body;
  
  // Check if already claimed
  const existing = db.prepare('SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_id = ?').get(req.user.id, voucher_id);
  if (existing) return res.status(400).json({ message: 'Voucher sudah diklaim' });

  // Check voucher availability
  const voucher: any = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(voucher_id);
  if (!voucher) return res.status(404).json({ message: 'Voucher tidak ditemukan' });
  
  const now = new Date();
  if (new Date(voucher.tgl_mulai) > now || new Date(voucher.tgl_berakhir) < now) {
    return res.status(400).json({ message: 'Voucher tidak berlaku saat ini' });
  }

  if (voucher.kuota !== -1 && voucher.kuota <= 0) {
    return res.status(400).json({ message: 'Kuota voucher sudah habis' });
  }

  const transaction = db.transaction(() => {
    db.prepare('INSERT INTO user_vouchers (user_id, voucher_id) VALUES (?, ?)').run(req.user.id, voucher_id);
    if (voucher.kuota !== -1) {
      db.prepare('UPDATE vouchers SET kuota = kuota - 1 WHERE id = ?').run(voucher_id);
    }
  });

  try {
    transaction();
    res.json({ message: 'Voucher berhasil diklaim' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
