import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.ts';
import { logActivity as fileLog } from './logger.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Middleware untuk memverifikasi token JWT dari cookie.
 * Berfungsi untuk memastikan pengguna sudah login sebelum mengakses fitur tertentu.
 */
export const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user; // Menyimpan data user yang terdekripsi ke objek request
    next();
  });
};

/**
 * Middleware untuk otorisasi berdasarkan role (admin, petugas, peminjam).
 * Membatasi akses halaman/API hanya untuk role tertentu.
 */
export const authorizeRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

/**
 * Fungsi Helper untuk mencatat aktivitas.
 * Sekarang menggunakan sistem log berbasis file (logger.ts) tanpa database.
 */
export const logActivity = (userId: number | string | null, aktivitas: string, keterangan: string = '') => {
  try {
    // Mencatat ke file activity.log melalui logger.ts
    fileLog(userId ? userId.toString() : 'System', aktivitas, keterangan);
  } catch (err) {
    console.error('Logging error:', err);
  }
};

/**
 * Endpoint Login: Memverifikasi username & password, lalu memberikan token JWT.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, nama: user.nama_lengkap }, JWT_SECRET, { expiresIn: '1d' });
    
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    
    logActivity(user.id, 'Login', `User ${username} logged in`);
    
    res.json({ user: { id: user.id, username: user.username, role: user.role, nama: user.nama_lengkap } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { 
    username,
    password, 
    nama_lengkap,
    phone, 
    email,
    foto_profil
  } = req.body;

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) return res.status(400).json({ message: 'Username atau Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (
        username, password, nama_lengkap, role, 
        phone, email, foto_profil
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      username, hashedPassword, nama_lengkap, 'peminjam',
      phone, email, foto_profil || null
    );

    logActivity(result.lastInsertRowid as number, 'Register', `User ${username} terdaftar`);

    res.json({ message: 'Registrasi berhasil', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Gagal melakukan registrasi' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none', 
    expires: new Date(0),
    path: '/' 
  });
  res.json({ message: 'Logged out' });
});

router.get('/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, username, nama_lengkap, role, first_name, last_name, phone, email, address, postal_code, state, foto_profil FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// Initial seed route (for dev only)
router.post('/seed', async (req, res) => {
  const adminPass = await bcrypt.hash('admin123', 10);
  const petugasPass = await bcrypt.hash('petugas123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  try {
    db.prepare('INSERT OR IGNORE INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)').run('admin', adminPass, 'Administrator', 'admin');
    db.prepare('INSERT OR IGNORE INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)').run('petugas', petugasPass, 'Petugas Lapangan', 'petugas');
    db.prepare('INSERT OR IGNORE INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)').run('user', userPass, 'Peminjam Setia', 'peminjam');
    
    // Seed some categories
    const categories = ['Tenda', 'Carrier', 'Cooking Set', 'Sleeping Bag', 'Lampu & Listrik', 'Aksesoris'];
    const insertCat = db.prepare('INSERT OR IGNORE INTO kategori (nama_kategori) VALUES (?)');
    categories.forEach(cat => insertCat.run(cat));

    // Seed 60 equipment items (10 per category)
    const insertAlat = db.prepare('INSERT INTO alat (nama_alat, kategori_id, harga_per_hari, stok, gambar_url, deskripsi) VALUES (?, ?, ?, ?, ?, ?)');
    
    const equipmentData = [
      { prefix: 'Tenda', basePrice: 40000, img: 'tent' },
      { prefix: 'Carrier', basePrice: 25000, img: 'backpack' },
      { prefix: 'Cooking Set', basePrice: 10000, img: 'cook' },
      { prefix: 'Sleeping Bag', basePrice: 15000, img: 'sleep' },
      { prefix: 'Lampu', basePrice: 5000, img: 'light' },
      { prefix: 'Aksesoris', basePrice: 5000, img: 'gear' }
    ];

    equipmentData.forEach((type, catIdx) => {
      for (let i = 1; i <= 10; i++) {
        const name = `${type.prefix} ${i > 5 ? 'Pro' : 'Lite'} v${i}`;
        const price = type.basePrice + (Math.floor(Math.random() * 10) * 5000);
        const stock = Math.floor(Math.random() * 15) + 2;
        const desc = `Perlengkapan ${type.prefix} berkualitas tinggi untuk petualangan seri ke-${i}. Sangat tahan lama dan nyaman digunakan.`;
        const imgUrl = `https://picsum.photos/seed/${type.img}${i}/400/300`;
        
        insertAlat.run(name, catIdx + 1, price, stock, imgUrl, desc);
      }
    });

    res.json({ message: 'Seeding successful' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed', error: err });
  }
});

export default router;
