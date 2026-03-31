import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, Search, User, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../../core/api';

/**
 * Komponen Log Aktivitas (Admin)
 * Menampilkan riwayat aktivitas yang dilakukan oleh pengguna di dalam sistem.
 */
export default function ActivityLogs({ user }: { user: any }) {
  const [logs, setLogs] = useState<any[]>([]); // Daftar semua log aktivitas
  const [loading, setLoading] = useState(true); // Status loading data
  const [searchTerm, setSearchTerm] = useState(''); // Filter pencarian log

  // Mengambil data log saat komponen dimuat
  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * Fungsi untuk mengambil data log dari API
   */
  const fetchLogs = async () => {
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Filter log berdasarkan username, jenis aktivitas, atau keterangan
  const filteredLogs = logs.filter(log => 
    log.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Log Aktivitas</h1>
        <p className="text-white/60 text-lg">Pantau seluruh aktivitas sistem dan pengguna</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input 
          type="text" 
          placeholder="Cari aktivitas atau user..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="p-8 space-y-4">
          {filteredLogs.map((log, idx) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {log.aktivitas}
                    </span>
                    <span className="text-white font-bold">{log.username || 'System'}</span>
                  </div>
                  <p className="text-white/60 text-sm flex items-center space-x-2">
                    <Info className="w-4 h-4 text-white/20" />
                    <span>{log.keterangan}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium flex items-center justify-end space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                </p>
                <p className="text-white/20 text-xs mt-1">{format(new Date(log.created_at), 'dd MMMM yyyy')}</p>
              </div>
            </motion.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <History className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-medium">Tidak ada log aktivitas ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
