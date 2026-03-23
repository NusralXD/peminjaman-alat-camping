import { Tent, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Tent className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">PONDOK <span className="text-emerald-600">RENT</span></span>
              </div>
              <span className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-0.5">Camping & Outdoor Equipment Rental</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Penyedia layanan sewa perlengkapan outdoor terlengkap dan terpercaya. Siap menemani petualangan alam bebas Anda dengan peralatan berkualitas premium.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-8">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/katalog" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Katalog Produk</Link></li>
              <li><Link to="/katalog" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Rental Simulation</Link></li>
              <li><Link to="/katalog" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Price List</Link></li>
              <li><Link to="/katalog" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-8">Categories</h4>
            <ul className="space-y-4">
              <li><Link to="/katalog?category=Tenda" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Tenda Camping</Link></li>
              <li><Link to="/katalog?category=Carrier" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Tas Carrier</Link></li>
              <li><Link to="/katalog?category=Cooking Set" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Peralatan Masak</Link></li>
              <li><Link to="/katalog?category=Lampu" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">Penerangan</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-8">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-500 text-sm">Jl. Petualangan No. 123, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-500 text-sm">+62 812 3456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-500 text-sm">hello@pondokrent.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">
            © {currentYear} PONDOK RENT. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-gray-900 text-[10px] font-bold tracking-wider uppercase transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-900 text-[10px] font-bold tracking-wider uppercase transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
