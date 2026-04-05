import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Phone, Mail, MapPin, Hash, FileText, 
  CreditCard, CheckCircle, ArrowRight, ArrowLeft,
  ShoppingBag, Trash2, Tag
} from 'lucide-react';

export default function Checkout({ user }: { user: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds, directItem } = (location.state as any) || {};
  
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedItemVoucher, setSelectedItemVoucher] = useState<any>(null);
  const [selectedShippingVoucher, setSelectedShippingVoucher] = useState<any>(null);
  
  // Shipping & Payment state
  const [shippingMethod, setShippingMethod] = useState('jne');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [selectedBranch, setSelectedBranch] = useState('');

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    address: user?.address || '',
    postalCode: user?.postal_code || '',
    state: user?.state || '',
    note: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (directItem) {
      fetchDirectItem();
    } else {
      fetchCart();
    }
    fetchMyVouchers();
  }, [user, directItem]);

  const fetchMyVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers/my');
      const data = await res.json();
      setMyVouchers(data);
    } catch (err) {
      console.error('Failed to fetch my vouchers');
    }
  };

  const fetchDirectItem = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alat/${directItem.alat_id}`);
      const data = await res.json();
      setCart([{
        ...data,
        jumlah_hari: directItem.jumlah_hari,
        jumlah_alat: directItem.jumlah_alat,
        id: 'direct' // Temporary ID for direct checkout
      }]);
    } catch (err) {
      console.error('Failed to fetch direct item');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/keranjang');
      let data = await res.json();
      
      // Filter by selectedIds if provided
      if (selectedIds && Array.isArray(selectedIds)) {
        data = data.filter((item: any) => selectedIds.includes(item.id));
      }
      
      setCart(data);
      if (data.length === 0 && step !== 3) {
        navigate('/keranjang');
      }
    } catch (err) {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceed = async () => {
    if (step === 1) {
      if (!formData.address || !formData.postalCode || !formData.state) {
        alert('Mohon lengkapi informasi pengiriman');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedBranch) {
        alert('Mohon pilih cabang toko pengiriman');
        return;
      }
      setShowConfirmPopup(true);
    }
  };

  const handleFinalCheckout = async () => {
    setShowConfirmPopup(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/keranjang/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_info: {
            ...formData,
            name: user?.nama_lengkap,
            phone: user?.phone,
            email: user?.email
          },
          selectedIds: directItem ? null : selectedIds,
          directItem: directItem || null,
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          voucher_item_id: selectedItemVoucher?.user_voucher_id,
          voucher_shipping_id: selectedShippingVoucher?.user_voucher_id,
          store_branch: selectedBranch
        })
      });
      if (res.ok) {
        setStep(3);
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal melakukan checkout');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const totalHarga = cart.reduce((acc, item) => acc + (item.harga_per_hari * item.jumlah_hari * item.jumlah_alat), 0);
  const vat = totalHarga * 0.1; 
  const shippingCosts: Record<string, number> = {
    jne: 25000,
    jnt: 22000,
    sicepat: 20000,
    gosend: 45000,
    grab: 42000
  };
  const shipping = shippingCosts[shippingMethod] || 0;

  // Calculate Discounts
  let diskonItem = 0;
  if (selectedItemVoucher && totalHarga >= selectedItemVoucher.min_pembelian) {
    if (selectedItemVoucher.potongan_persen > 0) {
      diskonItem = Math.floor(totalHarga * (selectedItemVoucher.potongan_persen / 100));
      if (selectedItemVoucher.max_potongan) diskonItem = Math.min(diskonItem, selectedItemVoucher.max_potongan);
    } else {
      diskonItem = selectedItemVoucher.potongan_nominal;
    }
  }

  let diskonShipping = 0;
  if (selectedShippingVoucher && shipping >= selectedShippingVoucher.min_pembelian) {
    if (selectedShippingVoucher.potongan_persen > 0) {
      diskonShipping = Math.floor(shipping * (selectedShippingVoucher.potongan_persen / 100));
      if (selectedShippingVoucher.max_potongan) diskonShipping = Math.min(diskonShipping, selectedShippingVoucher.max_potongan);
    } else {
      diskonShipping = selectedShippingVoucher.potongan_nominal;
    }
    // Cannot discount more than shipping cost
    diskonShipping = Math.min(diskonShipping, shipping);
  }

  const grandTotal = Math.max(0, totalHarga + vat + shipping - diskonItem - diskonShipping);

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  const shippingOptions = [
    { id: 'jne', name: 'JNE Express', desc: '2-3 Days Delivery', price: 25000, logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/JNE_Express_logo.svg' },
    { id: 'jnt', name: 'J&T Express', desc: '1-2 Days Delivery', price: 22000, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/J%26T_Express_logo.svg/2560px-J%26T_Express_logo.svg.png' },
    { id: 'sicepat', name: 'SiCepat', desc: 'Regular Delivery', price: 20000, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SiCepat_Ekspres_logo.svg/2560px-SiCepat_Ekspres_logo.svg.png' },
    { id: 'gosend', name: 'GoSend', desc: 'Instant Delivery', price: 45000, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Gojek_logo_2019.svg/2560px-Gojek_logo_2019.svg.png' },
    { id: 'grab', name: 'GrabExpress', desc: 'Instant Delivery', price: 42000, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Grab_logo.svg/2560px-Grab_logo.svg.png' }
  ];

  const paymentOptions = [
    { id: 'transfer', name: 'Transfer Bank', desc: 'Manual Verification', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'ewallet', name: 'E-Wallet', desc: 'OVO, Dana, LinkAja', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'cod', name: 'Cash on Delivery (COD)', desc: 'Bayar di Tempat', icon: <MapPin className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col lg:flex-row min-h-[700px]"
      >
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-8">Checkout</h1>
            
            {/* Stepper */}
            <div className="flex items-center space-x-8 text-xs font-bold uppercase tracking-widest">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-300'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>1</span>
                <span>Information</span>
              </div>
              <div className="h-px w-12 bg-gray-100" />
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-300'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>2</span>
                <span>Payment</span>
              </div>
              <div className="h-px w-12 bg-gray-100" />
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-300'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>3</span>
                <span>Complete</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        disabled
                        value={user?.nama_lengkap}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone No</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        disabled
                        value={user?.phone}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      disabled
                      value={user?.email}
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter Delivery Address"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Postal Code</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Enter Postal Code"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State / Provinsi</label>
                    <select 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm appearance-none"
                    >
                      <option value="">Select State</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="Bali">Bali</option>
                      <option value="Banten">Banten</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea 
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Enter Note"
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleProceed}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                >
                  Proceed
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Shipping Method */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Metode Pengiriman</h3>
                      <p className="text-xs text-gray-500">Pilih kurir pengiriman</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shippingOptions.map((option) => (
                      <label 
                        key={option.id}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          shippingMethod === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="shipping" 
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={() => setShippingMethod(option.id)}
                          className="hidden" 
                        />
                        <div className="w-10 h-10 bg-white rounded-lg p-1 mr-4 flex-shrink-0 border border-gray-100">
                          <img src={option.logo} alt={option.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-sm">{option.name}</span>
                            <span className="text-xs font-bold text-blue-600">Rp {option.price.toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Metode Pembayaran</h3>
                      <p className="text-xs text-gray-500">Pilih metode pembayaran</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {paymentOptions.map((option) => (
                      <label 
                        key={option.id}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentMethod === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="payment" 
                          value={option.id}
                          checked={paymentMethod === option.id}
                          onChange={() => setPaymentMethod(option.id)}
                          className="hidden" 
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                          paymentMethod === option.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-gray-900 text-sm block">{option.name}</span>
                          <p className="text-[10px] text-gray-400">{option.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === option.id ? 'border-blue-600' : 'border-gray-200'
                        }`}>
                          {paymentMethod === option.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Store Branch Selection */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Domisili Cabang Toko</h3>
                      <p className="text-xs text-gray-500">Pilih cabang pengiriman terdekat</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Bandung', 'Jakarta', 'Yogyakarta', 'Bali'].map((branch) => (
                      <button
                        key={branch}
                        onClick={() => setSelectedBranch(branch)}
                        className={`py-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                          selectedBranch === branch 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleProceed}
                    disabled={submitting}
                    className="flex-1 h-16 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3"
                  >
                    {submitting ? 'Processing...' : (
                      <>
                        <span>Complete Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">Order Completed!</h2>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto">Terima kasih atas pesanan Anda. Kami akan segera memproses peminjaman alat Anda.</p>
                <button 
                  onClick={() => navigate('/status-peminjaman')}
                  className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-gray-900/20"
                >
                  Check Loan Status
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Cart Summary */}
        <div className="w-full lg:w-[450px] bg-[#1a1c2e] p-8 md:p-12 text-white flex flex-col">
          <div className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-8">Your Cart</h2>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-white/5 p-4 rounded-3xl border border-white/5 group">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.gambar_url} 
                      alt={item.nama_alat} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate uppercase tracking-tight">{item.nama_alat}</h4>
                    <p className="text-xs text-blue-400 font-bold">Rp {item.harga_per_hari.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-white/40">{item.jumlah_alat}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Price Details</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Items</span>
                <span className="font-bold">Rp {totalHarga.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">VAT (10%)</span>
                <span className="font-bold">Rp {vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Shipping</span>
                <span className="font-bold">Rp {shipping.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-8">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <div className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white/60 flex items-center justify-between">
                  <span>
                    {selectedItemVoucher || selectedShippingVoucher 
                      ? `${selectedItemVoucher ? '1 Item' : ''}${selectedItemVoucher && selectedShippingVoucher ? ' & ' : ''}${selectedShippingVoucher ? '1 Shipping' : ''} Voucher`
                      : 'No Voucher Selected'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowVoucherModal(true)}
                className="px-6 py-4 bg-blue-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Select
              </button>
            </div>

            <div className="space-y-2 mb-8">
              {diskonItem > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                  <span>Item Discount</span>
                  <span>- Rp {diskonItem.toLocaleString()}</span>
                </div>
              )}
              {diskonShipping > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                  <span>Shipping Discount</span>
                  <span>- Rp {diskonShipping.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Total</span>
              <span className="text-3xl font-black text-white tracking-tighter">Rp {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Popup */}
      <AnimatePresence>
        {showConfirmPopup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Konfirmasi Sewa</h3>
              <p className="text-gray-500 mb-8">Apakah Anda yakin ingin menyewa barang tersebut? Pastikan semua data sudah benar.</p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleFinalCheckout}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                >
                  Ya, Sewa Sekarang
                </button>
                <button 
                  onClick={() => setShowConfirmPopup(false)}
                  className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Modal */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoucherModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Pilih Voucher</h2>
                <button onClick={() => setShowVoucherModal(false)} className="text-gray-400 hover:text-gray-900">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar space-y-6">
                {/* Item Vouchers */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Voucher Barang (Pilih 1)</h3>
                  <div className="space-y-3">
                    {myVouchers.filter(v => v.tipe === 'item').map((v) => (
                      <label 
                        key={v.id}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedItemVoucher?.id === v.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="item_voucher" 
                          className="hidden"
                          checked={selectedItemVoucher?.id === v.id}
                          onChange={() => setSelectedItemVoucher(selectedItemVoucher?.id === v.id ? null : v)}
                        />
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-gray-900 text-sm block">{v.nama_voucher}</span>
                          <p className="text-[10px] text-gray-400">{v.deskripsi}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedItemVoucher?.id === v.id ? 'border-blue-600' : 'border-gray-200'
                        }`}>
                          {selectedItemVoucher?.id === v.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                      </label>
                    ))}
                    {myVouchers.filter(v => v.tipe === 'item').length === 0 && (
                      <p className="text-xs text-gray-400 italic">Tidak ada voucher barang tersedia.</p>
                    )}
                  </div>
                </div>

                {/* Shipping Vouchers */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Voucher Ongkir (Pilih 1)</h3>
                  <div className="space-y-3">
                    {myVouchers.filter(v => v.tipe === 'shipping').map((v) => (
                      <label 
                        key={v.id}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedShippingVoucher?.id === v.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="shipping_voucher" 
                          className="hidden"
                          checked={selectedShippingVoucher?.id === v.id}
                          onChange={() => setSelectedShippingVoucher(selectedShippingVoucher?.id === v.id ? null : v)}
                        />
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mr-4">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-gray-900 text-sm block">{v.nama_voucher}</span>
                          <p className="text-[10px] text-gray-400">{v.deskripsi}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedShippingVoucher?.id === v.id ? 'border-blue-600' : 'border-gray-200'
                        }`}>
                          {selectedShippingVoucher?.id === v.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                      </label>
                    ))}
                    {myVouchers.filter(v => v.tipe === 'shipping').length === 0 && (
                      <p className="text-xs text-gray-400 italic">Tidak ada voucher ongkir tersedia.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50">
                <button 
                  onClick={() => setShowVoucherModal(false)}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all"
                >
                  Gunakan Voucher
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
