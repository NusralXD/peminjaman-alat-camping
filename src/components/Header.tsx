import { useState, useEffect } from 'react';
import { 
  Tent, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard,
  ShoppingCart,
  Clock,
  History,
  Backpack,
  CookingPot,
  BedDouble,
  Lightbulb,
  Sun,
  Moon,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const categories = [
    { name: 'Tenda', icon: Tent },
    { name: 'Carrier', icon: Backpack },
    { name: 'Cooking Set', icon: CookingPot },
    { name: 'Sleeping Bag', icon: BedDouble },
    { name: 'Lampu', icon: Lightbulb },
  ];

  const isAdminOrPetugas = user?.role === 'admin' || user?.role === 'petugas';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Side: Nav Links */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex items-center space-x-6 text-[11px] font-bold tracking-widest text-gray-900 dark:text-gray-100 uppercase">
              <Link to="/status-peminjaman" className="hover:text-emerald-600 transition-colors flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Status Peminjaman</span>
              </Link>
              <Link to="/keranjang" className="hover:text-emerald-600 transition-colors flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Keranjang</span>
              </Link>
              <Link to="/riwayat-peminjaman" className="hover:text-emerald-600 transition-colors flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Riwayat Peminjaman</span>
              </Link>
            </nav>
            {/* Mobile Nav Icons */}
            <div className="flex lg:hidden items-center space-x-4">
              <Link to="/status-peminjaman" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600"><Clock className="w-5 h-5" /></Link>
              <Link to="/keranjang" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600"><ShoppingCart className="w-5 h-5" /></Link>
              <Link to="/riwayat-peminjaman" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600"><History className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Tent className="text-white dark:text-black w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">PONDOK <span className="text-emerald-600">RENT</span></span>
            </div>
            <span className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-0.5 text-center">Camping & Outdoor Equipment Rental</span>
          </Link>

          {/* Right Side: Search & User */}
          <div className="flex items-center space-x-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search');
                if (query) navigate(`/katalog?search=${query}`);
              }}
              className="relative hidden md:block"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                name="search"
                type="text" 
                placeholder="Cari Disini..." 
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-emerald-500 w-48 transition-all focus:w-64 outline-none"
              />
            </form>
            
            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block" />
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdminOrPetugas && (
                  <Link 
                    to="/dashboard" 
                    className="hidden md:flex items-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-gray-900/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Manage Dashboard</span>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs overflow-hidden">
                      {user.foto_profil ? (
                        <img src={user.foto_profil} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.nama_lengkap?.[0] || user.username?.[0] || 'U'
                      )}
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-3 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-700 mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Profil Saya</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.nama_lengkap || user.username}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.phone || 'No Phone'}</p>
                    </div>

                    <div className="px-2 space-y-1">
                      <Link 
                        to="/pengaturan-akun"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group/settings"
                      >
                        <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Pengelola Akun</span>
                      </Link>
                      <button 
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group/logout"
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Keluar Aplikasi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Removed as requested */}
        </div>
      </div>

      {/* Mobile Menu - Removed as requested */}
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-[40px] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Konfirmasi Keluar</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Apakah Anda yakin untuk keluar dari aplikasi?</p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  Ya, Keluar
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
