// Import library yang dibutuhkan untuk server
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import rute API untuk autentikasi dan fungsionalitas aplikasi
import authRoutes from './server/core/auth.ts';
import apiRoutes from './server/core/api.ts';

// Mendapatkan path direktori saat ini (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Fungsi utama untuk menjalankan server Express
 */
async function startServer() {
  const app = express();
  const PORT = 3000; // Port default aplikasi

  // Middleware untuk parsing JSON dan Cookie
  app.use(express.json());
  app.use(cookieParser());

  // Registrasi Rute API
  // /api/auth untuk login, register, logout
  app.use('/api/auth', authRoutes);
  // /api untuk data alat, kategori, peminjaman, dll
  app.use('/api', apiRoutes);

  // Konfigurasi Vite Middleware untuk mode development
  // Ini memungkinkan Hot Module Replacement (HMR) saat coding
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode produksi: melayani file statis dari folder 'dist'
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Menjalankan server pada port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Jalankan server
startServer();
