import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Logger System (File-Based)
 * Sistem log ini berfungsi untuk mencatat aktivitas aplikasi ke dalam file teks (.log)
 * tanpa perlu menyimpan ke database SQLite/MySQL.
 */

const LOG_FILE = path.join(__dirname, '../../activity.log');

export const logActivity = (user: string, action: string, details: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] User: ${user} | Action: ${action} | Details: ${details}\n`;

  // Menambahkan log ke file activity.log (Append mode)
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Gagal menulis log ke file:', err);
    }
  });

  // Juga tampilkan di console server untuk debugging
  console.log(`LOG: ${logEntry.trim()}`);
};

/**
 * Fungsi untuk mengambil semua log dari file activity.log
 * Membaca file teks dan mengubahnya menjadi array object JSON.
 */
export const getLogs = () => {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = data.trim().split('\n');
    
    // Memproses setiap baris log menjadi object
    return lines.map((line, index) => {
      // Regex untuk memisahkan bagian log: [timestamp] User: name | Action: act | Details: det
      const match = line.match(/\[(.*?)\] User: (.*?) \| Action: (.*?) \| Details: (.*)/);
      if (match) {
        return {
          id: index + 1,
          created_at: match[1],
          username: match[2],
          aktivitas: match[3],
          keterangan: match[4]
        };
      }
      return { id: index + 1, aktivitas: 'Log Error', keterangan: line };
    }).reverse(); // Urutkan dari yang terbaru
  } catch (err) {
    console.error('Gagal membaca log dari file:', err);
    return [];
  }
};
