"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Trash2, Calendar, Mail, 
  Loader2, Inbox, ShieldCheck, User, 
  KeyRound, ChevronLeft, ChevronRight, X, UserPlus, Eye, EyeOff, UserCog,
  Camera, UploadCloud, Edit2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; 

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
  google_id: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superadmin' | 'organizer' | 'user'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // Modal Reset Password States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // STATE MODAL TAMBAH USER
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'organizer' 
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // STATE MODAL EDIT USER
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editUser, setEditUser] = useState({
    id: 0, name: '', email: '', password: '', role: 'organizer'
  });
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/admin/users');
      const json = await res.json();
      
      if (res.ok && json.success) {
        const usersArray = Array.isArray(json.data) ? json.data : (json.data?.data || []);
        setUsers(usersArray);
      } else {
        toast.error(json.message || "Gagal mengambil data pengguna.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u: UserData) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (roleFilter !== 'all') {
         matchesFilter = u.role === roleFilter;
      }
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePrevPage = () => { if (currentPage > 1) handlePageChange(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) handlePageChange(currentPage + 1); };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus akun ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const loadToast = toast.loading("Menghapus data...");
    try {
      const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || "Akun berhasil dihapus", { id: loadToast });
        fetchUsers();
      } else {
        toast.error(json.message || "Gagal menghapus akun", { id: loadToast });
      }
    } catch (error) {
      toast.error("Kesalahan sistem.", { id: loadToast });
    }
  };

  const openResetModal = (user: UserData) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Kata sandi minimal 6 karakter.');
    if (!selectedUser) return;
    setIsResetting(true);
    const loadToast = toast.loading("Mereset sandi...");

    try {
      const res = await apiFetch(`/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        setIsResetModalOpen(false);
      } else {
        toast.error(json.message || "Gagal mereset sandi", { id: loadToast });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi.', { id: loadToast });
    } finally {
      setIsResetting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 5MB!");
        return;
      }
      if (isEdit) {
        setEditAvatarFile(file);
        setEditAvatarPreview(URL.createObjectURL(file));
      } else {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    }
  };

  const submitNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.password.length < 6) return toast.error('Kata sandi minimal 6 karakter.');
    setIsAdding(true);
    const loadToast = toast.loading(`Mendaftarkan ${newUser.role}...`);

    try {
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('role', newUser.role);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await apiFetch('/admin/users', {
        method: 'POST',
        body: formData
      }); 
      
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || "Akun berhasil dibuat", { id: loadToast });
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'organizer' });
        setAvatarFile(null);
        setAvatarPreview(null);
        fetchUsers(); 
      } else {
        toast.error(json.message || "Gagal membuat akun", { id: loadToast });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi.', { id: loadToast });
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', 
      role: user.role
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(getAvatarUrl(user));
    setIsEditModalOpen(true);
  };

  // 🔥 PERBAIKAN: Method Spoofing menggunakan _method=PUT 🔥
  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser.password && editUser.password.length < 6) {
      return toast.error('Jika ingin mengubah kata sandi, minimal 6 karakter.');
    }
    
    setIsUpdating(true);
    const loadToast = toast.loading(`Memperbarui data...`);

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // 🔥 Trik agar Laravel membacanya sebagai PUT
      formData.append('name', editUser.name);
      formData.append('email', editUser.email);
      formData.append('role', editUser.role);
      
      if (editUser.password) {
        formData.append('password', editUser.password);
      }
      if (editAvatarFile) {
        formData.append('avatar', editAvatarFile);
      }

      const res = await apiFetch(`/admin/users/${editUser.id}`, {
        method: 'POST', // 🔥 Tetap dikirim sebagai POST
        body: formData
      }); 
      
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || "Data berhasil diperbarui", { id: loadToast });
        setIsEditModalOpen(false);
        fetchUsers(); 
      } else {
        toast.error(json.message || "Gagal memperbarui data", { id: loadToast });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi.', { id: loadToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const getFilterStyle = (type: string) => {
    if (roleFilter !== type) return 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50';
    if (type === 'all') return 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-bold';
    if (type === 'superadmin') return 'bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-200 font-bold';
    if (type === 'organizer') return 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-200 font-bold';
    if (type === 'user') return 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200 font-bold';
    return '';
  };

  const getRoleBadge = (role: string) => {
      if (role === 'superadmin') return (<span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-[9px] md:text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 uppercase tracking-wider shrink-0 max-w-full"><ShieldCheck size={10} className="shrink-0" /> <span className="truncate">Super Admin</span></span>);
      if (role === 'organizer') return (<span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[9px] md:text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider shrink-0 max-w-full"><UserCog size={10} className="shrink-0" /> <span className="truncate">Organizer</span></span>);
      return (<span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[9px] md:text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider shrink-0 max-w-full"><User size={10} className="shrink-0" /> <span className="truncate">Member</span></span>);
  }

  const getAvatarUrl = (user: UserData) => {
    if (user.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `${STORAGE_URL}/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eef2ff&color=4f46e5&bold=true`;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 relative pb-20 md:pb-24 w-full overflow-x-hidden min-w-0">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 mt-2 md:mt-0 gap-4 w-full min-w-0">
        <div className="w-full min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight break-words w-full">Kelola Pengguna Sistem</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 break-words w-full">Atur hak akses platform untuk Organizer dan Member.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors shrink-0 w-full sm:w-auto">
           <UserPlus size={16} className="shrink-0" /> <span className="truncate">Tambah Akun</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 w-full min-w-0">
        <div className="flex p-0.5 w-full md:w-auto bg-slate-100/80 border border-slate-200 rounded-lg overflow-x-auto custom-scrollbar min-w-0">
          {(['all', 'superadmin', 'organizer', 'user'] as const).map((type) => (
            <button key={type} onClick={() => setRoleFilter(type)} className={`flex-1 md:flex-none px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-[11px] uppercase tracking-wider rounded-md transition-all whitespace-nowrap shrink-0 ${getFilterStyle(type)}`}>
              {type === 'all' ? 'Semua' : type === 'superadmin' ? 'Superadmin' : type === 'organizer' ? 'Organizer' : 'Member'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 min-w-0">
          <Search className="pointer-events-none absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
          <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-lg md:rounded-xl border border-slate-200 bg-slate-50 py-2.5 md:py-3 pl-9 md:pl-11 pr-3 md:pr-4 text-xs md:text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors shadow-inner min-w-0"/>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden relative z-10 flex flex-col h-full min-h-[400px] w-full min-w-0">
        <div className="overflow-x-auto custom-scrollbar flex-1 w-full min-w-0">
          <table className="min-w-full divide-y divide-slate-200 min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-1/3">Pengguna</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-1/4">Role Akses</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-1/4">Bergabung</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-1/6">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              
              {loading ? (
                <tr><td colSpan={4} className="px-4 md:px-6 py-16 md:py-20 text-center"><Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-spin mx-auto mb-2 md:mb-3 shrink-0" /><p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-wider">Memuat data pengguna...</p></td></tr>
              ) : currentUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 md:px-6 py-16 md:py-24 text-center w-full min-w-0"><Inbox className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mx-auto mb-3 md:mb-4 shrink-0" strokeWidth={1.5} /><h3 className="text-sm md:text-base font-bold text-slate-900 break-words w-full">Tidak ada pengguna</h3><p className="text-xs md:text-sm text-slate-500 mt-1 break-words w-full">Coba ubah filter atau kata kunci pencarian Anda.</p></td></tr>
              ) : (
                currentUsers.map((user: UserData) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0 max-w-[200px] md:max-w-[300px]">
                      <div className="flex items-center min-w-0">
                        <div className="h-9 w-9 md:h-11 md:w-11 shrink-0 rounded-full border border-slate-200 overflow-hidden bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          <img src={getAvatarUrl(user)} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0 flex-1">
                          <div className="text-xs md:text-sm font-bold text-slate-900 truncate w-full" title={user.name}>{user.name}</div>
                          <div className="text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1 md:gap-1.5 uppercase tracking-wider min-w-0 w-full" title={user.email}>
                            <Mail size={10} className="text-slate-400 md:w-3 md:h-3 shrink-0" /><span className="truncate w-full">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {getRoleBadge(user.role)}
                        {user.google_id && (<span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[8px] md:text-[9px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20 uppercase tracking-wider shrink-0">Google Auth</span>)}
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-slate-900 font-bold">{new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 md:mt-1 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar size={10} className="md:w-3 md:h-3 text-slate-400 shrink-0" />{new Date(user.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 md:gap-2">
                        <button onClick={() => openEditModal(user)} className="inline-flex items-center justify-center p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-lg transition-colors shadow-sm shrink-0" title="Edit Akun">
                          <Edit2 size={14} className="md:w-4 md:h-4 shrink-0" />
                        </button>

                        <button onClick={() => openResetModal(user)} className="inline-flex items-center justify-center p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm shrink-0" title="Reset Sandi Manual">
                          <KeyRound size={14} className="md:w-4 md:h-4 shrink-0" />
                        </button>

                        {user.role !== 'superadmin' && (
                          <button onClick={() => handleDelete(user.id, user.name)} className="inline-flex items-center justify-center p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-sm shrink-0" title="Hapus Akun">
                            <Trash2 size={14} className="md:w-4 md:h-4 shrink-0" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 md:px-6 py-3 md:py-4 gap-3 w-full min-w-0">
            <div className="hidden sm:block min-w-0">
              <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate w-full">Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> dari <span className="font-bold text-slate-900">{filteredUsers.length}</span> hasil</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"><ChevronLeft size={14} className="shrink-0" /></button>
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-slate-700 shadow-sm min-w-[60px] md:min-w-[80px] text-center uppercase tracking-widest shrink-0">{currentPage} / {totalPages || 1}</div>
              <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"><ChevronRight size={14} className="shrink-0" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL RESET KATA SANDI */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isResetModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 w-full min-w-0">
            <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 min-w-0">
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full min-w-0">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base min-w-0 w-full"><div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><KeyRound size={16} /></div><span className="truncate">Reset Kata Sandi</span></h3>
                <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 md:p-1.5 rounded-md border border-slate-200 shadow-sm shrink-0"><X size={16} className="shrink-0" /></button>
              </div>
              <form onSubmit={submitResetPassword} className="p-5 md:p-6 w-full min-w-0">
                <div className="mb-5 md:mb-6 p-3 md:p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[11px] md:text-xs font-medium leading-relaxed flex items-start gap-2.5 md:gap-3 w-full min-w-0">
                  <ShieldCheck className="text-amber-500 shrink-0 mt-0.5 md:w-5 md:h-5" size={16} />
                  <div className="break-words w-full">Anda akan mengganti sandi untuk akun <span className="font-bold text-amber-900">{selectedUser.name}</span>. Berikan sandi ini kepada pemilik akun terkait.</div>
                </div>
                <div className="mb-6 md:mb-8 w-full min-w-0">
                  <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wide w-full">Kata Sandi Baru</label>
                  <div className="relative w-full min-w-0">
                    <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Minimal 6 karakter" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 md:py-3 pl-4 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm min-w-0"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"><EyeOff size={16} className="shrink-0" /></button>
                  </div>
                </div>
                <div className="flex gap-2.5 md:gap-3 justify-end pt-4 border-t border-slate-100 w-full min-w-0">
                  <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg md:rounded-xl transition-colors shrink-0">Batal</button>
                  <button type="submit" disabled={isResetting || newPassword.length < 6} className="px-5 md:px-6 py-2 md:py-2.5 bg-indigo-600 text-white text-xs md:text-sm font-semibold rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 min-w-0">{isResetting ? <Loader2 size={14} className="animate-spin shrink-0" /> : null} <span className="truncate">Simpan Sandi</span></button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL TAMBAH USER / ORGANIZER BARU */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 w-full min-w-0">
            <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 min-w-0">
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full min-w-0">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base min-w-0 w-full"><div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><UserPlus size={16} className="shrink-0" /></div><span className="truncate">Registrasi Akun Baru</span></h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 md:p-1.5 rounded-md border border-slate-200 shadow-sm shrink-0"><X size={16} className="shrink-0" /></button>
              </div>
              <form onSubmit={submitNewUser} className="p-5 md:p-6 space-y-4 w-full min-w-0">
                
                <div className="flex flex-col items-center justify-center mb-2 w-full min-w-0">
                  <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-indigo-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50 shadow-sm shrink-0">
                      {avatarPreview ? (<img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />) : (
                        <div className="flex flex-col items-center text-indigo-400 group-hover:text-indigo-500"><Camera size={24} className="mb-1 shrink-0" /><span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate">Logo/Foto</span></div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm shrink-0"><UploadCloud className="text-white shrink-0" size={20} /></div>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, false)} />
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate w-full text-center">Maks. 5MB (JPG/PNG)</p>
                  {avatarFile && <button type="button" onClick={() => {setAvatarFile(null); setAvatarPreview(null);}} className="text-[10px] text-rose-500 mt-1 font-bold hover:underline shrink-0">Hapus Foto</button>}
                </div>

                <div className="grid grid-cols-3 gap-2 w-full min-w-0">
                   {['superadmin', 'organizer', 'user'].map(role => (
                     <button key={role} type="button" onClick={() => setNewUser({...newUser, role})} className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all capitalize min-w-0 w-full px-1 truncate ${newUser.role === role ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{role}</button>
                   ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 w-full min-w-0">
                  <div className="min-w-0 w-full"><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Nama Lengkap / Instansi</label><input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Misal: BEM Unsoed" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-w-0"/></div>
                  <div className="min-w-0 w-full"><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Alamat Email</label><input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="admin@bem.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-w-0"/></div>
                </div>

                <div className="pt-2 pb-4 w-full min-w-0">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Kata Sandi Awal</label>
                  <div className="relative w-full min-w-0">
                    <input type={showPassword ? "text" : "password"} required minLength={6} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Buatkan kata sandi sementara" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-w-0"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"><EyeOff size={16} className="shrink-0" /></button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 w-full min-w-0">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shrink-0">Batal</button>
                  <button type="submit" disabled={isAdding || newUser.password.length < 6} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 shrink-0 min-w-0"><UserPlus size={14} className="shrink-0" /> <span className="truncate">Daftarkan Akun</span></button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 🔥 MODAL EDIT USER 🔥 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 w-full min-w-0">
            <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 min-w-0">
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full min-w-0">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base min-w-0 w-full"><div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0"><Edit2 size={16} className="shrink-0" /></div><span className="truncate">Edit Pengguna</span></h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 md:p-1.5 rounded-md border border-slate-200 shadow-sm shrink-0"><X size={16} className="shrink-0" /></button>
              </div>
              <form onSubmit={submitEditUser} className="p-5 md:p-6 space-y-4 w-full min-w-0">
                
                <div className="flex flex-col items-center justify-center mb-2 w-full min-w-0">
                  <label htmlFor="edit-avatar-upload" className="relative group cursor-pointer">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-amber-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-amber-400 group-hover:bg-amber-50 shadow-sm shrink-0">
                      {editAvatarPreview ? (<img src={editAvatarPreview} alt="Preview" className="w-full h-full object-cover" />) : (
                        <div className="flex flex-col items-center text-amber-400 group-hover:text-amber-500"><Camera size={24} className="mb-1 shrink-0" /><span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate">Logo/Foto</span></div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm shrink-0"><UploadCloud className="text-white shrink-0" size={20} /></div>
                    <input id="edit-avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, true)} />
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate w-full text-center">Maks. 5MB (JPG/PNG)</p>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full min-w-0">
                   {['superadmin', 'organizer', 'user'].map(role => (
                     <button key={role} type="button" onClick={() => setEditUser({...editUser, role})} className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all capitalize min-w-0 w-full px-1 truncate ${editUser.role === role ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{role}</button>
                   ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 w-full min-w-0">
                  <div className="min-w-0 w-full"><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Nama Lengkap</label><input type="text" required value={editUser.name} onChange={(e) => setEditUser({...editUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-w-0"/></div>
                  <div className="min-w-0 w-full"><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Alamat Email</label><input type="email" required value={editUser.email} onChange={(e) => setEditUser({...editUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-w-0"/></div>
                </div>

                <div className="pt-2 pb-4 w-full min-w-0">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide truncate w-full">Kata Sandi (Opsional)</label>
                  <div className="relative w-full min-w-0">
                    <input type={showPassword ? "text" : "password"} value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} placeholder="Biarkan kosong jika tidak ingin mengubah sandi" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-w-0"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"><EyeOff size={16} className="shrink-0" /></button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 w-full min-w-0">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shrink-0">Batal</button>
                  <button type="submit" disabled={isUpdating} className="px-6 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 shrink-0 min-w-0">{isUpdating ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Edit2 size={14} className="shrink-0" />} <span className="truncate">Simpan Perubahan</span></button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}