import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, CheckCircle, XCircle, RefreshCcw, Search, Calendar, User as UserIcon, Package, AlertCircle, MapPin, X, Printer, FileText, Table } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../../core/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function LoanManagement({ user }: { user: any }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.getLoans();
      setLoans(data);
    } catch (err) {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await api.updateLoanStatus(id, status);
      if (res.ok) {
        fetchLoans();
      }
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const handleReturn = async (id: number) => {
    const tgl_realisasi_kembali = new Date().toISOString().split('T')[0];
    try {
      const res = await api.processReturn(id, { tgl_realisasi_kembali });
      if (res.ok) {
        const result = await res.json();
        alert(`Pengembalian berhasil!\nTotal Bayar: Rp ${result.total.toLocaleString()}\nDenda: Rp ${result.denda.toLocaleString()}`);
        fetchLoans();
      }
    } catch (err) {
      alert('Gagal proses pengembalian');
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesFilter = filter === 'all' || loan.status === filter;
    const matchesSearch = loan.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         loan.nama_alat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["No", "Peminjam", "Alat", "Tgl Pinjam", "Tgl Kembali", "Status", "Total Bayar", "Denda"];
    const tableRows: any[] = [];

    filteredLoans.forEach((loan, index) => {
      const loanData = [
        index + 1,
        loan.peminjam,
        loan.nama_alat,
        format(new Date(loan.tgl_pinjam), 'dd/MM/yyyy'),
        format(new Date(loan.tgl_kembali), 'dd/MM/yyyy'),
        loan.status.toUpperCase(),
        `Rp ${loan.total_bayar.toLocaleString()}`,
        `Rp ${loan.denda.toLocaleString()}`
      ];
      tableRows.push(loanData);
    });

    doc.text("Laporan Peminjaman Alat Camping", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);
    doc.text(`Filter: ${filter.toUpperCase()}`, 14, 27);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] } // Emerald-500
    });

    doc.save(`Laporan_Peminjaman_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    setShowPrintModal(false);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLoans.map((loan, index) => ({
      No: index + 1,
      Peminjam: loan.peminjam,
      Alat: loan.nama_alat,
      'Tanggal Pinjam': format(new Date(loan.tgl_pinjam), 'yyyy-MM-dd'),
      'Tanggal Kembali': format(new Date(loan.tgl_kembali), 'yyyy-MM-dd'),
      Status: loan.status,
      'Total Bayar': loan.total_bayar,
      Denda: loan.denda,
      Alamat: loan.shipping_address || '-',
      Kurir: loan.shipping_method || '-',
      Pembayaran: loan.payment_method || '-',
      Cabang: loan.store_branch || '-'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Peminjaman");
    XLSX.writeFile(workbook, `Laporan_Peminjaman_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    setShowPrintModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'disetujui': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'dikirim': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'diterima': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'kembali': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ditolak': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'disetujui': return 'Disetujui';
      case 'dikirim': return 'Dikirim';
      case 'diterima': return 'Diterima';
      case 'kembali': return 'Success';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Data Peminjaman</h1>
          <p className="text-white/60 text-lg">Kelola pengajuan dan pengembalian alat camping</p>
        </div>
        <div className="flex items-center space-x-4">
          {user?.role === 'petugas' && (
            <button 
              onClick={() => setShowPrintModal(true)}
              className="flex items-center space-x-3 px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10 shadow-lg backdrop-blur-md group"
            >
              <Printer className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Cetak Laporan</span>
            </button>
          )}
          <button 
            onClick={fetchLoans}
            className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all border border-white/10 shadow-lg backdrop-blur-md group"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
          </button>
        </div>
      </header>

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
              className="relative w-full max-w-2xl bg-[#1e293b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Detail Peminjaman</h2>
                  <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">ID: #{selectedLoan.id}</p>
                </div>
                <button onClick={() => setSelectedLoan(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="aspect-video w-full bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                    {selectedLoan.gambar_url ? (
                      <img 
                        src={selectedLoan.gambar_url} 
                        alt={selectedLoan.nama_alat} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-white/10" />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Status Saat Ini</p>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(selectedLoan.status)}`}>
                      {getStatusLabel(selectedLoan.status)}
                    </span>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Alamat Pengiriman</p>
                    <p className="text-white text-sm leading-relaxed">{selectedLoan.shipping_address || 'Ambil di Toko'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Peminjam</p>
                      <p className="text-white font-bold">{selectedLoan.peminjam}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Nama Alat</p>
                      <p className="text-white font-bold">{selectedLoan.nama_alat}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Deskripsi Alat</p>
                      <p className="text-white/60 text-xs leading-relaxed">{selectedLoan.deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Tgl Pinjam</p>
                      <p className="text-white text-sm font-bold">{format(new Date(selectedLoan.tgl_pinjam), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Tgl Kembali</p>
                      <p className="text-white text-sm font-bold">{format(new Date(selectedLoan.tgl_kembali), 'dd MMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Jumlah</p>
                      <p className="text-white text-sm font-bold">{selectedLoan.jumlah_alat} Unit</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Lama Sewa</p>
                      <p className="text-white text-sm font-bold">{selectedLoan.jumlah_hari || 1} Hari</p>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                        <p className="text-2xl font-black text-emerald-400">Rp {selectedLoan.total_bayar.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Metode</p>
                        <p className="text-white text-[10px] font-bold uppercase">{selectedLoan.payment_method || 'Cash'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end space-x-4">
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="px-8 py-4 rounded-2xl font-bold text-white/60 hover:bg-white/5 transition-all"
                >
                  Tutup
                </button>
                {selectedLoan.status === 'disetujui' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedLoan.id, 'dikirim');
                      setSelectedLoan(null);
                    }}
                    className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Kirim Alat Sekarang
                  </button>
                )}
                {selectedLoan.status === 'diterima' && (
                  <button 
                    onClick={() => {
                      handleReturn(selectedLoan.id);
                      setSelectedLoan(null);
                    }}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Proses Pengembalian
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-wrap gap-4">
          {['all', 'pending', 'disetujui', 'dikirim', 'diterima', 'kembali', 'ditolak'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                filter === f 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari peminjam..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Peminjam & Alat</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Biaya & Denda</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredLoans.map((loan) => (
                  <motion.tr 
                    key={loan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedLoan(loan)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 overflow-hidden">
                          {loan.gambar_url ? (
                            <img 
                              src={loan.gambar_url} 
                              alt={loan.nama_alat} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Package className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold">{loan.nama_alat}</p>
                          <p className="text-white/40 text-xs flex items-center space-x-1 mt-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{loan.peminjam}</span>
                          </p>
                          {loan.shipping_address && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-blue-400/60 text-[10px] flex items-center space-x-1 italic">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[150px]">{loan.shipping_address}</span>
                              </p>
                              <p className="text-emerald-400/60 text-[9px] font-bold uppercase tracking-widest">
                                {loan.shipping_method} • {loan.payment_method}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-white/80 text-sm flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>{format(new Date(loan.tgl_pinjam), 'dd MMM yyyy')}</span>
                        </p>
                        <p className="text-white/40 text-xs flex items-center space-x-2">
                          <RefreshCcw className="w-3 h-3" />
                          <span>{format(new Date(loan.tgl_kembali), 'dd MMM yyyy')}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(loan.status)}`}>
                        {getStatusLabel(loan.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-white font-bold text-sm">Rp {loan.total_bayar.toLocaleString()}</p>
                        {loan.denda > 0 && (
                          <p className="text-red-400 text-[10px] font-bold flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Denda: Rp {loan.denda.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {loan.status === 'pending' && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateStatus(loan.id, 'disetujui'); }}
                              className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                              title="Setujui"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateStatus(loan.id, 'ditolak'); }}
                              className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                              title="Tolak"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {loan.status === 'disetujui' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateStatus(loan.id, 'dikirim'); }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
                          >
                            Kirim Alat
                          </button>
                        )}
                        {loan.status === 'diterima' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReturn(loan.id); }}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                          >
                            Proses Kembali
                          </button>
                        )}
                        {loan.status === 'kembali' && (
                          <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Success</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredLoans.length === 0 && (
          <div className="p-20 text-center">
            <ClipboardList className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">Tidak ada data peminjaman ditemukan</p>
          </div>
        )}
      </div>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1e293b] rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <Printer className="text-emerald-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cetak Laporan</h3>
                    <p className="text-sm text-white/40">Pilih format laporan</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={exportToPDF}
                  className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Export PDF</p>
                      <p className="text-xs text-white/40">Format dokumen resmi</p>
                    </div>
                  </div>
                  <Printer className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={exportToExcel}
                  className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Table className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Export Excel</p>
                      <p className="text-xs text-white/40">Format data spreadsheet</p>
                    </div>
                  </div>
                  <Printer className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-white/20">
                Laporan akan mencakup data sesuai filter yang aktif saat ini.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
