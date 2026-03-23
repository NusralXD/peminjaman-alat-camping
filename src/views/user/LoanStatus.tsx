import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldCheck, AlertCircle, CheckCircle2, XCircle, ArrowRight, Info } from 'lucide-react';

export default function LoanStatus({ user }: { user: any }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
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
      // Filter only active/pending loans
      setLoans(data.filter((l: any) => l.status !== 'kembali' && l.status !== 'ditolak'));
    } catch (err) {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Menunggu Persetujuan' };
      case 'disetujui':
        return { icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Disetujui' };
      case 'dipinjam':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Sedang Dipinjam' };
      default:
        return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-500/10', label: status };
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase mb-2">Status Peminjaman</h1>
            <p className="text-gray-500">Pantau status perlengkapan camping yang Anda sewa</p>
          </div>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
            <Clock className="w-8 h-8" />
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Belum ada peminjaman aktif</h2>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">Anda belum memiliki pengajuan peminjaman yang sedang diproses atau aktif.</p>
            <Link to="/katalog" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
              Sewa Alat Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {loans.map((loan) => {
                const status = getStatusInfo(loan.status);
                return (
                  <motion.div 
                    key={loan.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedLoan(loan)}
                    className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group cursor-pointer"
                  >
                    <div className="p-8">
                      {loan.gambar_url && (
                        <div className="aspect-video w-full bg-gray-50 rounded-2xl overflow-hidden mb-6 border border-gray-100">
                          <img 
                            src={loan.gambar_url} 
                            alt={loan.nama_alat} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2`}>
                          <status.icon className="w-3 h-3" />
                          <span>{status.label}</span>
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
                          <span className="text-gray-400 font-medium">Batas Kembali</span>
                          <span className="font-bold text-gray-900">{new Date(loan.tgl_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-medium">Jumlah Alat</span>
                          <span className="font-bold text-gray-900">{loan.jumlah_alat} Unit</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Biaya</p>
                          <p className="text-lg font-black text-emerald-600">Rp {loan.total_bayar?.toLocaleString() || '0'}</p>
                        </div>
                        <Link 
                          to="/katalog" 
                          className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLoan(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full ${getStatusInfo(selectedLoan.status).bg} ${getStatusInfo(selectedLoan.status).color} text-[10px] font-bold uppercase tracking-widest mb-4`}>
                      {(() => {
                        const StatusIcon = getStatusInfo(selectedLoan.status).icon;
                        return <StatusIcon className="w-3 h-3" />;
                      })()}
                      <span>{getStatusInfo(selectedLoan.status).label}</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                      Detail Peminjaman
                    </h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">ID: #{selectedLoan.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedLoan(null)}
                    className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedLoan.gambar_url && (
                    <div className="aspect-video w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                      <img 
                        src={selectedLoan.gambar_url} 
                        alt={selectedLoan.nama_alat} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="bg-gray-50 p-6 rounded-3xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Nama Alat</p>
                    <p className="text-xl font-black text-gray-900 uppercase">{selectedLoan.nama_alat}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tgl Pinjam</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedLoan.tgl_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tgl Kembali</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedLoan.tgl_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Jumlah Unit</p>
                      <p className="text-sm font-bold text-gray-900">{selectedLoan.jumlah_alat} Unit</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Bayar</p>
                      <p className="text-sm font-black text-emerald-600">Rp {selectedLoan.total_bayar?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pengiriman</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">{selectedLoan.shipping_method || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pembayaran</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">{selectedLoan.payment_method || '-'}</p>
                    </div>
                  </div>

                  {selectedLoan.shipping_address && (
                    <div className="bg-gray-50 p-6 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Alamat Pengiriman</p>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">{selectedLoan.shipping_address}</p>
                    </div>
                  )}

                  <div className="pt-6">
                    <button 
                      onClick={() => setSelectedLoan(null)}
                      className="w-full bg-gray-900 text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-gray-900/10"
                    >
                      Tutup Detail
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
