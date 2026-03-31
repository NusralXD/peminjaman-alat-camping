import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Users, ClipboardList, TrendingUp, History, ExternalLink, PieChart as PieChartIcon, BarChart as BarChartIcon, Star } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import StatCard from '../../components/StatCard';
import { api } from '../../core/api';

export default function Dashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({
    totalAlat: 0,
    totalUsers: 0,
    peminjamanAktif: 0,
    totalPendapatan: 0,
    monthlyTarget: 100, // Default target
    monthlyAchievement: 0,
    toolStatus: {
      available: 0,
      loaned: 0,
      maintenance: 0
    }
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topBorrowed, setTopBorrowed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [alat, users, pinjam, logs, top] = await Promise.all([
        api.getAlat(),
        api.getUsers(),
        api.getLoans(),
        api.getLogs(),
        api.getTopBorrowed()
      ]);

      const aktif = pinjam.filter((p: any) => p.status === 'disetujui' || p.status === 'dipinjam').length;
      const pendapatan = pinjam.reduce((acc: number, p: any) => acc + (p.total_bayar || 0), 0);

      // Calculate monthly achievement
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const loansThisMonth = pinjam.filter((p: any) => new Date(p.tgl_pinjam) >= firstDayOfMonth).length;
      const achievement = Math.min(100, Math.round((loansThisMonth / stats.monthlyTarget) * 100));

      // Calculate tool status
      const totalStok = alat.reduce((acc: number, a: any) => acc + a.stok, 0);
      const currentlyLoaned = pinjam.filter((p: any) => p.status === 'dipinjam').reduce((acc: number, p: any) => acc + p.jumlah_alat, 0);
      const available = totalStok; // stok in db is already "available" stock
      
      // Category Distribution
      const categories: any = {};
      alat.forEach((a: any) => {
        categories[a.nama_kategori] = (categories[a.nama_kategori] || 0) + 1;
      });
      const catData = Object.keys(categories).map(name => ({ name, value: categories[name] }));

      // Monthly Revenue Trend (Last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthLoans = pinjam.filter((p: any) => {
          const pDate = new Date(p.tgl_pinjam);
          return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
        });
        const monthRevenue = monthLoans.reduce((acc: number, p: any) => acc + (p.total_bayar || 0), 0);
        monthlyTrend.push({ name: monthName, revenue: monthRevenue });
      }

      setStats({
        totalAlat: alat.length,
        totalUsers: users.length,
        peminjamanAktif: aktif,
        totalPendapatan: pendapatan,
        monthlyTarget: 100,
        monthlyAchievement: achievement,
        toolStatus: {
          available: available,
          loaned: currentlyLoaned,
          maintenance: Math.floor(alat.length * 0.05) // Mock maintenance as 5% of types
        }
      });
      setRecentLogs(logs.slice(0, 5));
      setChartData(monthlyTrend);
      setCategoryData(catData);
      setTopBorrowed(top);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white/40">Memuat Dashboard...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-white/60 text-base md:text-lg">Selamat datang kembali, <span className="text-white font-semibold">{user.nama}</span> 👋</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl w-full md:w-auto justify-center md:justify-start">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Sistem Aktif</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Alat" 
          value={stats.totalAlat} 
          icon={Package} 
          trend="+12% bulan ini"
          color="emerald" 
        />
        <StatCard 
          title="Total User" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="+5% bulan ini"
          color="blue" 
        />
        <StatCard 
          title="Peminjaman Aktif" 
          value={stats.peminjamanAktif} 
          icon={ClipboardList} 
          trend="-2% bulan ini"
          color="orange" 
        />
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${stats.totalPendapatan.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+24% bulan ini"
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <History className="w-6 h-6 text-emerald-400" />
              <span>Log Aktivitas Terkini</span>
            </h2>
            <button className="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors">Lihat Semua</button>
          </div>

          <div className="space-y-4 relative z-10">
            {recentLogs.map((log, idx) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    {log.aktivitas.includes('Login') ? <Users className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{log.aktivitas}</p>
                    <p className="text-white/40 text-xs mt-0.5">{log.keterangan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs font-medium">{new Date(log.created_at).toLocaleTimeString()}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{new Date(log.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats / Info */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 rounded-[40px] shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all" />
            <h3 className="text-white text-xl font-bold mb-6 relative z-10">Target Bulanan</h3>
            <div className="flex items-end justify-between mb-4 relative z-10">
              <span className="text-white/80 text-sm font-medium">Pencapaian</span>
              <span className="text-white text-3xl font-bold">{stats.monthlyAchievement}%</span>
            </div>
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-6 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.monthlyAchievement}%` }}
                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed relative z-10">
              {stats.monthlyAchievement >= 100 
                ? 'Luar biasa! Target bulan ini telah tercapai. Pertahankan performa ini!' 
                : 'Kamu hampir mencapai target peminjaman bulan ini. Terus tingkatkan pelayanan!'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px]">
            <h3 className="text-white text-xl font-bold mb-6">Status Alat</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-white/80 text-sm font-medium">Tersedia</span>
                </div>
                <span className="text-white font-bold">{stats.toolStatus.available} Unit</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-white/80 text-sm font-medium">Dipinjam</span>
                </div>
                <span className="text-white font-bold">{stats.toolStatus.loaned} Unit</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-white/80 text-sm font-medium">Maintenance</span>
                </div>
                <span className="text-white font-bold">{stats.toolStatus.maintenance} Unit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <BarChartIcon className="w-6 h-6 text-blue-400" />
              <span>Tren Pendapatan</span>
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `Rp ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <PieChartIcon className="w-6 h-6 text-purple-400" />
              <span>Distribusi Kategori</span>
            </h2>
          </div>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-white/60 text-sm">{entry.name}</span>
                  </div>
                  <span className="text-white font-bold text-sm">{entry.value} Alat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Top Borrowed Items */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-2xl">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Alat Terpopuler</h3>
                <p className="text-white/40 text-sm">Paling sering dipinjam</p>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBorrowed} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="nama_alat" 
                  type="category" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="total_pinjam" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
