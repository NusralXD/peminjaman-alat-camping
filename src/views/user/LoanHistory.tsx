import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { History, CheckCircle2, XCircle, ArrowRight, Star, AlertCircle } from 'lucide-react';

export default function LoanHistory({ user }: { user: any }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/peminjaman');
      const data = await res.json();
      // Filter only finished/rejected loans
      setLoans(data.filter((l: any) => l.status === 'kembali' || l.status === 'ditolak'));
    } catch (err) {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase mb-2">Riwayat Peminjaman</h1>
            <p className="text-gray-500">Daftar perlengkapan camping yang pernah Anda sewa</p>
          </div>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
            <History className="w-8 h-8" />
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Belum ada riwayat peminjaman</h2>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">Anda belum pernah menyelesaikan peminjaman alat camping bersama kami.</p>
            <Link to="/katalog" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
              Mulai Petualangan Pertamamu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {loans.map((loan) => (
                <motion.div 
                  key={loan.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`px-4 py-1.5 rounded-full ${loan.status === 'kembali' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2`}>
                        {loan.status === 'kembali' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{loan.status === 'kembali' ? 'Selesai' : 'Ditolak'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #{loan.id}</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 group-hover:text-emerald-600 transition-colors">{loan.nama_alat}</h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Tanggal Pinjam</span>
                        <span className="font-bold text-gray-900">{new Date(loan.tgl_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Tanggal Kembali</span>
                        <span className="font-bold text-gray-900">{new Date(loan.tgl_realisasi_kembali || loan.tgl_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Jumlah Alat</span>
                        <span className="font-bold text-gray-900">{loan.jumlah_alat} Unit</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Bayar</p>
                        <p className="text-lg font-black text-emerald-600">Rp {loan.total_bayar?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
