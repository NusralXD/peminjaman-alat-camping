import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ClipboardList, 
  History, 
  LogOut,
  Tag,
  FileCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ user, onLogout, isOpen, onClose }: { 
  user: any, 
  onLogout: () => void,
  isOpen?: boolean,
  onClose?: () => void
}) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'petugas'] },
    { name: 'Manajemen User', icon: Users, path: '/dashboard/users', roles: ['admin'] },
    { name: 'Manajemen Alat', icon: Package, path: '/dashboard/alat', roles: ['admin'] },
    { name: 'Manajemen Kategori', icon: Tag, path: '/dashboard/kategori', roles: ['admin'] },
    { name: 'Data Peminjaman', icon: ClipboardList, path: '/dashboard/peminjaman', roles: ['admin', 'petugas'] },
    { name: 'Riwayat Transaksi', icon: ClipboardList, path: '/dashboard/pengembalian', roles: ['admin', 'petugas'] },
    { name: 'Log Aktivitas', icon: History, path: '/dashboard/logs', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  const sidebarContent = (
    <aside className={cn(
      "w-72 h-screen bg-[#0f172a]/80 lg:bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 flex flex-col z-50",
      "fixed lg:sticky top-0 left-0 transition-transform duration-300 lg:translate-x-0",
      !isOpen && "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex items-center justify-between mb-12 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-white/60">Panel</span></span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-white/20 text-white shadow-lg shadow-black/5" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-white/60")} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.nama?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.nama}</p>
            <p className="text-xs text-white/40 capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );

  return sidebarContent;
}
