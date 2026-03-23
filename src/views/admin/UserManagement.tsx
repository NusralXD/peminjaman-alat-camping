import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, Trash2, Edit3, Shield, Mail, Calendar, User as UserIcon, Phone, X, Lock, MapPin, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../../core/api';

export default function UserManagement({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    role: 'user',
    email: '',
    phone: '',
    address: '',
    state: '',
    postal_code: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingUser(item);
      setFormData({
        username: item.username,
        password: '', // Don't show password
        nama_lengkap: item.nama_lengkap,
        role: item.role,
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        state: item.state || '',
        postal_code: item.postal_code || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        nama_lengkap: '',
        role: 'user',
        email: '',
        phone: '',
        address: '',
        state: '',
        postal_code: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingUser) {
        res = await api.updateUser(editingUser.id, formData);
      } else {
        res = await api.register(formData);
      }

      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan data');
      }
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      const res = await api.deleteUser(id);
      if (res.ok) fetchUsers();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Manajemen User</h1>
          <p className="text-white/60 text-lg">Kelola hak akses dan data pengguna sistem</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center space-x-3 shadow-lg shadow-emerald-500/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah User</span>
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input 
          type="text" 
          placeholder="Cari user..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Alamat</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider">Terdaftar</th>
                <th className="px-8 py-6 text-white/40 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{u.nama_lengkap}</p>
                        <p className="text-white/40 text-xs flex items-center space-x-1 mt-1">
                          <Mail className="w-3 h-3" />
                          <span>{u.email || u.username}</span>
                        </p>
                        {u.phone && (
                          <p className="text-white/40 text-[10px] flex items-center space-x-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-emerald-400/60" />
                            <span>{u.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[200px]">
                      <p className="text-white/60 text-xs truncate" title={u.address}>{u.address || '-'}</p>
                      {u.postal_code && (
                        <p className="text-white/40 text-[10px] mt-1">{u.postal_code} {u.state}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      u.role === 'petugas' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-white/60 text-sm flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>{format(new Date(u.created_at), 'dd MMM yyyy')}</span>
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
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
              className="relative w-full max-w-3xl bg-[#1e293b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <UserIcon className="w-3 h-3" />
                      <span>Username</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Lock className="w-3 h-3" />
                      <span>Password {editingUser && '(Kosongkan jika tidak diubah)'}</span>
                    </label>
                    <input 
                      required={!editingUser}
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <UserIcon className="w-3 h-3" />
                      <span>Nama Lengkap</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Nama Lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Shield className="w-3 h-3" />
                      <span>Role</span>
                    </label>
                    <select 
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      <option value="user" className="bg-[#1e293b]">User</option>
                      <option value="petugas" className="bg-[#1e293b]">Petugas</option>
                      <option value="admin" className="bg-[#1e293b]">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Phone className="w-3 h-3" />
                      <span>No. Telepon</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="0812..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Alamat Lengkap</span>
                  </label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all h-24 resize-none"
                    placeholder="Alamat lengkap..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <MapPin className="w-3 h-3" />
                      <span>Provinsi / Kota</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Jawa Barat"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                      <Hash className="w-3 h-3" />
                      <span>Kode Pos</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="12345"
                    />
                  </div>
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
                    {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
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
