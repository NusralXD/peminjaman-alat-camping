import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Home from './views/user/Home';
import Login from './views/shared/Login';
import Register from './views/shared/Register';
import Dashboard from './views/admin/Dashboard';
import UserManagement from './views/admin/UserManagement';
import EquipmentManagement from './views/admin/EquipmentManagement';
import LoanManagement from './views/petugas/LoanManagement';
import ActivityLogs from './views/admin/ActivityLogs';
import Catalog from './views/user/Catalog';
import DetailAlat from './views/user/DetailAlat';
import Cart from './views/user/Cart';
import LoanStatus from './views/user/LoanStatus';
import LoanHistory from './views/user/LoanHistory';
import Checkout from './views/user/Checkout';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

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

  const handleLogout = async () => {
    try {
      // Don't set global loading to true here to avoid "stuck" feeling
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      // Use replace to avoid back button issues and force a clean state
      window.location.replace('/login');
    }
  };

  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Memuat...</div>;

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          {/* Frontend Routes */}
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <Home user={user} />
            <Footer />
          </div>
        } />
        
        <Route path="/katalog" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <Catalog user={user} />
            <Footer />
          </div>
        } />

        <Route path="/alat/:id" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <DetailAlat user={user} />
            <Footer />
          </div>
        } />

        <Route path="/keranjang" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <Cart user={user} />
            <Footer />
          </div>
        } />

        <Route path="/status-peminjaman" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <LoanStatus user={user} />
            <Footer />
          </div>
        } />

        <Route path="/riwayat-peminjaman" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <LoanHistory user={user} />
            <Footer />
          </div>
        } />

        <Route path="/checkout" element={
          <div className="min-h-screen bg-white">
            <Header user={user} onLogout={handleLogout} />
            <Checkout user={user} />
            <Footer />
          </div>
        } />
        
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={checkUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Dashboard Routes (Glassmorphism) */}
        <Route path="/dashboard/*" element={
          !user || (user.role !== 'admin' && user.role !== 'petugas') ? (
            <Navigate to="/login" />
          ) : (
            <div className="flex min-h-screen bg-[#0f172a] overflow-hidden relative">
              {/* Background blobs for glassmorphism */}
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
              
              {/* Sidebar with mobile support */}
              <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
              />
              
              {/* Overlay for mobile sidebar */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              <main className="flex-1 h-screen overflow-y-auto relative z-10">
                {/* Mobile Header for Dashboard */}
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

                <div className="p-4 md:p-8">
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/users" element={<UserManagement user={user} />} />
                    <Route path="/alat" element={<EquipmentManagement user={user} />} />
                    <Route path="/peminjaman" element={<LoanManagement user={user} />} />
                    <Route path="/logs" element={<ActivityLogs user={user} />} />
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
