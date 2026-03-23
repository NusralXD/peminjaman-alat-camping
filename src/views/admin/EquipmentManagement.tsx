import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Trash2, Edit3, Tag, Layers, Database, X, Image as ImageIcon, DollarSign, List } from 'lucide-react';
import { api } from '../../core/api';

export default function EquipmentManagement({ user }: { user: any }) {
  const [alat, setAlat] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAlat, setEditingAlat] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama_alat: '',
    kategori_id: '',
    harga_per_hari: '',
    stok: '',
    gambar_url: '',
    deskripsi: '',
    kondisi: 'Baik'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alatData, catData] = await Promise.all([
        api.getAlat(),
        api.getCategories()
      ]);
      setAlat(alatData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingAlat(item);
      setFormData({
        nama_alat: item.nama_alat,
        kategori_id: item.kategori_id.toString(),
        harga_per_hari: item.harga_per_hari.toString(),
        stok: item.stok.toString(),
        gambar_url: item.gambar_url,
        deskripsi: item.deskripsi,
        kondisi: item.kondisi || 'Baik'
      });
    } else {
      setEditingAlat(null);
      setFormData({
        nama_alat: '',
        kategori_id: categories[0]?.id.toString() || '',
        harga_per_hari: '',
        stok: '',
        gambar_url: '',
        deskripsi: '',
        kondisi: 'Baik'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      kategori_id: parseInt(formData.kategori_id),
      harga_per_hari: parseInt(formData.harga_per_hari),
      stok: parseInt(formData.stok)
    };

    try {
      const res = editingAlat 
        ? await api.updateAlat(editingAlat.id, data)
        : await api.createAlat(data);

      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alat ini?')) return;
    try {
      const res = await api.deleteAlat(id);
      if (res.ok) fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const filteredAlat = alat.filter(a => 
    a.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.nama_kategori?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Manajemen Alat</h1>
          <p className="text-white/60 text-lg">Kelola stok dan katalog perlengkapan camping</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center space-x-3 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Alat</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari alat atau kategori..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center space-x-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-bold">{categories.length} Kategori</span>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Alat</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Kategori</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Kondisi</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Harga/Hari</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Stok</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAlat.map((a) => (
                <motion.tr 
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/10">
                        <img 
                          src={a.gambar_url} 
                          alt={a.nama_alat} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold">{a.nama_alat}</p>
                        <p className="text-white/40 text-xs mt-1 truncate max-w-[200px]">{a.deskripsi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span className="text-white/80 text-sm">{a.nama_kategori}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      a.kondisi === 'Baik' ? 'bg-emerald-500/20 text-emerald-400' :
                      a.kondisi === 'Rusak Ringan' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {a.kondisi || 'Baik'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-white font-bold">Rp {a.harga_per_hari.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${a.stok > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-white font-bold">{a.stok}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(a)}
                        className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1e293b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{editingAlat ? 'Edit Alat' : 'Tambah Alat Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Package className="w-3 h-3" />
                      <span>Nama Alat</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.nama_alat}
                      onChange={(e) => setFormData({...formData, nama_alat: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Contoh: Tenda Dome V2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <List className="w-3 h-3" />
                      <span>Kategori</span>
                    </label>
                    <select 
                      required
                      value={formData.kategori_id}
                      onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#1e293b]">{cat.nama_kategori}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <DollarSign className="w-3 h-3" />
                      <span>Harga Sewa / Hari</span>
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.harga_per_hari}
                      onChange={(e) => setFormData({...formData, harga_per_hari: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Database className="w-3 h-3" />
                      <span>Stok Awal</span>
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.stok}
                      onChange={(e) => setFormData({...formData, stok: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Database className="w-3 h-3" />
                      <span>Kondisi Barang</span>
                    </label>
                    <select 
                      required
                      value={formData.kondisi}
                      onChange={(e) => setFormData({...formData, kondisi: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      <option value="Baik" className="bg-[#1e293b]">Baik</option>
                      <option value="Rusak Ringan" className="bg-[#1e293b]">Rusak Ringan</option>
                      <option value="Rusak Berat" className="bg-[#1e293b]">Rusak Berat</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                    <ImageIcon className="w-3 h-3" />
                    <span>URL Gambar</span>
                  </label>
                  <input 
                    required
                    type="url" 
                    value={formData.gambar_url}
                    onChange={(e) => setFormData({...formData, gambar_url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                    <Database className="w-3 h-3" />
                    <span>Deskripsi</span>
                  </label>
                  <textarea 
                    required
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all h-32 resize-none"
                    placeholder="Jelaskan detail alat..."
                  />
                </div>

                <div className="pt-6 flex space-x-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-white/60 hover:bg-white/5 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {editingAlat ? 'Simpan Perubahan' : 'Tambah Alat'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
