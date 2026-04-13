import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';

// Import semua halaman (views) aplikasi
import Home from './views/user/Home';
import Login from './views/shared/Login';
import Register from './views/shared/Register';
import Dashboard from './views/admin/Dashboard';
import UserManagement from './views/admin/UserManagement';
import EquipmentManagement from './views/admin/EquipmentManagement';
import CategoryManagement from './views/admin/CategoryManagement';
import LoanManagement from './views/petugas/LoanManagement';
import ReturnManagement from './views/petugas/ReturnManagement';
import ActivityLogs from './views/admin/ActivityLogs';
import Catalog from './views/user/Catalog';
import DetailAlat from './views/user/DetailAlat';
import Cart from './views/user/Cart';
import LoanStatus from './views/user/LoanStatus';
import LoanHistory from './views/user/LoanHistory';
import Checkout from './views/user/Checkout';

// Import komponen UI global
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';

/**
 * Komponen Utama Aplikasi (App)
 * Mengatur routing, state user global, dan layout utama.
 */
export default function App() {
  const [user, setUser] = useState<any>(null); // State untuk menyimpan data user yang sedang login
  const [loading, setLoading] = useState(true); // State loading saat mengecek sesi login
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk sidebar mobile di dashboard

  // Mengecek status login saat aplikasi pertama kali dimuat
  useEffect(() => {
    checkUser();
  }, []);

  /**
   * Fungsi untuk mengambil data profil user dari server (session check)
   */
  const checkUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }
      setUser(null);
      return null;
    } catch (err) {
      console.error('Auth check failed', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk menangani proses logout
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      // Redirect ke halaman login dan hapus riwayat navigasi
      window.location.replace('/login');
    }
  };

  const location = useLocation();

  // Tampilan loading saat inisialisasi aplikasi
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Memuat...</div>;

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          {/* 
            RUTE FRONTEND (Halaman User Biasa) 
            Jika user adalah admin/petugas, mereka akan diarahkan otomatis ke dashboard.
          */}
          <Route path="/" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <Home user={user} />
                <Footer />
              </div>
            )
          } />
          
          {/* Rute Katalog Alat: Menampilkan daftar semua alat camping yang tersedia */}
          <Route path="/katalog" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <Catalog user={user} />
                <Footer />
              </div>
            )
          } />

          {/* Rute Detail Alat: Menampilkan informasi lengkap satu alat tertentu */}
          <Route path="/alat/:id" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <DetailAlat user={user} />
                <Footer />
              </div>
            )
          } />

          {/* Rute Keranjang Belanja: Daftar alat yang siap untuk disewa */}
          <Route path="/keranjang" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <Cart user={user} />
                <Footer />
              </div>
            )
          } />

          {/* Rute Status Peminjaman Aktif: Menampilkan status pesanan yang sedang berjalan */}
          <Route path="/status-peminjaman" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <LoanStatus user={user} />
                <Footer />
              </div>
            )
          } />

          {/* Rute Riwayat Peminjaman Selesai: Menampilkan daftar transaksi yang sudah selesai */}
          <Route path="/riwayat-peminjaman" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <LoanHistory user={user} />
                <Footer />
              </div>
            )
          } />

          {/* Rute Checkout Pesanan: Proses finalisasi penyewaan alat */}
          <Route path="/checkout" element={
            user && (user.role === 'admin' || user.role === 'petugas') ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Header user={user} onLogout={handleLogout} />
                <Checkout user={user} />
                <Footer />
              </div>
            )
          } />
        
        {/* Rute Login & Register */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={checkUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* 
          RUTE DASHBOARD (Admin & Petugas) 
          Menggunakan tema Glassmorphism (transparan & blur).
        */}
        <Route path="/dashboard/*" element={
          !user || (user.role !== 'admin' && user.role !== 'petugas') ? (
            <Navigate to="/login" />
          ) : (
            <div className="flex min-h-screen bg-[#0f172a] overflow-hidden relative">
              {/* Efek Cahaya Latar Belakang (Blobs) */}
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
              
              {/* Sidebar Navigasi Dashboard */}
              <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
              />
              
              {/* Overlay saat sidebar mobile terbuka */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              <main className="flex-1 h-screen overflow-y-auto relative z-10">
                {/* Header khusus tampilan mobile di dashboard */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-30">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Menu className="text-white w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Admin<span className="text-white/60">Panel</span></span>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                {/* Konten Utama Dashboard berdasarkan Sub-Rute */}
                <div className="p-4 md:p-8">
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/users" element={<UserManagement user={user} />} />
                    <Route path="/alat" element={<EquipmentManagement user={user} />} />
                    <Route path="/kategori" element={<CategoryManagement user={user} />} />
                    <Route path="/peminjaman" element={user.role === 'petugas' ? <LoanManagement user={user} /> : <Navigate to="/dashboard" />} />
                    <Route path="/pengembalian" element={<ReturnManagement user={user} />} />
                  </Routes>
                </div>
              </main>
            </div>
          )
        } />
      </Routes>
    </div>
  </AnimatePresence>
);
}
