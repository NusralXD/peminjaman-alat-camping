import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function Cart({ user }: { user: any }) {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/keranjang');
      const data = await res.json();
      setCart(data);
      // Select all by default
      setSelectedIds(data.map((item: any) => item.id));
    } catch (err) {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map(item => item.id));
    }
  };

  const handleRemove = async (id: number) => {
    console.log('Attempting to remove item with id:', id);
    try {
      const res = await fetch(`/api/keranjang/${id}`, { method: 'DELETE' });
      console.log('Delete response status:', res.status);
      if (res.ok) {
        setCart(cart.filter(item => item.id !== id));
        setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
        const errorData = await res.json();
        console.error('Delete failed:', errorData);
        alert('Gagal menghapus item: ' + (errorData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error during delete:', err);
      alert('Gagal menghapus item');
    }
  };

  const handleCheckout = async () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal satu produk untuk checkout');
      return;
    }
    navigate('/checkout', { state: { selectedIds } });
  };

  const selectedItems = cart.filter(item => selectedIds.includes(item.id));
  const totalHarga = selectedItems.reduce((acc, item) => acc + (item.harga_per_hari * item.jumlah_hari * item.jumlah_alat), 0);
  const totalItem = selectedItems.reduce((acc, item) => acc + item.jumlah_alat, 0);

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-2">Keranjang Sewa</h1>
            <p className="text-gray-500 dark:text-gray-400">Siapkan perlengkapan petualanganmu di sini</p>
          </div>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-[40px] p-20 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-12 h-12 text-gray-200 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Keranjangmu masih kosong</h2>
            <p className="text-gray-400 dark:text-gray-500 mb-10 max-w-md mx-auto">Jelajahi katalog kami dan temukan alat camping terbaik untuk petualanganmu selanjutnya.</p>
            <Link to="/katalog" className="inline-block bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
              Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === cart.length && cart.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 transition-all"
                  />
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Pilih Semua ({cart.length})</span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{selectedIds.length} Item Terpilih</span>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white dark:bg-gray-800 rounded-[32px] p-6 border transition-all flex items-center gap-6 group hover:shadow-xl hover:shadow-gray-200/50 ${selectedIds.includes(item.id) ? 'border-emerald-600/30 dark:border-emerald-500/30' : 'border-gray-100 dark:border-gray-700'}`}
                  >
                    <div className="flex-shrink-0">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.gambar_url} 
                        alt={item.nama_alat} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate uppercase tracking-tight">{item.nama_alat}</h3>
                      <div className="flex items-center space-x-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                        <span>Rp {item.harga_per_hari.toLocaleString()}/hari</span>
                        <span>•</span>
                        <span>{item.jumlah_hari} Hari</span>
                        <span>•</span>
                        <span>{item.jumlah_alat} Unit</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">Rp {(item.harga_per_hari * item.jumlah_hari * item.jumlah_alat).toLocaleString()}</p>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="p-3 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-[40px] p-10 text-white sticky top-24 shadow-2xl shadow-gray-900/50 dark:shadow-black/50 border border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-8">Ringkasan Sewa</h3>
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Item</span>
                    <span className="font-bold">{totalItem} Alat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Biaya Sewa</span>
                    <span className="font-bold">Rp {totalHarga.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Biaya Admin</span>
                    <span className="font-bold text-emerald-500">FREE</span>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/10 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Bayar</span>
                    <span className="text-3xl font-black text-white">Rp {totalHarga.toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-emerald-900/20"
                >
                  <span>Checkout Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-6 uppercase font-bold tracking-widest">
                  Dengan mengklik checkout, Anda menyetujui syarat & ketentuan sewa kami.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
