import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowRight, Star, SlidersHorizontal, X, ShoppingCart, ChevronRight, ChevronLeft, Mail, Package } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../core/api';

export default function Catalog({ user }: { user: any }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alat, setAlat] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Semua');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'Terbaru');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (cat) {
      const found = categories.find(c => c.nama_kategori.toLowerCase() === cat.toLowerCase());
      if (found) {
        setSelectedCategory(found.nama_kategori);
      } else if (cat.toLowerCase() === 'semua') {
        setSelectedCategory('Semua');
      }
    } else {
      setSelectedCategory('Semua');
    }

    if (search) setSearchTerm(search);
    if (sort) {
      if (sort === 'terbaru') setSortBy('Terbaru');
      if (sort === 'murah') setSortBy('Harga Terendah');
      if (sort === 'mahal') setSortBy('Harga Tertinggi');
    }
  }, [searchParams, categories]);

  const fetchData = async () => {
    try {
      const [alatData, catData] = await Promise.all([
        api.getAlat(),
        api.getCategories()
      ]);
      
      setAlat(alatData);
      
      // Filter duplicate categories by name
      const uniqueCategories = catData.filter((cat: any, index: number, self: any[]) =>
        index === self.findIndex((c) => c.nama_kategori === cat.nama_kategori)
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handlePinjam = async (alatId: number) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    const tgl_pinjam = new Date().toISOString().split('T')[0];
    const tgl_kembali = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const res = await api.createLoan({ alat_id: alatId, tgl_pinjam, tgl_kembali });
      if (res.ok) {
        alert('Pengajuan peminjaman berhasil!');
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mengajukan peminjaman');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  };

  const filteredAlat = alat.filter(item => {
    const matchesSearch = item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.nama_kategori === selectedCategory;
    
    if (filterType === 'new') {
      // Assuming higher ID means newer
      return matchesSearch && matchesCategory; 
    }
    if (filterType === 'best') {
      // Placeholder for best seller logic
      return matchesSearch && matchesCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const sortedAlat = [...filteredAlat].sort((a, b) => {
    if (filterType === 'new') return b.id - a.id;
    if (filterType === 'best') return b.harga_per_hari - a.harga_per_hari; // Placeholder
    if (sortBy === 'Harga Terendah') return a.harga_per_hari - b.harga_per_hari;
    if (sortBy === 'Harga Tertinggi') return b.harga_per_hari - a.harga_per_hari;
    if (sortBy === 'Terbaru') return b.id - a.id;
    return 0;
  });

  const addToCart = async (alatId: number) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      const res = await api.addToCart({ alat_id: alatId, jumlah_hari: 1, jumlah_alat: 1 });
      if (res.ok) {
        navigate('/keranjang');
      }
    } catch (err) {
      console.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop" 
          alt="Shop Banner" 
          className="w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[120px] font-black text-white uppercase tracking-tighter opacity-90">Shop</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Search Bar Section */}
        <div className="bg-white rounded-full shadow-xl border border-gray-100 p-2 flex items-center justify-between pl-8 mb-16">
          <h2 className="text-xl font-bold text-gray-900 hidden md:block">Give All You Need</h2>
          <div className="flex-1 max-w-xl flex items-center bg-gray-50 rounded-full px-6 py-2 mx-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search on Stuffus..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm font-medium"
            />
          </div>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-emerald-600 transition-all">
            Search
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 pb-20">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="mb-10">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6">Category</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory('Semua')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'Semua' ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-3" />
                    <span>All Product</span>
                  </div>
                  {selectedCategory === 'Semua' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.nama_kategori)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.nama_kategori ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-3" />
                      <span>{cat.nama_kategori}</span>
                    </div>
                    {selectedCategory === cat.nama_kategori && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setFilterType(filterType === 'new' ? 'all' : 'new')}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold transition-colors ${filterType === 'new' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <div className="flex items-center">
                  <Star className={`w-4 h-4 mr-3 ${filterType === 'new' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  <span>New Arrival</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setFilterType(filterType === 'best' ? 'all' : 'best')}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold transition-colors ${filterType === 'best' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-3" />
                  <span>Best Seller</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse bg-gray-100 h-[450px] rounded-[32px]" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                  <AnimatePresence mode="popLayout">
                    {sortedAlat.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group"
                      >
                        <div className="relative aspect-square bg-[#F3F3F3] rounded-[32px] overflow-hidden mb-6 p-8 flex items-center justify-center">
                          <img 
                            src={item.gambar_url} 
                            alt={item.nama_alat}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-6 right-6 bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                            {item.nama_kategori}
                          </div>
                        </div>
                        
                        <div className="px-2">
                          <h3 className="text-lg font-black text-gray-900 mb-2 truncate uppercase tracking-tight">{item.nama_alat}</h3>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-[11px] font-bold text-gray-400">4.9 (1.2k Reviews)</span>
                            </div>
                            <p className="text-lg font-black text-gray-900">Rp {item.harga_per_hari.toLocaleString()}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => addToCart(item.id)}
                              className="py-3 rounded-xl border border-gray-200 text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                              Add to Cart
                            </button>
                            <button 
                              onClick={() => {
                                if (!user) {
                                  navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                                  return;
                                }
                                navigate('/checkout', { state: { directItem: { alat_id: item.id, jumlah_hari: 1, jumlah_alat: 1 } } });
                              }}
                              className="py-3 rounded-xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest text-center hover:bg-emerald-600 transition-all"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Placeholder */}
                <div className="mt-20 flex items-center justify-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, '...', 9, 10].map((p, i) => (
                      <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold ${p === 1 ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-32 pb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Explore our recommendations</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setRecommendationIndex(prev => Math.max(0, prev - 1))}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setRecommendationIndex(prev => Math.min(Math.floor(alat.length / 4), prev + 1))}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {alat.slice(recommendationIndex * 4, (recommendationIndex + 1) * 4).map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-square bg-[#F3F3F3] rounded-[32px] overflow-hidden mb-6 p-8 flex items-center justify-center">
                  <img src={item.gambar_url} alt={item.nama_alat} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 right-6 bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {item.nama_kategori}
                  </div>
                </div>
                <h3 className="text-sm font-black text-gray-900 mb-1 uppercase truncate">{item.nama_alat}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-400">4.9</span>
                  </div>
                  <p className="text-sm font-black text-gray-900">Rp {item.harga_per_hari.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-[#2D2D2D] rounded-[40px] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-8">
              Ready to Get<br />Our New Stuff?
            </h2>
            <div className="bg-white rounded-full p-1 flex items-center max-w-md">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="flex-1 bg-transparent border-none outline-none px-6 py-2 text-sm font-medium"
              />
              <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
                Send
              </button>
            </div>
          </div>
          <div className="mt-12 md:mt-0 text-right relative z-10 max-w-xs">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Stuffus for reviews and Needs</p>
            <p className="text-white/60 text-xs leading-relaxed italic">
              "Find better for your needs, identify the best approach, and then create a comprehensive RV camping solution that's right for you."
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[70] p-8 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Filter & Urutkan</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Kategori</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { setSelectedCategory('Semua'); setShowFilters(false); }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'Semua' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      Semua
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.nama_kategori); setShowFilters(false); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.nama_kategori ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {cat.nama_kategori}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold"
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
