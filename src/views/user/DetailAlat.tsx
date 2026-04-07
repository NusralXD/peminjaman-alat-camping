import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight, Minus, Plus, Star, ShieldCheck, Info, RefreshCcw } from 'lucide-react';

export default function DetailAlat({ user }: { user: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [alat, setAlat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jumlahHari, setJumlahHari] = useState(1);
  const [jumlahAlat, setJumlahAlat] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlat();
  }, [id]);

  const fetchAlat = async () => {
    try {
      const res = await fetch(`/api/alat/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAlat(data);
      } else {
        navigate('/katalog');
      }
    } catch (err) {
      console.error('Failed to fetch alat');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = alat ? alat.harga_per_hari * jumlahHari * jumlahAlat : 0;

  const handleAddToCart = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/keranjang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alat_id: alat.id, 
          jumlah_hari: jumlahHari,
          jumlah_alat: jumlahAlat
        })
      });
      if (res.ok) {
        alert('Berhasil ditambahkan ke keranjang!');
        navigate('/keranjang');
      }
    } catch (err) {
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectLoan = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    // Navigate to checkout with this specific item as directItem
    navigate('/checkout', { 
      state: { 
        directItem: { 
          ...alat, 
          alat_id: alat.id,
          jumlah_hari: jumlahHari, 
          jumlah_alat: jumlahAlat 
        } 
      } 
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;
  if (!alat) return null;

  return (
    <div className="min-h-screen bg-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-gray-400">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/katalog" className="hover:text-emerald-600 transition-colors">Katalog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{alat.nama_alat}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase mb-2">{alat.nama_alat}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              <span className="text-sm font-bold text-gray-900 ml-1">4.9</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{alat.nama_kategori}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Left: Photo */}
          <div className="aspect-square bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100">
            <img 
              src={alat.gambar_url} 
              alt={alat.nama_alat} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right: Info & Actions */}
          <div className="flex flex-col">
            <div className="bg-gray-50 rounded-[32px] p-8 mb-8 border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Sewa</p>
                <p className="text-3xl font-black text-emerald-600">Rp {alat.harga_per_hari.toLocaleString()}<span className="text-sm font-normal text-gray-400">/hari</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stok Tersedia</p>
                <p className="text-xl font-bold text-gray-900">{alat.stok} Unit</p>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                {alat.deskripsi || 'Tidak ada deskripsi untuk alat ini.'}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="mt-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Durasi</span>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setJumlahHari(Math.max(1, jumlahHari - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="text-center min-w-[40px]">
                      <span className="text-lg font-black text-gray-900">{jumlahHari}</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Hari</span>
                    </div>
                    <button 
                      onClick={() => setJumlahHari(jumlahHari + 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Jumlah</span>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setJumlahAlat(Math.max(1, jumlahAlat - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="text-center min-w-[40px]">
                      <span className="text-lg font-black text-gray-900">{jumlahAlat}</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Unit</span>
                    </div>
                    <button 
                      onClick={() => setJumlahAlat(Math.min(alat.stok, jumlahAlat + 1))}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-600/5 rounded-2xl p-6 border border-emerald-600/10 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Total Sewa</span>
                <p className="text-2xl font-black text-emerald-600">Rp {totalPrice.toLocaleString()}</p>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={submitting}
                  className="w-16 h-16 rounded-2xl border-2 border-gray-900 flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all group"
                >
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={handleDirectLoan}
                  disabled={submitting}
                  className="flex-1 h-16 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-emerald-900/20"
                >
                  <span>Sewa Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="border-t border-gray-100 pt-20">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-1 h-8 bg-emerald-600 rounded-full" />
            <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Spesifikasi Lengkap</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest">Kondisi Alat</h4>
              <p className="text-sm text-gray-500">Semua alat dalam kondisi prima dan telah melalui proses sanitasi ketat sebelum disewakan.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <Info className="w-8 h-8 text-emerald-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest">Kelengkapan</h4>
              <p className="text-sm text-gray-500">Termasuk tas penyimpanan original dan panduan penggunaan singkat.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <RefreshCcw className="w-8 h-8 text-emerald-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest">Garansi Tukar</h4>
              <p className="text-sm text-gray-500">Jika terjadi kerusakan bukan karena kelalaian, kami ganti dengan alat yang baru di lokasi terdekat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
