import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  User as UserIcon, 
  Package, 
  Printer, 
  FileText, 
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../../core/api';

export default function ReturnManagement({ user }: { user: any }) {
  const [returns, setReturns] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansData, categoriesData] = await Promise.all([
        api.getLoans(),
        fetch('/api/kategori').then(res => res.json())
      ]);
      // Show all loans for consolidated view
      setReturns(loansData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(item => {
    const matchesSearch = item.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || item.tgl_pinjam === dateFilter || item.tgl_kembali === dateFilter || item.tgl_realisasi_kembali === dateFilter;
    const matchesCategory = !categoryFilter || item.nama_kategori === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesDate && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const currentData = filteredReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      case 'kembali': return 'Selesai';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Tent_Icon.svg/1024px-Tent_Icon.svg.png';

    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">No</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Peminjam</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Alat</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Tgl Pinjam</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Tgl Kembali</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Status</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Total Bayar</th>
            <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Denda</th>
          </tr>
        </thead>
        <tbody>
    `;

    filteredReturns.forEach((item, index) => {
      tableHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px; font-size: 11px;">${index + 1}</td>
          <td style="padding: 12px; font-size: 11px;">${item.peminjam}</td>
          <td style="padding: 12px; font-size: 11px;">${item.nama_alat}</td>
          <td style="padding: 12px; font-size: 11px;">${format(new Date(item.tgl_pinjam), 'dd/MM/yyyy')}</td>
          <td style="padding: 12px; font-size: 11px;">${format(new Date(item.tgl_realisasi_kembali || item.tgl_kembali), 'dd/MM/yyyy')}</td>
          <td style="padding: 12px; font-size: 11px;">${getStatusLabel(item.status)}</td>
          <td style="padding: 12px; font-size: 11px;">Rp ${item.total_bayar.toLocaleString()}</td>
          <td style="padding: 12px; font-size: 11px;">Rp ${item.denda.toLocaleString()}</td>
        </tr>
      `;
      
      if ((index + 1) % 25 === 0 && index + 1 < filteredReturns.length) {
        tableHtml += `
            </tbody>
          </table>
          <div style="page-break-after: always;"></div>
          <div style="position: relative; text-align: center; margin-bottom: 40px;">
            <img src="${logoUrl}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 300px; z-index: -1;" />
            <h1 style="margin: 0; font-size: 24px;">Laporan Riwayat Transaksi</h1>
            <p style="margin: 5px 0; color: #64748b;">Halaman ${Math.ceil((index + 1) / 25) + 1}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">No</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Peminjam</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Alat</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Tgl Pinjam</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Tgl Kembali</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Status</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Total Bayar</th>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Denda</th>
              </tr>
            </thead>
            <tbody>
        `;
      }
    });

    tableHtml += `</tbody></table>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Riwayat Transaksi</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="position: relative; text-align: center; margin-bottom: 40px;">
            <img src="${logoUrl}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 300px; z-index: -1;" />
            <h1 style="margin: 0; font-size: 24px;">Laporan Riwayat Transaksi</h1>
            <p style="margin: 5px 0; color: #64748b;">Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm')}</p>
            <p style="margin: 5px 0; color: #64748b; font-size: 12px;">Petugas: ${user.nama_lengkap}</p>
          </div>
          ${tableHtml}
          <div style="margin-top: 60px; text-align: right; padding-right: 40px;">
            <p style="margin-bottom: 60px;">Mengetahui,</p>
            <p style="font-weight: bold; text-decoration: underline;">${user.nama_lengkap}</p>
            <p style="font-size: 12px; color: #64748b;">Petugas Operasional</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 uppercase">Riwayat Transaksi</h1>
          <p className="text-white/60 text-lg">Semua data peminjaman dan pengembalian alat camping</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center space-x-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 group"
        >
          <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Cetak Laporan</span>
        </button>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari peminjam atau alat..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value="" className="bg-gray-900">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.nama_kategori} className="bg-gray-900">{c.nama_kategori}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value="" className="bg-gray-900">Semua Status</option>
            <option value="pending" className="bg-gray-900">Menunggu</option>
            <option value="disetujui" className="bg-gray-900">Disetujui</option>
            <option value="dikirim" className="bg-gray-900">Dikirim</option>
            <option value="diterima" className="bg-gray-900">Diterima</option>
            <option value="kembali" className="bg-gray-900">Selesai</option>
            <option value="ditolak" className="bg-gray-900">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Peminjam & Alat</th>
                <th className="px-8 py-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Tanggal</th>
                <th className="px-8 py-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Biaya & Denda</th>
                <th className="px-8 py-6 text-white/40 text-[10px] font-bold uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-white/20">Memuat data...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-white/20">Tidak ada data transaksi</td></tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{item.nama_alat}</p>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{item.peminjam}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-white/80 text-xs">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>Pinjam: {format(new Date(item.tgl_pinjam), 'dd MMM yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/40 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          <span>Kembali: {format(new Date(item.tgl_realisasi_kembali || item.tgl_kembali), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-0.5">
                        <p className="text-white font-bold text-sm">Rp {item.total_bayar.toLocaleString()}</p>
                        {item.denda > 0 && (
                          <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Denda: Rp {item.denda.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl border ${getStatusColor(item.status)}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{getStatusLabel(item.status)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
