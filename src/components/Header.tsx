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
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: 'Tenda', icon: Tent },
    { name: 'Carrier', icon: Backpack },
    { name: 'Cooking Set', icon: CookingPot },
    { name: 'Sleeping Bag', icon: BedDouble },
    { name: 'Lampu', icon: Lightbulb },
  ];

  const isAdminOrPetugas = user?.role === 'admin' || user?.role === 'petugas';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Side: Nav Links */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex items-center space-x-6 text-[11px] font-bold tracking-widest text-gray-900 uppercase">
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
              <Link to="/status-peminjaman" className="text-gray-600 hover:text-emerald-600"><Clock className="w-5 h-5" /></Link>
              <Link to="/keranjang" className="text-gray-600 hover:text-emerald-600"><ShoppingCart className="w-5 h-5" /></Link>
              <Link to="/riwayat-peminjaman" className="text-gray-600 hover:text-emerald-600"><History className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Tent className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900">PONDOK <span className="text-emerald-600">RENT</span></span>
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
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 w-48 transition-all focus:w-64 outline-none"
              />
            </form>
            
            <div className="h-6 w-[1px] bg-gray-200 hidden md:block" />
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdminOrPetugas && (
                  <Link 
                    to="/dashboard" 
                    className="hidden md:flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-gray-900/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Manage Dashboard</span>
                  </Link>
                )}
                <div className="flex items-center space-x-2 group cursor-pointer relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {user.nama?.[0] || 'U'}
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Halo,</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.nama}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
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
    </header>
  );
}
