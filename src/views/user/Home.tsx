import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  RefreshCcw, 
  Star,
  Tent,
  Backpack,
  CookingPot,
  BedDouble,
  Lightbulb,
  Compass,
  Footprints,
  Wind,
  Layers,
  HelpCircle,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../core/api';

export default function Home({ user }: { user: any }) {
  const [alat, setAlat] = useState<any[]>([]);
  const [weeklyVouchers, setWeeklyVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('TENDA');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlat();
    fetchWeeklyVouchers();
    
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = () => {
    const now = new Date();
    // Weekly refresh every Monday at 00:00
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    nextMonday.setHours(0, 0, 0, 0);
    
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    
    const diff = nextMonday.getTime() - now.getTime();
    
    setTimeLeft({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    });
  };

  const fetchWeeklyVouchers = async () => {
    try {
      const data = await api.getWeeklyVouchers();
      setWeeklyVouchers(data);
    } catch (err) {
      console.error('Failed to fetch weekly vouchers');
    }
  };

  const handleClaimVoucher = async (voucherId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setClaiming(voucherId);
    try {
      const res = await api.claimVoucher(voucherId);
      const data = await res.json();
      if (res.ok) {
        alert('Voucher berhasil diklaim! Cek di halaman checkout.');
        fetchWeeklyVouchers(); // Refresh to show as claimed
      } else {
        alert(data.message || 'Gagal mengklaim voucher');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengklaim voucher');
    } finally {
      setClaiming(null);
    }
  };

  const heroImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1920"
  ];

  const nextHero = () => {
    setDirection(1);
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevHero = () => {
    setDirection(-1);
    setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  useEffect(() => {
    const timer = setInterval(nextHero, 5000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const testimonials = [
    {
      name: "Andi Wijaya",
      role: "Pendaki Gunung",
      initial: "A",
      bg: "bg-emerald-500",
      text: "Alatnya bersih banget, tendanya kayak baru. Proses sewa juga gampang banget tinggal klik di web. Recommended!"
    },
    {
      name: "Siti Aminah",
      role: "Camper Enthusiast",
      initial: "S",
      bg: "bg-blue-500",
      text: "Suka banget sama sistem return anywhere-nya. Nggak perlu ribet balik ke toko kalau lagi trip jauh. Mantap Pondok Rent!"
    }
  ];

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const categoryIcons = [
    { name: 'BROWSE ALL', icon: LayoutGrid, link: '/katalog?category=Semua' },
    { name: "WHAT'S NEW", icon: Zap, link: '/katalog?sort=terbaru' },
    { name: 'TENDA', icon: Tent, link: '/katalog?category=Tenda' },
    { name: 'CARRIER', icon: Backpack, link: '/katalog?category=Carrier' },
    { name: 'COOKING SET', icon: CookingPot, link: '/katalog?category=Cooking Set' },
    { name: 'SLEEPING BAG', icon: BedDouble, link: '/katalog?category=Sleeping Bag' },
    { name: 'LAMPU', icon: Lightbulb, link: '/katalog?category=Lampu' },
    { name: 'MATRAS', icon: Layers, link: '/katalog?category=Aksesoris' },
    { name: 'SEPATU', icon: Footprints, link: '/katalog?category=Sepatu' },
    { name: 'JAKET', icon: Wind, link: '/katalog?category=Jaket' },
    { name: 'ITEM REQUEST', icon: HelpCircle, link: '/katalog' },
  ];

  const tabs = ['TENDA', 'CARRIER', 'COOKING SET', 'TERLARIS', 'PRODUK BARU'];

  useEffect(() => {
    fetchAlat();
  }, []);

  const fetchAlat = async () => {
    try {
      const data = await api.getAlat();
      setAlat(data);
    } catch (err) {
      console.error('Failed to fetch alat');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlat = alat.filter(item => {
    if (activeTab === 'TERLARIS' || activeTab === 'PRODUK BARU') return true;
    return item.nama_kategori?.toUpperCase() === activeTab;
  }).slice(0, 6);

  return (
    <div className="bg-white pb-20">
      {/* Category Icons Row */}
      <div className="border-b border-gray-100 py-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-start min-w-[1000px]">
          {categoryIcons.map((cat) => (
            <Link 
              key={cat.name} 
              to={cat.link}
              className="flex flex-col items-center group space-y-3 w-20"
            >
              <div className="w-12 h-12 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                <cat.icon className="w-8 h-8 stroke-[1.5]" />
              </div>
              <span className="text-[9px] font-bold tracking-wider text-gray-500 text-center uppercase group-hover:text-gray-900 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gray-100 group">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img 
              key={heroIndex}
              src={heroImages[heroIndex]} 
              alt={`Camping Gear Banner ${heroIndex + 1}`} 
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -10000) {
                  nextHero();
                } else if (swipe > 10000) {
                  prevHero();
                }
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
            <button 
              onClick={prevHero}
              className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-600 transition-all pointer-events-auto"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextHero}
              className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-600 transition-all pointer-events-auto"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > heroIndex ? 1 : -1);
                  setHeroIndex(i);
                }}
                className={`h-1.5 transition-all rounded-full ${
                  heroIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Tabs Navigation */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-12 border-b border-gray-100 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all relative ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                  />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-gray-50 h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {filteredAlat.map((item) => (
                <Link 
                  key={item.id}
                  to={`/alat/${item.id}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                    <img 
                      src={item.gambar_url} 
                      alt={item.nama_alat}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-tight line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                    {item.nama_alat}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-600">
                    Rp {item.harga_per_hari.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Daily Discount Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">Daily Discount</h2>
              <p className="text-emerald-100 font-medium mb-6">Klaim voucher mingguanmu sebelum kehabisan!</p>
              
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="flex flex-col items-center">
                  <span className="bg-white text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-1 shadow-lg">{timeLeft.days}</span>
                  <span className="text-[10px] text-emerald-50 font-bold uppercase tracking-widest">Hari</span>
                </div>
                <span className="text-white font-bold text-2xl mb-6">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-white text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-1 shadow-lg">{timeLeft.hours}</span>
                  <span className="text-[10px] text-emerald-50 font-bold uppercase tracking-widest">Jam</span>
                </div>
                <span className="text-white font-bold text-2xl mb-6">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-white text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-1 shadow-lg">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-emerald-50 font-bold uppercase tracking-widest">Menit</span>
                </div>
                <span className="text-white font-bold text-2xl mb-6">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-white text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-1 shadow-lg">{timeLeft.seconds}</span>
                  <span className="text-[10px] text-emerald-50 font-bold uppercase tracking-widest">Detik</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
              {weeklyVouchers.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-xl border border-emerald-500/20 group hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    {v.tipe === 'item' ? <Zap className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight">{v.nama_voucher}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">{v.deskripsi}</p>
                    <button 
                      onClick={() => handleClaimVoucher(v.id)}
                      disabled={claiming === v.id || v.is_claimed > 0}
                      className={`mt-2 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                        v.is_claimed > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      {claiming === v.id ? 'Mengklaim...' : (v.is_claimed > 0 ? 'Sudah Diklaim' : 'Klaim Sekarang →')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* More Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Produk Terpopuler</h2>
              <p className="text-gray-500 text-sm font-medium">Pilihan terbaik untuk petualanganmu</p>
            </div>
            <Link to="/katalog" className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-700 transition-colors flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {alat.slice(0, 10).map((item) => (
              <Link 
                key={item.id}
                to={`/alat/${item.id}`}
                className="group bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
                  <img 
                    src={item.gambar_url} 
                    alt={item.nama_alat}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-gray-500">
                    {item.nama_kategori}
                  </div>
                </div>
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tight line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
                  {item.nama_alat}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-600">
                    Rp {item.harga_per_hari.toLocaleString()}
                  </p>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="text-[9px] font-bold text-gray-400 ml-1">4.9</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Apa Kata Mereka?</h2>
              <p className="text-gray-400">Ribuan petualang telah mempercayakan perjalanannya kepada kami.</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative h-[300px] md:h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[40px] h-full flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-14 h-14 rounded-full ${testimonials[testimonialIndex].bg} flex items-center justify-center font-bold text-xl`}>
                      {testimonials[testimonialIndex].initial}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonials[testimonialIndex].name}</h4>
                      <p className="text-sm text-gray-400">{testimonials[testimonialIndex].role}</p>
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl italic text-gray-300 leading-relaxed">
                    "{testimonials[testimonialIndex].text}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`h-1.5 transition-all rounded-full ${
                  testimonialIndex === i ? 'w-8 bg-emerald-600' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-black rounded-[40px] overflow-hidden py-24 px-12 text-center">
          <div className="absolute inset-0 bg-emerald-600/10 blur-[120px]" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-white text-5xl font-black tracking-tighter mb-6 leading-none uppercase">
              Ready for your <br /> next adventure?
            </h2>
            <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
              Sewa perlengkapan camping kualitas premium dengan harga terjangkau. 
              Siap menemani setiap langkahmu menjelajahi alam Indonesia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/katalog" className="bg-white text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
                Mulai Sewa Sekarang
              </Link>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                Hubungi WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
