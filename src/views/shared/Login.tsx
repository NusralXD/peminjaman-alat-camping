import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tent, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../core/api';

export default function Login({ onLogin }: { onLogin: () => Promise<any> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({ username, password });

      if (res.ok) {
        const loggedInUser = await onLogin();
        if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'petugas')) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await api.seed();
      alert('Database seeded! Use admin/admin123, petugas/petugas123, or user/user123');
    } catch (err) {
      alert('Seeding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Tent className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900">CAMP<span className="text-emerald-600">RENT</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h2>
          <p className="text-gray-500 mt-2">Masuk untuk mengelola petualanganmu</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Belum punya akun?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
            <button 
              onClick={handleSeed}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Klik di sini untuk inisialisasi data (Dev Only)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
